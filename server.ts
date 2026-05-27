import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
// @ts-ignore
import worker from './src/index.js';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize Gemini client on the server as required by gemini-api skill
  const geminiApiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;
  
  if (geminiApiKey) {
    ai = new GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log('[Gemini] Server-side client initialized successfully');
  } else {
    console.warn('[Gemini] WARNING: GEMINI_API_KEY environment variable is not set. Chat assistant will run in smart simulated mode.');
  }

  // Server-side Channel Content Predictor Endpoint utilizing Mistral or Gemini with active Vision support
  app.post('/api/predict-channel-content', express.json({ limit: '10mb' }), async (req, res) => {
    try {
      const { channelId, channelName, category, frame } = req.body;
      if (!channelName) {
        res.status(400).json({ error: 'channelName is required' });
        return;
      }

      const activeCategory = category || 'movies';
      const hasFrame = !!frame;

      // Build specific prompts depending on whether a live screenshot is available
      let prompt = "";
      if (hasFrame) {
        prompt = `Actúas como un ojo inteligente de Inteligencia Artificial para sincronizar y verificar en tiempo real exactamente qué película, serie o evento real se está emitiendo en el canal "${channelName}" (categoría de emisión: "${activeCategory}").
Analiza detalladamente este screenshot del stream en directo suministrado en base64. 
Fíjate en las caras de actores reconocibles, los trajes, los subtítulos impresos, marcas de agua del canal, logos de TV en las esquinas o cualquier texto en pantalla.
Determina con precisión qué obra audiovisual (película, serie, etc.) se trata.

IMPORTANTE: Responde ESTRICTAMENTE con un texto JSON plano (sin formato markdown \`\`\`json, sin comentarios posteriores) utilizando este esquema:
{
  "title": "Nombre de la película o serie identificada (ej: 'Avatar')",
  "year": "Año real de lanzamiento (ej: '2009')",
  "overview": "Una sinopsis corta y emocionante en español (máx. 280 caracteres) de lo que trata la película confirmada por la imagen.",
  "rating": 8.0,
  "genres": ["Género 1", "Género 2"]
}`;
      } else {
        prompt = `Actúas como un motor súper inteligente de Inteligencia Artificial para predecir qué película o programa de TV real se está emitiendo en vivo en EDGE IPTV.
El usuario acaba de sintonizar el canal "${channelName}" (categoría: "${activeCategory}").
Tu trabajo es elegir una película o serie REAL existente sumamente popular que combine perfectamente con la temática o categoría del canal (${activeCategory}). Por ejemplo:
- Si el canal es "Cine terror", elige éxitos de horror reales como "Hereditary", "El Conjuro", "Alien", "Siniestro", "It", "A Quiet Place" o "The Thing".
- Si es "Cine adrenalina" o de acción, elige éxitos como "John Wick", "Gladiador", "Duro de Matar", "Mad Max: Fury Road", "Misión Imposible" o "The Dark Knight".
- Si es "Cine comedia", elige películas como "¿Qué pasó hangover?", "Superbad", "Son como niños" o "La Máscara".

Envía tu respuesta ESTRICTAMENTE en este formato JSON (sin rodeos, sin comentarios, sin formato markdown, solo el texto JSON crudo y directo):
{
  "title": "Título exacto de la película",
  "year": "Año de estreno (como string de 4 cifras, ej: '2019')",
  "overview": "Una sinopsis corta y emocionante en español (máximo 300 caracteres) de lo que trata.",
  "rating": 7.8,
  "genres": ["Género1", "Género2"]
}`;
      }

      let aiResultText = "";
      const mistralKey = process.env.MISTRAL_API_KEY || process.env.MISTRAL_API;

      if (mistralKey) {
        console.log(`[AI Predictor] Executing with Mistral API for channel: ${channelName} (Has Frame: ${hasFrame})`);
        try {
          // If we have a frame, we use the vision model pixtral-12b-2409, else we fall back to mistral-small
          const mistralModel = hasFrame ? 'pixtral-12b-2409' : 'mistral-small';
          const messageContent: any = hasFrame 
            ? [
                { type: 'text', text: prompt },
                { type: 'image_url', image_url: `data:image/jpeg;base64,${frame}` }
              ]
            : prompt;

          const mistralResp = await fetch('https://api.mistral.ai/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${mistralKey}` },
            body: JSON.stringify({
              model: mistralModel,
              messages: [
                { role: 'user', content: messageContent }
              ],
              temperature: 0.15,
              max_tokens: 500
            })
          });
          const mistralData = await mistralResp.json() as any;
          aiResultText = mistralData.choices?.[0]?.message?.content || "";
        } catch (mistralErr) {
          console.error("[AI Predictor] Mistral API call failed, falling back to Gemini:", mistralErr);
        }
      }

      // Fallback or default to Gemini if Mistral was not used or failed
      if (!aiResultText && ai) {
        console.log(`[AI Predictor] Executing with Gemini 3.5 Flash for channel: ${channelName} (Has Frame: ${hasFrame})`);
        try {
          let reqContents: any = prompt;

          if (hasFrame) {
            const imagePart = {
              inlineData: {
                mimeType: "image/jpeg",
                data: frame,
              },
            };
            const textPart = {
              text: prompt,
            };
            reqContents = { parts: [imagePart, textPart] };
          }

          const response = await ai.models.generateContent({
            model: 'gemini-3.5-flash',
            contents: reqContents,
            config: {
              temperature: 0.15,
            }
          });
          aiResultText = response.text || "";
        } catch (geminiErr) {
          console.error("[AI Predictor] Gemini API call failed:", geminiErr);
        }
      }

      // Clean up markdown block wraps if present
      if (aiResultText) {
        const jsonMatch = aiResultText.match(/\{[\s\S]*?\}/);
        if (jsonMatch) {
          aiResultText = jsonMatch[0];
        }
      }

      let resultJson: any = {
        title: "Película Excelente",
        year: "2021",
        overview: "Disfruta de la mejor calidad cinematográfica de acción, drama y terror en este canal premium, sincronizado por satélite AI.",
        rating: 8.0,
        genres: ["Cine"],
        source: "Predicción Genérica"
      };

      if (aiResultText) {
        try {
          resultJson = JSON.parse(aiResultText);
          resultJson.source = hasFrame
            ? (mistralKey ? "Mistral Vision Real-Time Live Sync" : "Gemini 3.5 Vision Real-Time Live Sync")
            : (mistralKey ? "Mistral AI Predictive Core" : "Gemini 3.5 Satellite Predictor");
        } catch (parseErr) {
          console.warn("[AI Predictor] JSON Parse exception:", parseErr, "Raw Text:", aiResultText);
        }
      }

      // Query TMDB to enrich the movie with authentic graphic assets (Poster, Backdrop)
      const tmdbKey = process.env.TMDB_API_KEY || "47deb77a33325066c4710229c2481f05";
      const tmdbUrl = `https://api.themoviedb.org/3/search/movie?api_key=${tmdbKey}&query=${encodeURIComponent(resultJson.title)}&language=es`;
      
      try {
        const tmdbResp = await fetch(tmdbUrl);
        if (tmdbResp.ok) {
          const tmdbData = await tmdbResp.json() as any;
          if (tmdbData.results && tmdbData.results.length > 0) {
            let bestMatch = tmdbData.results[0];
            if (resultJson.year) {
              const matched = tmdbData.results.find((m: any) => m.release_date && m.release_date.startsWith(resultJson.year));
              if (matched) bestMatch = matched;
            }
            
            resultJson.poster = bestMatch.poster_path ? `https://image.tmdb.org/t/p/w500${bestMatch.poster_path}` : null;
            resultJson.backdrop = bestMatch.backdrop_path ? `https://image.tmdb.org/t/p/w780${bestMatch.backdrop_path}` : null;
            if (bestMatch.overview && bestMatch.overview.length > 25) {
              resultJson.overview = bestMatch.overview;
            }
            if (bestMatch.vote_average) {
              resultJson.rating = bestMatch.vote_average;
            }
            resultJson.tmdb_id = bestMatch.id;
          }
        }
      } catch (tmdbErr) {
        console.warn("[AI Predictor] TMDB enrichment failed:", tmdbErr);
      }

      // Return the completed prediction object
      res.json(resultJson);
    } catch (error: any) {
      console.error('[AI Predictor] Exception in predictor route:', error);
      res.status(500).json({ error: error.message || 'Error executing AI content prediction' });
    }
  });

  // Server-side JSON endpoint for the Gemini assistant - defined BEFORE raw body parses
  app.post('/api/gemini-chat', express.json(), async (req, res) => {
    try {
      const { message, channelName, category, channelsList, currentProgram } = req.body;
      
      if (!message) {
        res.status(400).json({ error: 'Message parameter is required' });
        return;
      }

      const activeChannel = channelName || 'Ninguno';
      const activeCategory = category || 'Todos';
      const availableList = Array.isArray(channelsList) ? channelsList.slice(0, 15) : [];

      let currentProgramInfo = "Información del programa sintonizado: No disponible en los metadatos estáticos.";
      if (currentProgram) {
        currentProgramInfo = `Información de la película/serie actual que el usuario está viendo (Predicción IA Satélite):
- Título: "${currentProgram.title || 'Sintonizando'}"
- Año de estreno: ${currentProgram.year || 'N/A'}
- Clasificación/Rating: ${currentProgram.rating ? currentProgram.rating.toFixed(1) + '/10' : 'N/A'}
- Sinopsis/Descripción: "${currentProgram.overview || 'Sinopsis no disponible en este momento.'}"
- Canal: "${activeChannel}"
- Categoría: "${activeCategory}"
- Fuente de verificación: "${currentProgram.source || 'IPTV Grid'}"`;
      }

      if (ai) {
        const systemPrompt = `Eres "Edge Vision IA", el asistente de inteligencia artificial para "Edge IPTV" optimizado de forma satelital.
Tu propósito es ayudar a los espectadores con recomendaciones de canales, información de programación y preguntas generales de entretenimiento.

Canal que el usuario está sintonizando actualmente: "${activeChannel}" (Categoría: "${activeCategory}").
${currentProgramInfo}

Canales reales disponibles en nuestra parrilla de programación para sugerir:
${availableList.map(c => `- ${c.name} (Categoría: ${c.category}, ID: ${c.id})`).join('\n')}

INSTRUCCIONES CLAVE:
1. Responde en el mismo idioma en el que te pregunta el usuario (usualmente español).
2. Sé conciso, amigable y sumamente entusiasta. Tu respuesta debe tener un máximo de 3 a 4 oraciones.
3. SIEMPRE sugiere canales de la lista anterior que coincidan con los gustos del usuario. NUNCA inventes nombres de canales o sugerencias que no estén en la lista de "Canales reales disponibles" si te piden recomendaciones de canales.
4. Resalta los nombres de canales y categorías en **negrita**.
5. Si el usuario te pregunta por lo que está dando en el canal (o pide sinopsis, año o detalles de la película), responde con total seguridad utilizando la información de la sección de "Información de la película/serie actual" que de forma analítica hemos extraído para él.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: message,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.7,
          }
        });

        res.json({ response: response.text });
      } else {
        // High quality local fallback if apiKey is not registered yet
        const msgLower = message.toLowerCase();
        let fallbackText = '';
        
        if (msgLower.includes('recomienda') || msgLower.includes('similar') || msgLower.includes('pelicula') || msgLower.includes('canal')) {
          fallbackText = `¡Hola! Como estás sintonizando **${activeChannel}**, te sugiero explorar canales en la misma categoría como **Cine Premiere** o **Adrenalina Pura**. Ambos están en línea ahora mismo en **Edge IPTV**. (Nota: Configura tu clave GEMINI_API_KEY para habilitar análisis completo con IA).`;
        } else {
          fallbackText = `¡Hola! Soy tu asistente de entretenimiento. Actualmente estás viendo **${activeChannel}** (${activeCategory}). ¿Te gustaría que te recomiende otros canales parecidos de nuestra grilla de películas, música o niños?`;
        }
        res.json({ response: fallbackText });
      }
    } catch (error: any) {
      console.error('Gemini chat handler error:', error);
      res.status(500).json({ error: error.message || 'Server Gemini Exception' });
    }
  });

  // Body parser ONLY for non-Get requests targeting API or Proxy
  app.use('/proxy', express.raw({ type: '*/*', limit: '50mb' }));
  app.use('/api', express.raw({ type: '*/*', limit: '50mb' }));

  async function handleWorkerRequest(req: express.Request, res: express.Response) {
    try {
      const protoHeader = req.headers['x-forwarded-proto'];
      let proto = (Array.isArray(protoHeader) ? protoHeader[0] : protoHeader) || req.protocol || 'http';
      const host = req.get('host') || 'localhost';
      
      // If we are on cloud run or public domains (non-localhost), force HTTPS to avoid browser Mixed Content blocks
      if (!host.includes('localhost') && !host.includes('127.0.0.1')) {
        proto = 'https';
      }
      
      const fullUrl = `${proto}://${host}${req.originalUrl}`;
      const headers = new Headers();
      
      for (const [key, val] of Object.entries(req.headers)) {
        if (val !== undefined) {
          if (Array.isArray(val)) {
            val.forEach(v => headers.append(key, v));
          } else {
            headers.set(key, val);
          }
        }
      }

      const requestOptions: RequestInit = {
        method: req.method,
        headers: headers,
      };

      if (req.method !== 'GET' && req.method !== 'HEAD' && req.body && req.body.length > 0) {
        requestOptions.body = req.body;
      }

      const webRequest = new Request(fullUrl, requestOptions);

      const env = {
        TMDB_API_KEY: process.env.TMDB_API_KEY || "47deb77a33325066c4710229c2481f05",
        TMDB_ACCESS_TOKEN: process.env.TMDB_ACCESS_TOKEN || "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0N2RlYjc3YTMzMzI1MDY2YzQ3MTAyMjljMjQ4MWYwNSIsIm5iZiI6MTc3OTkwMjMyMi4wMDEsInN1YiI6IjZhMTcyNzcxNjQ3NTIwZTJkOGVhNGVlNiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.OpDUu5hHEywOpCRJk_5PMXInZAhh2oLHZSJQgKubns4",
        MISTRAL_API: process.env.MISTRAL_API || process.env.MISTRAL_API_KEY || "",
        MISTRAL_API_KEY: process.env.MISTRAL_API_KEY || process.env.MISTRAL_API || "",
        GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
        ...process.env
      };

      const webResponse = await worker.fetch(webRequest, env);
      res.status(webResponse.status);

      webResponse.headers.forEach((val, key) => {
        const kLower = key.toLowerCase();
        if (kLower !== 'transfer-encoding' && kLower !== 'content-encoding') {
          res.set(key, val);
        }
      });

      const arrayBuffer = await webResponse.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      res.send(buffer);
    } catch (error: any) {
      console.error('Error in Express worker proxy handler:', error);
      res.status(500).send(`Server Express Worker Exception: ${error.message}`);
    }
  }

  // Forward CORS proxy and APIs to Worker
  app.all('/proxy', handleWorkerRequest);
  app.all('/api/*', handleWorkerRequest);

  // Serve static assets out of public folder directly
  app.use(express.static(path.join(process.cwd(), 'public')));

  // Vite development middleware or production static site server
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('[Express] Mounted Vite Development Server Middleware');
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('[Express] Serving compiled files out of /dist');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Sandbox Express Server listening at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Server boot failed:', err);
});
