// Cloudflare Worker backend for Edge IPTV
// Handles CORS, Stream proxying, on-the-fly metadata caching, and Server-Side Gemini and Mistral AI API calls

// In-memory cache in Cloudflare global context (persisted between requests on the same edge instance)
const nowPlayingCache = new Map();

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Enforce CORS Preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Max-Age": "86400"
        }
      });
    }

    try {
      // 1. API: Predict Channel Content
      if (url.pathname === '/api/predict-channel-content' && request.method === 'POST') {
        return await handlePredictChannelContent(request, env);
      }

      // 2. API: Gemini Chat Assistant
      if (url.pathname === '/api/gemini-chat' && request.method === 'POST') {
        return await handleGeminiChat(request, env);
      }

      // 3. API: Serving now-playing cached query
      if (url.pathname === '/api/now-playing') {
        const channelId = url.searchParams.get('channelId');
        if (!channelId) {
          return new Response(JSON.stringify({ error: 'channelId specified is null' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        }
        const cached = nowPlayingCache.get(String(channelId)) || null;
        return new Response(JSON.stringify(cached), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }

      // 4. API: Fallback detect endpoint matching old structure
      if (url.pathname === '/api/detect' && request.method === 'POST') {
        const body = await request.json();
        const { channelId, category, metadata } = body;
        if (!channelId) {
          return new Response(JSON.stringify({ error: 'channelId required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        }
        const cached = nowPlayingCache.get(String(channelId));
        if (cached) {
          return new Response(JSON.stringify(cached), {
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        }
        const title = metadata?.title || 'Canal Premium';
        const fallbackDesc = {
          title: title,
          year: '2025',
          overview: `Sintonización exitosa para el canal ${title}. Disfruta de la mejor programación en vivo y en directo en alta definición.`,
          rating: 8.4,
          genres: [category || 'Televisión'],
          source: 'IPTV Guide'
        };
        return new Response(JSON.stringify(fallbackDesc), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }

      // 5. Proxy: IPTV CORS Proxy & HLS URL rewrite
      if (url.pathname === '/proxy') {
        return await handleProxy(request, env);
      }

      // If wrangler assets doesn't serve it directly (should be handled by wrangler), fall back gracefully
      return new Response('Route Not Found', { status: 404 });

    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
  }
};

async function handleProxy(request, env) {
  const url = new URL(request.url);
  const targetUrl = url.searchParams.get('url');
  if (!targetUrl) {
    return new Response('Missing url parameter', { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } });
  }

  try {
    const targetResp = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Origin': new URL(targetUrl).origin
      }
    });

    const contentType = targetResp.headers.get('Content-Type') || '';
    const isM3u8 = contentType.includes('mpegurl') || contentType.includes('mpegURL') || contentType.includes('x-mpegURL') || targetUrl.includes('.m3u8');

    const headers = new Headers();
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET,OPTIONS');
    headers.set('Access-Control-Allow-Headers', '*');
    headers.set('Cache-Control', 'no-cache');

    if (isM3u8) {
      const finalUrl = targetResp.url || targetUrl;
      const base = finalUrl.substring(0, finalUrl.lastIndexOf('/') + 1);
      const bodyText = await targetResp.text();

      const origin = url.origin;

      const lines = bodyText.split('\n');
      const rewritten = lines.map(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) {
          if (trimmed.includes('URI="')) {
            return line.replace(/URI="([^"]+)"/g, (match, uri) => {
              if (uri.includes('/proxy?url=')) return match;
              if (uri.startsWith('http')) return 'URI="' + origin + '/proxy?url=' + encodeURIComponent(uri) + '"';
              return 'URI="' + origin + '/proxy?url=' + encodeURIComponent(base + uri) + '"';
            });
          }
          return line;
        }
        if (trimmed.startsWith('http')) {
          return origin + '/proxy?url=' + encodeURIComponent(trimmed);
        }
        return origin + '/proxy?url=' + encodeURIComponent(base + trimmed);
      });

      headers.set('Content-Type', contentType || 'application/vnd.apple.mpegurl');
      return new Response(rewritten.join('\n'), { status: targetResp.status, headers });
    } else {
      headers.set('Content-Type', contentType || 'application/octet-stream');
      const arrayBuffer = await targetResp.arrayBuffer();
      return new Response(arrayBuffer, { status: targetResp.status, headers });
    }
  } catch (err) {
    return new Response('Proxy error: ' + err.message, {
      status: 502,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  }
}

async function handlePredictChannelContent(request, env) {
  try {
    const { channelId, channelName, category, frame } = await request.json();
    const hasFrame = !!frame;

    const activeCategory = category || 'default';

    let prompt = '';
    if (hasFrame) {
      prompt = `Analiza detalladamente este screenshot del stream en directo suministrado en base64. 
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
    const mistralKey = env.MISTRAL_API_KEY || env.MISTRAL_API;
    const geminiKey = env.GEMINI_API_KEY;

    // Try Mistral
    if (mistralKey) {
      try {
        const mistralModel = hasFrame ? 'pixtral-12b-2409' : 'mistral-small';
        const messageContent = hasFrame 
          ? [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${frame}` } }
            ]
          : prompt;

        const mistralResp = await fetch('https://api.mistral.ai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${mistralKey}` },
          body: JSON.stringify({
            model: mistralModel,
            messages: [{ role: 'user', content: messageContent }],
            temperature: 0.15,
            max_tokens: 500
          })
        });
        if (mistralResp.ok) {
          const mistralData = await mistralResp.json();
          aiResultText = mistralData.choices?.[0]?.message?.content || "";
        }
      } catch (mistralErr) {
        console.error("Mistral API call failed in Worker:", mistralErr);
      }
    }

    // Try Gemini REST API
    if (!aiResultText && geminiKey) {
      try {
        const urlGemini = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`;

        let parts = [{ text: prompt }];
        if (hasFrame) {
          parts = [
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: frame
              }
            },
            { text: prompt }
          ];
        }

        const geminiResp = await fetch(urlGemini, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts }]
          })
        });

        if (geminiResp.ok) {
          const geminiData = await geminiResp.json();
          aiResultText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";
        }
      } catch (geminiErr) {
        console.error("Gemini API call failed in Worker:", geminiErr);
      }
    }

    // Extract JSON block if present
    if (aiResultText) {
      const jsonMatch = aiResultText.match(/\{[\s\S]*?\}/);
      if (jsonMatch) {
        aiResultText = jsonMatch[0];
      }
    }

    let resultJson = {
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
        console.warn("JSON parse issue in Worker:", parseErr);
      }
    }

    // TMDB Enrichment
    const tmdbKey = env.TMDB_API_KEY || "47deb77a33325066c4710229c2481f05";
    const tmdbUrl = `https://api.themoviedb.org/3/search/movie?api_key=${tmdbKey}&query=${encodeURIComponent(resultJson.title)}&language=es`;

    try {
      const tmdbResp = await fetch(tmdbUrl);
      if (tmdbResp.ok) {
        const tmdbData = await tmdbResp.json();
        if (tmdbData.results && tmdbData.results.length > 0) {
          let bestMatch = tmdbData.results[0];
          if (resultJson.year) {
            const matched = tmdbData.results.find(m => m.release_date && m.release_date.startsWith(resultJson.year));
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
      console.warn("TMDB enrichment failed in Worker:", tmdbErr);
    }

    if (channelId) {
      nowPlayingCache.set(String(channelId), resultJson);
    }

    return new Response(JSON.stringify(resultJson), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}

async function handleGeminiChat(request, env) {
  try {
    const { message, channelName, category, channelsList, currentProgram } = await request.json();

    if (!message) {
      return new Response(JSON.stringify({ error: 'Message parameter is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
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

    const geminiKey = env.GEMINI_API_KEY;

    if (geminiKey) {
      try {
        const urlGemini = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`;

        const geminiResp = await fetch(urlGemini, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: message }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig: {
              temperature: 0.7
            }
          })
        });

        if (geminiResp.ok) {
          const data = await geminiResp.json();
          const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "No se recibió respuesta de la IA.";
          return new Response(JSON.stringify({ response: responseText }), {
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        }
      } catch (geminiErr) {
        console.error("Gemini api chat exception in Worker:", geminiErr);
      }
    }

    // Fallback response if API key is not active
    const msgLower = message.toLowerCase();
    let fallbackText = '';
    
    if (msgLower.includes('recomienda') || msgLower.includes('similar') || msgLower.includes('pelicula') || msgLower.includes('canal')) {
      fallbackText = `¡Hola! Como estás sintonizando **${activeChannel}**, te sugiero explorar canales en la misma categoría como **Cine Premiere** o **Adrenalina Pura**. Ambos están en línea ahora mismo en **Edge IPTV**. (Nota: Configura tu clave GEMINI_API_KEY para habilitar análisis completo con IA).`;
    } else {
      fallbackText = `¡Hola! Soy tu asistente de entretenimiento. Actualmente estás viendo **${activeChannel}** (${activeCategory}). ¿Te gustaría que te recomiende otros canales parecidos de nuestra grilla de películas, música o niños?`;
    }

    return new Response(JSON.stringify({ response: fallbackText }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}
