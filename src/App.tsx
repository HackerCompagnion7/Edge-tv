import React, { useState, useEffect, useRef, useMemo } from 'react';
import Hls from 'hls.js';
import { 
  Play, Pause, Volume2, VolumeX, Maximize, Search, Sparkles, 
  RotateCcw, SkipForward, List, Tv, Flame, Activity, ChevronRight, 
  Info, X, Radio, ArrowRight, Volume1, Clock, ExternalLink, Send,
  Home as HomeIcon, Trophy, Newspaper, ChevronLeft, Gamepad2, Music, Globe, CircleUser,
  Film, Compass
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { IPTVChannel, IPTVCategory, ChatMessage, NowPlayingMetadata } from './types';
import guideData from './channels.json';

export default function App() {
  const allChannels: IPTVChannel[] = useMemo(() => guideData.channels || [], []);
  const allCategories: IPTVCategory[] = useMemo(() => guideData.cats || [], []);

  // Tabs / Navigation state: 'home', 'live', 'sports', 'news'
  const [activeTab, setActiveTab] = useState<string>('home');

  // UI & Filter States
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedChannel, setSelectedChannel] = useState<IPTVChannel | null>(allChannels[2] || allChannels[0] || null); // Defecto Cine Terror (id 3)
  const [showSearchOverlay, setShowSearchOverlay] = useState<boolean>(false);

  // Banner slider states for Home
  const [featuredIndex, setFeaturedIndex] = useState<number>(0);

  // Player States
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [volume, setVolume] = useState<number>(80);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playerError, setPlayerError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // AI Assistant States
  const [chatInput, setChatInput] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      sender: 'assistant',
      text: '¡Hola! Soy tu asistente de Inteligencia Artificial de Edge IPTV. Puedo recomendarte canales similares, sugerirte películas o resolver dudas sobre tu transmisión actual. ¿Qué te gustaría ver hoy?',
      timestamp: new Date()
    }
  ]);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // Enriched Metadata
  const [enrichedMetadata, setEnrichedMetadata] = useState<NowPlayingMetadata | null>(null);
  const [metadataLoading, setMetadataLoading] = useState<boolean>(false);
  const [isPredicting, setIsPredicting] = useState<boolean>(false);

  // Local Continue Watching History
  const [historyList, setHistoryList] = useState<IPTVChannel[]>([]);

  // Premium Spaslh Screen States
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [splashProgress, setSplashProgress] = useState<number>(0);
  const [splashStatus, setSplashStatus] = useState<string>('Inicializando sistemas...');

  // Splash Screen animation sequence
  useEffect(() => {
    const statusMessages = [
      'Inicializando sistemas...',
      'Cargando grilla de canales...',
      'Estableciendo enlace de satélite...',
      'Verificando certificados de reproducción...',
      'Listo'
    ];
    
    let currentMessageIdx = 0;
    const messageInterval = setInterval(() => {
      if (currentMessageIdx < statusMessages.length - 1) {
        currentMessageIdx++;
        setSplashStatus(statusMessages[currentMessageIdx]);
      }
    }, 250);

    const progressInterval = setInterval(() => {
      setSplashProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          clearInterval(messageInterval);
          setTimeout(() => {
            setShowSplash(false);
          }, 300);
          return 100;
        }
        return prev + 10;
      });
    }, 50);

    return () => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
    };
  }, []);

  // Banner Slides list matching visual screenshots
  const bannerSlides = useMemo(() => [
    {
      id: "slide-terror",
      channelId: 3, // Cine terror
      title: "Cine terror",
      tagline: "NOW STREAMING",
      backdrop: "https://image.tmdb.org/t/p/original/937g68URfoRK799b66Zg7m68667.jpg", // Pennywise IT
      category: "Peliculas",
      genres: ["Peliculas", "Movies", "Terror"],
      overview: "Siente el verdadero horror en alta definición las 24 horas. Disfruta hoy de los éxitos más aterradores del cine moderno con un enlace directo satelital.",
      v: "3.4k"
    },
    {
      id: "slide-adrenalina",
      channelId: 1, // Cine adrenalina
      title: "Cine adrenalina",
      tagline: "SIEMPRE EN VIVO",
      backdrop: "https://image.tmdb.org/t/p/original/zsa9reX69M3986Vj3S9jT9p6R1E.jpg", // John Wick style
      category: "Peliculas",
      genres: ["Adrenalina", "Accion", "Peliculas"],
      overview: "Programación repleta de acción ininterrumpida. John Wick, Gladiador, Duro de Matar y los grandes éxitos de adrenalina pura están aquí con audio premium.",
      v: "2.9k"
    },
    {
      id: "slide-premiere",
      channelId: 4, // Cine Premiere
      title: "Cine Premiere",
      tagline: "ESTRENOS PREMIUM",
      backdrop: "https://image.tmdb.org/t/p/original/b0Plj7ST9u6gE6Y0z76Z6nnZ3UM.jpg", // Batman theme
      category: "Peliculas",
      genres: ["Estrenos", "Premiere", "HD"],
      overview: "Sintoniza los estrenos y las películas más taquilleras del cine premium mundial. La mejor resolución de video para tus ojos las 24 horas del día.",
      v: "4.1k"
    },
    {
      id: "slide-comedia",
      channelId: 2, // Cine comedia
      title: "Cine comedia",
      tagline: "SIEMPRE EN VIVO",
      backdrop: "https://image.tmdb.org/t/p/original/fU7g9xep8Fj3vskF0D9O9Z7m0B3.jpg", // Comedy Hangover theme
      category: "Peliculas",
      genres: ["Comedia", "Risas", "Peliculas"],
      overview: "Ríete a más no poder con las comedias más virales y los clásicos divertidos que marcaron época. Programación ligera para disfrutar en familia.",
      v: "1.8k"
    }
  ], []);

  // Featured VOD rows matching design Screenshot 2
  const featuredVODs = useMemo(() => [
    {
      id: "vod-batman",
      title: "Cine Premiere: The Batman",
      theme: "The Batman",
      backdrop: "https://image.tmdb.org/t/p/w780/b0Plj7ST9u6gE6Y0z76Z6nnZ3UM.jpg",
      channelId: 4, // Cine Premiere
      category: "CINE",
      overview: "En su segundo año luchando contra el crimen..."
    },
    {
      id: "vod-aot",
      title: "Anime: Attack on Titan",
      theme: "Attack on Titan",
      backdrop: "https://image.tmdb.org/t/p/w780/i7nS7R6K7rL1dZg3S9V9jT6p6R1E.jpg",
      channelId: 10, // Anime
      category: "ANIME",
      overview: "La humanidad se ve obligada a vivir en ciudades rodeadas de muros..."
    },
    {
      id: "vod-tlou",
      title: "Serie: The Last of Us",
      theme: "The Last of Us",
      backdrop: "https://image.tmdb.org/t/p/w780/uDsci4gWv06EKgEq6L6R799b3UM.jpg",
      channelId: 12, // Series
      category: "SERIE",
      overview: "Veinte años después de que la civilización moderna haya sido destruida..."
    },
    {
      id: "vod-dw",
      title: "Noticias DW: Global Report",
      theme: "Global Report",
      backdrop: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&fit=crop",
      channelId: 18, // Noticias
      category: "NOTICIAS",
      overview: "Sintoniza las noticias globales de DW en este feed en directo."
    },
    {
      id: "vod-bluey",
      title: "Kids: Bluey",
      theme: "Bluey",
      backdrop: "https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=600&fit=crop",
      channelId: 15, // Kids
      category: "KIDS",
      overview: "Sigue las aventuras de una adorable perrita Bluey."
    }
  ], []);

  // Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const playerWrapRef = useRef<HTMLDivElement | null>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  // Load history from localStorage
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('edge_history');
      if (storedHistory) {
        const parsedIds = JSON.parse(storedHistory) as number[];
        const filteredHistory = parsedIds
          .map(id => allChannels.find(ch => ch.id === id))
          .filter((ch): ch is IPTVChannel => !!ch);
        setHistoryList(filteredHistory);
      }
    } catch (e) {
      console.error('Failed to load continue watching history:', e);
    }
  }, [allChannels]);

  // Save history
  const saveHistoryList = (channel: IPTVChannel) => {
    try {
      const updatedIds = [channel.id, ...historyList.filter(ch => ch.id !== channel.id).map(ch => ch.id)].slice(0, 8);
      localStorage.setItem('edge_history', JSON.stringify(updatedIds));
      
      const newHistory = [channel, ...historyList.filter(ch => ch.id !== channel.id)].slice(0, 8);
      setHistoryList(newHistory);
    } catch (e) {
      console.error('Failed to save continue watching history:', e);
    }
  };

  // Filter channels based lookup
  const filteredChannels = useMemo(() => {
    return allChannels.filter(channel => {
      // If we are on news tab, force news filter. If sports tab, force sports filter.
      let matchTab = true;
      if (activeTab === 'news') {
        const nameLower = channel.n.toLowerCase();
        const catLower = channel.c.toLowerCase();
        matchTab = nameLower.includes('news') || nameLower.includes('noticias') || nameLower.includes('dw') || catLower.includes('news') || catLower.includes('notic');
      } else if (activeTab === 'sports') {
        const nameLower = channel.n.toLowerCase();
        const catLower = channel.c.toLowerCase();
        matchTab = nameLower.includes('sport') || nameLower.includes('deport') || nameLower.includes('bein') || nameLower.includes('as3') || catLower.includes('sport') || catLower.includes('deport');
      }

      const matchCat = activeCategory === 'all' || channel.c === activeCategory;
      const matchSearch = channel.n.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          channel.d.toLowerCase().includes(searchQuery.toLowerCase());
      return matchTab && matchCat && matchSearch;
    });
  }, [allChannels, activeCategory, searchQuery, activeTab]);

  // Trending sidebar channels
  const trendingChannels = useMemo(() => {
    return [...allChannels].sort((a, b) => b.v - a.v).slice(0, 6);
  }, [allChannels]);

  // Sync Video stream with channel playing
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !selectedChannel) return;

    setPlayerError(false);
    setIsLoading(true);
    setEnrichedMetadata(null);

    // Fetch TMDB program details
    fetchNowPlayingMetadata(selectedChannel);

    // Save playing channel
    saveHistoryList(selectedChannel);

    // Stream CORS Proxy mapping
    const proxiedStreamUrl = `/proxy?url=${encodeURIComponent(selectedChannel.s)}`;

    const handleVideoPlaying = () => {
      // Automate feed prediction snapshot
      setTimeout(() => {
        if (selectedChannel) {
          predictWithAI(selectedChannel);
        }
      }, 2500);
    };

    video.addEventListener('playing', handleVideoPlaying);

    if (Hls.isSupported()) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }

      const hls = new Hls({
        maxBufferLength: 20,
        maxMaxBufferLength: 45,
        enableWorker: true,
        lowLatencyMode: true,
      });

      hlsRef.current = hls;
      hls.loadSource(proxiedStreamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        if (isPlaying) {
          video.play().catch(() => {
            setIsPlaying(false);
          });
        }
      });

      let recoveryAttempts = 0;
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          if (recoveryAttempts < 3) {
            recoveryAttempts++;
            console.warn(`HLS fatal error. Recovery attempt ${recoveryAttempts}/3...`);
            if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              setIsLoading(false);
              setPlayerError(true);
            }
          } else {
            setIsLoading(false);
            setPlayerError(true);
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = proxiedStreamUrl;
      video.addEventListener('loadedmetadata', () => {
        setIsLoading(false);
        if (isPlaying) {
          video.play().catch(() => {
            setIsPlaying(false);
          });
        }
      });
      video.addEventListener('error', () => {
        setIsLoading(false);
        setPlayerError(true);
      });
    } else {
      setIsLoading(false);
      setPlayerError(true);
    }

    return () => {
      video.removeEventListener('playing', handleVideoPlaying);
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [selectedChannel]);

  // Fetch dynamic vision/AI metadata prediction
  const predictWithAI = async (channel: IPTVChannel) => {
    setIsPredicting(true);
    let imgBase64: string | null = null;

    try {
      const video = videoRef.current;
      if (video && video.readyState >= 2) {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 360;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.65);
            imgBase64 = dataUrl.split(',')[1];
          }
        } catch (canvasErr) {
          console.warn('[AI Vision] Tainted screenshot skip:', canvasErr);
        }
      }

      const res = await fetch('/api/predict-channel-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelId: channel.id,
          channelName: channel.n,
          category: channel.c,
          frame: imgBase64
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.title) {
          setEnrichedMetadata(data);
          return true;
        }
      }
    } catch (e) {
      console.warn('AI prediction failed:', e);
    } finally {
      setIsPredicting(false);
    }
    return false;
  };

  // Fetch TMDB stream info
  const fetchNowPlayingMetadata = async (channel: IPTVChannel) => {
    setMetadataLoading(true);
    try {
      const res = await fetch(`/api/now-playing?channelId=${channel.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.title) {
          setEnrichedMetadata(data);
          setMetadataLoading(false);
          return;
        }
      }

      const predicted = await predictWithAI(channel);
      if (predicted) {
        setMetadataLoading(false);
        return;
      }

      const detectRes = await fetch(`/api/detect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelId: String(channel.id),
          category: channel.c,
          metadata: { title: channel.n, genre: [channel.c] }
        })
      });

      if (detectRes.ok) {
        const data = await detectRes.json();
        if (data && data.title) {
          setEnrichedMetadata(data);
        }
      }
    } catch (e) {
      console.warn('Metadata resolution failed:', e);
    } finally {
      setMetadataLoading(false);
    }
  };

  // Video controller handlers
  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    const video = videoRef.current;
    if (!video) return;
    video.volume = newVolume / 100;
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
      video.muted = false;
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    video.muted = nextMute;
  };

  const toggleFullscreen = () => {
    const wrap = playerWrapRef.current;
    if (!wrap) return;

    if (!document.fullscreenElement) {
      wrap.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error('Fullscreen request failed:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  // Track key volumes
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.volume = volume / 100;
      video.muted = isMuted;
    }
  }, [volume, isMuted]);

  // AI Chat submission handler
  const handleSendChat = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || isAiLoading) return;

    const userMessage = chatInput.trim();
    setChatInput('');

    const userMsgObj: ChatMessage = {
      sender: 'user',
      text: userMessage,
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, userMsgObj]);
    setIsAiLoading(true);

    setTimeout(() => {
      if (chatScrollRef.current) {
        chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
      }
    }, 50);

    try {
      const res = await fetch('/api/gemini-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          channelName: selectedChannel?.n || 'Ninguno',
          category: selectedChannel?.c || 'Todos',
          channelsList: allChannels.map(ch => ({ id: ch.id, name: ch.n, category: ch.c })),
          currentProgram: enrichedMetadata
        })
      });

      if (res.ok) {
        const data = await res.json();
        const assistantMsgObj: ChatMessage = {
          sender: 'assistant',
          text: data.response || 'No obtuve respuesta del satélite de IA.',
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, assistantMsgObj]);
      } else {
        throw new Error('Response error');
      }
    } catch (e) {
      setChatMessages(prev => [
        ...prev,
        {
          sender: 'assistant',
          text: 'Lo siento, hubo un problema para conectar con el motor de IA en el servidor. Configura tu GEMINI_API_KEY en ajustes.',
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsAiLoading(false);
      setTimeout(() => {
        if (chatScrollRef.current) {
          chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
        }
      }, 50);
    }
  };

  // Handle cycle through slides
  const handleNextSlide = () => {
    setFeaturedIndex(prev => (prev + 1) % bannerSlides.length);
  };

  const handlePrevSlide = () => {
    setFeaturedIndex(prev => (prev - 1 + bannerSlides.length) % bannerSlides.length);
  };

  // Auto trigger sintonize channel from slide
  const handleSintonizeSlideChannel = (channelId: number) => {
    const ch = allChannels.find(c => c.id === channelId);
    if (ch) {
      setSelectedChannel(ch);
      setIsPlaying(true);
      // Automatically navigate to 'live' tab with active player
      setActiveTab('live');
    }
  };

  // Clean channels dynamically matching category count
  const getCategoryCount = (catId: string) => {
    let baseList = allChannels;
    if (activeTab === 'news') {
      baseList = allChannels.filter(c => c.n.toLowerCase().includes('news') || c.n.toLowerCase().includes('noticias') || c.n.toLowerCase().includes('dw'));
    } else if (activeTab === 'sports') {
      baseList = allChannels.filter(c => c.n.toLowerCase().includes('sport') || c.n.toLowerCase().includes('deport') || c.n.toLowerCase().includes('bein') || c.n.toLowerCase().includes('as3'));
    }

    if (catId === 'all') return baseList.length;
    return baseList.filter(ch => ch.c === catId).length;
  };

  // Helper mapping category icons/decorations matching design screen 2
  const getCategoryStyles = (catId: string) => {
    switch (catId) {
      case 'all':
        return {
          bg: 'hover:bg-blue-950/20 active:bg-blue-950/40 border-slate-800 hover:border-blue-500/50 text-slate-300',
          active: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]',
          icon: <Globe className="h-4 w-4 mr-2 text-blue-400" />
        };
      case 'movies':
        return {
          bg: 'hover:bg-red-950/20 active:bg-red-950/40 border-slate-800 hover:border-red-500/50 text-slate-300',
          active: 'bg-gradient-to-r from-red-600 to-amber-600 text-white border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]',
          icon: <Film className="h-4 w-4 mr-2 text-red-400" />
        };
      case 'french':
        return {
          bg: 'hover:bg-amber-950/20 active:bg-amber-950/40 border-slate-800 hover:border-amber-500/50 text-slate-300',
          active: 'bg-gradient-to-r from-amber-600 to-[#eab308] text-white border-amber-500 shadow-[0_0_15px_rgba(234,179,8,0.3)]',
          icon: <Compass className="h-4 w-4 mr-2 text-amber-400" />
        };
      case 'kids':
        return {
          bg: 'hover:bg-purple-950/20 active:bg-purple-950/40 border-slate-800 hover:border-purple-500/50 text-slate-300',
          active: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]',
          icon: <Gamepad2 className="h-4 w-4 mr-2 text-purple-400" />
        };
      case 'music':
        return {
          bg: 'hover:bg-pink-950/20 active:bg-pink-950/40 border-slate-800 hover:border-pink-500/50 text-slate-300',
          active: 'bg-gradient-to-r from-pink-500 to-rose-500 text-white border-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.3)]',
          icon: <Music className="h-4 w-4 mr-2 text-pink-400" />
        };
      default:
        return {
          bg: 'border-slate-800 hover:border-slate-700 text-slate-300',
          active: 'bg-white text-black border-white',
          icon: <Tv className="h-4 w-4 mr-2" />
        };
    }
  };

  // Helper country badges on channels matching Screenshot 3
  const getChannelCountry = (channelName: string, channelCat: string) => {
    const nameLower = channelName.toLowerCase();
    if (nameLower.includes('mexic') || nameLower.includes('adn40')) return 'MEXICO';
    if (nameLower.includes('à punt') || nameLower.includes('punt valencia')) return 'VALENCIA';
    if (nameLower.includes('antena 3') || nameLower.includes('valencia') || nameLower.includes('teleonce')) return 'SPAIN';
    if (nameLower.includes('bolivision') || nameLower.includes('bolivia')) return 'BOLIVIA';
    if (nameLower.includes('ecuavisa') || nameLower.includes('quito')) return 'ECUADOR';
    if (nameLower.includes('cnc') || nameLower.includes('pereira')) return 'COLOMBIA';
    if (nameLower.includes('rpp') || nameLower.includes('peru')) return 'PERU';
    if (nameLower.includes('chile') || nameLower.includes('13c')) return 'CHILE';
    if (nameLower.includes('germany') || nameLower.includes('dw')) return 'GERMANY';
    if (channelCat === 'music') return 'LATINO';
    if (channelCat === 'french') return 'FRANCE';
    return 'LATINO';
  };

  return (
    <AnimatePresence mode="wait">
      {showSplash ? (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#070707] text-[#f0f0f0] p-6 text-center select-none"
        >
          {/* Logo glow effect background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-gradient-to-tr from-red-600/10 to-amber-600/10 blur-[90px] pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center gap-6 max-w-sm">
            {/* Animated Logo Container */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 90 }}
              className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-red-600 to-amber-600 flex items-center justify-center shadow-2xl shadow-red-600/30 relative"
            >
              <Tv className="h-8 w-8 text-white" />
              <div className="absolute inset-0 rounded-2xl border border-white/10 animate-pulse pointer-events-none" />
            </motion.div>

            {/* Brand Title */}
            <motion.div
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="font-display font-black text-4xl tracking-[0.2em] bg-gradient-to-r from-white via-[#f1f5f9] to-[#94a3b8] bg-clip-text text-transparent uppercase">
                EDGE
              </h1>
              <span className="block text-[8px] text-[#666] font-display tracking-[5px] uppercase mt-1 font-bold">
                SATELLITE IPTV SYSTEM
              </span>
            </motion.div>

            {/* Progress Bar */}
            <motion.div 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: '100%', opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="w-56"
            >
              <div className="h-1 w-full bg-[#141414] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-red-600 to-amber-600 rounded-full transition-all duration-100"
                  style={{ width: `${splashProgress}%` }}
                />
              </div>
              
              <div className="flex items-center justify-between mt-2 px-1 text-[9px] font-mono text-[#555]">
                <span className="animate-pulse">{splashStatus}</span>
                <span className="text-white/40">{splashProgress}%</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          key="app"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="min-h-screen flex flex-col bg-[#070707] text-[#f0f0f0]"
        >
          {/* Brand Premium Header (Exactly matches Screenshot 1 / 2) */}
          <header className="sticky top-0 z-50 bg-[#070707]/90 backdrop-blur-md border-b border-white/5 py-4 px-4 lg:px-8">
            <div className="max-w-[1300px] mx-auto flex items-center justify-between">
              
              {/* E D G E Logo */}
              <button 
                onClick={() => { setActiveTab('home'); setActiveCategory('all'); }}
                className="flex items-center gap-1.5 focus:outline-none"
              >
                <span className="font-display font-black text-2xl tracking-[0.25em] text-white select-none hover:text-red-500 transition-colors">
                  EDGE
                </span>
              </button>

              {/* Central Navigation Tabs matches header */}
              <nav className="hidden md:flex items-center gap-6 lg:gap-14">
                <button
                  onClick={() => setActiveTab('home')}
                  className={`flex items-center gap-2 text-sm font-medium tracking-wide transition-all relative ${
                    activeTab === 'home' ? 'text-white font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <HomeIcon className="h-4 w-4" />
                  Home
                  {activeTab === 'home' && (
                    <span className="bg-gradient-to-r from-red-600 to-amber-600 shadow-[0_0_12px_rgba(239,68,68,1)] h-0.5 rounded-full absolute bottom-[-21px] left-[-4px] right-[-4px]" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('live')}
                  className={`flex items-center gap-2 text-sm font-medium tracking-wide transition-all relative ${
                    activeTab === 'live' ? 'text-white font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Tv className="h-4 w-4" />
                  Live
                  {activeTab === 'live' && (
                    <span className="bg-gradient-to-r from-red-600 to-amber-600 shadow-[0_0_12px_rgba(239,68,68,1)] h-0.5 rounded-full absolute bottom-[-21px] left-[-4px] right-[-4px]" />
                  )}
                </button>
                <button
                  onClick={() => { setActiveTab('sports'); setActiveCategory('all'); }}
                  className={`flex items-center gap-2 text-sm font-medium tracking-wide transition-all relative ${
                    activeTab === 'sports' ? 'text-white font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Trophy className="h-4 w-4" />
                  Sports
                  {activeTab === 'sports' && (
                    <span className="bg-gradient-to-r from-red-600 to-amber-600 shadow-[0_0_12px_rgba(239,68,68,1)] h-0.5 rounded-full absolute bottom-[-21px] left-[-4px] right-[-4px]" />
                  )}
                </button>
                <button
                  onClick={() => { setActiveTab('news'); setActiveCategory('all'); }}
                  className={`flex items-center gap-2 text-sm font-medium tracking-wide transition-all relative ${
                    activeTab === 'news' ? 'text-white font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Newspaper className="h-4 w-4" />
                  News
                  {activeTab === 'news' && (
                    <span className="bg-gradient-to-r from-red-600 to-amber-600 shadow-[0_0_12px_rgba(239,68,68,1)] h-0.5 rounded-full absolute bottom-[-21px] left-[-4px] right-[-4px]" />
                  )}
                </button>
              </nav>

              {/* Utility Icons: User profile, volume toggle, and search trigger overlay */}
              <div className="flex items-center gap-5">
                
                {/* Search Toggle Input */}
                <div className="relative flex items-center">
                  <AnimatePresence>
                    {(showSearchOverlay || searchQuery) && (
                      <motion.input
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 170, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        type="text"
                        placeholder="Buscar can..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-[#121212]/85 text-xs text-white border border-white/10 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-red-600/70 mr-1 text-[11px]"
                      />
                    )}
                  </AnimatePresence>
                  <button 
                    onClick={() => setShowSearchOverlay(!showSearchOverlay)}
                    className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                    title="Buscar canales"
                  >
                    <Search className="h-5 w-5" />
                  </button>
                </div>

                {/* Volume icon indicator */}
                <button 
                  onClick={toggleMute}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                  title={isMuted ? 'Activar sonido' : 'Silenciar'}
                >
                  {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </button>

                {/* Styled User Profile action circle */}
                <button 
                  onClick={() => setActiveTab('live')}
                  className="p-1 rounded-full text-slate-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer flex items-center justify-center border border-white/10"
                >
                  <CircleUser className="h-5 w-5 text-slate-400" />
                </button>
              </div>

            </div>
          </header>

          {/* Show Search Results bar if active */}
          {searchQuery && (
            <div className="bg-[#121212] py-2 px-6 border-b border-white/5 flex justify-between items-center text-xs">
              <span className="text-slate-400">Resultados de búsqueda para: <strong className="text-white">"{searchQuery}"</strong> ({filteredChannels.length} encontrados)</span>
              <button onClick={() => setSearchQuery('')} className="text-red-500 hover:underline flex items-center gap-1">
                Limpiar <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {/* Core App Tabs routing content */}
          <div className="flex-1 flex flex-col">

            {/* TAB: HOME VIEW */}
            {activeTab === 'home' && (
              <div className="flex flex-col">
                
                {/* 1. Immersive Hero Slider Banner (Exactly Screen 1 / 2) */}
                <section className="relative h-[480px] lg:h-[520px] bg-black overflow-hidden flex items-end">
                  
                  {/* Backdrop Background with custom overlay blend */}
                  <div className="absolute inset-0">
                    <img 
                      src={bannerSlides[featuredIndex].backdrop} 
                      alt="" 
                      className="w-full h-full object-cover opacity-60 scale-105 transition-all duration-700 animate-fadeIn"
                    />
                    {/* Shadow Blends */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#070707] via-[#070707]/60 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#070707] via-transparent to-[#070707]/30" />
                    <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black to-transparent opacity-90" />
                  </div>

                  {/* Left content stack */}
                  <div className="relative z-10 w-full max-w-[1300px] mx-auto px-4 lg:px-8 pb-10 flex items-end justify-between">
                    <div className="max-w-2xl flex flex-col items-start gap-4">
                      
                      {/* NOW STREAMING badge in red */}
                      <span className="text-xs font-mono font-black tracking-[0.2em] text-red-500 bg-red-600/10 border border-red-600/20 px-3 py-1 rounded-md animate-pulse">
                        {bannerSlides[featuredIndex].tagline}
                      </span>

                      {/* Giant Futuristic Title font */}
                      <h2 className="font-display font-extrabold text-4xl lg:text-6xl tracking-tight text-white uppercase drop-shadow-md">
                        {bannerSlides[featuredIndex].title}
                      </h2>

                      {/* EPG Info Badges */}
                      <div className="flex flex-wrap items-center gap-2.5">
                        
                        {/* EN VIVO indicator */}
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 text-white text-[11px] font-bold tracking-wide shadow-lg shadow-red-600/30">
                          <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                          <span>EN VIVO</span>
                        </div>

                        {/* Description subtitle */}
                        <span className="text-xs text-slate-300 font-medium">
                          {bannerSlides[featuredIndex].title} - En vivo
                        </span>

                        <span className="text-slate-600">&bull;</span>

                        {/* 24/7 indicator */}
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#121212]/80 border border-white/5 text-[11.5px] font-medium text-slate-300">
                          <Clock className="h-3 w-3 text-slate-400" />
                          <span>24/7</span>
                        </div>

                        {/* HD badge with red outline matching Screenshot 1 */}
                        <div className="px-2.5 py-0.5 rounded border border-red-600/90 text-[11.5px] font-bold text-red-500 shadow-[0_0_8px_rgba(220,38,38,0.3)] bg-red-600/5">
                          HD
                        </div>

                        {/* Pill generic categories */}
                        <div className="px-3 py-1 rounded-full bg-[#121212]/80 border border-white/5 text-[11px] font-semibold text-slate-300">
                          Peliculas
                        </div>
                        <div className="px-3 py-1 rounded-full bg-[#121212]/80 border border-white/5 text-[11px] font-semibold text-slate-300">
                          Movies
                        </div>
                      </div>

                      {/* Summary text */}
                      <p className="text-slate-300 text-xs md:text-sm leading-relaxed max-w-xl line-clamp-3">
                        {bannerSlides[featuredIndex].overview}
                      </p>

                      {/* Watch Now Call to Action Button */}
                      <button 
                        onClick={() => handleSintonizeSlideChannel(bannerSlides[featuredIndex].channelId)}
                        className="flex items-center gap-2.5 px-6 py-3 bg-red-600 hover:bg-red-500 rounded-2xl text-xs font-black uppercase tracking-wider text-white shadow-[0_4px_16px_rgba(220,38,38,0.4)] hover:scale-105 transition-all cursor-pointer mt-2"
                      >
                        <Play className="h-4 w-4 fill-current text-white" />
                        <span>Watch Now</span>
                      </button>

                    </div>

                    {/* Right carousel dots indicator */}
                    <div className="hidden md:flex flex-col items-center gap-1.5">
                      <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1">PROGRAMA</span>
                      <div className="flex gap-2">
                        {bannerSlides.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setFeaturedIndex(idx)}
                            className={`h-2.5 w-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                              featuredIndex === idx 
                                ? 'bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.8)] px-2' 
                                : 'bg-slate-600 hover:bg-slate-400'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Absolute Slider Navigation Arrows */}
                  <div className="absolute inset-y-0 left-4 lg:left-8 flex items-center z-20 pointer-events-none">
                    <button 
                      onClick={handlePrevSlide}
                      className="h-11 w-11 rounded-full bg-black/40 backdrop-blur-md border border-white/5 hover:border-white/20 text-white flex items-center justify-center cursor-pointer transition-all hover:scale-110 pointer-events-auto"
                      title="Anterior"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                  </div>
                  <div className="absolute inset-y-0 right-4 lg:right-8 flex items-center z-20 pointer-events-none">
                    <button 
                      onClick={handleNextSlide}
                      className="h-11 w-11 rounded-full bg-black/40 backdrop-blur-md border border-white/5 hover:border-white/20 text-white flex items-center justify-center cursor-pointer transition-all hover:scale-110 pointer-events-auto"
                      title="Siguiente"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </div>

                </section>

                {/* 2. "Cata de Canales" Horizontal Scrolling Carousel overlay (Screen 2) */}
                <section className="bg-gradient-to-b from-[#070707] to-[#0A0A0A] py-6 px-4 lg:px-8 border-b border-white/5">
                  <div className="max-w-[1300px] mx-auto flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-mono font-black tracking-widest text-[#a855f7] uppercase">Cata de Canales</h4>
                      <span className="text-[10px] text-slate-500 font-mono">SINTONIZADOR DIRECTO</span>
                    </div>

                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none scroll-smooth">
                      {allChannels.slice(0, 24).map(channel => (
                        <button
                          key={channel.id}
                          onClick={() => { setSelectedChannel(channel); setActiveTab('live'); }}
                          className={`flex-shrink-0 bg-[#0f1013]/70 backdrop-blur-md rounded-xl p-3 border hover:scale-105 transition-all flex flex-col items-center justify-center w-[120px] text-center cursor-pointer gap-2 group ${
                            selectedChannel?.id === channel.id 
                              ? 'border-[#a855f7] bg-purple-950/10' 
                              : 'border-white/5 hover:border-white/10'
                          }`}
                        >
                          <img 
                            src={channel.logo} 
                            alt={channel.n} 
                            className="h-8 object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform" 
                          />
                          <div className="min-w-0 w-full">
                            <span className="block text-[10px] font-black text-white truncate group-hover:text-[#a855f7] transition-colors">{channel.n}</span>
                            <span className="block text-[8px] text-slate-500 capitalize">{channel.c}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </section>

                {/* 3. Featured VOD Section matching Screen 2 */}
                <section className="py-8 px-4 lg:px-8 bg-[#0a0a0a]">
                  <div className="max-w-[1300px] mx-auto flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                      <span className="h-4 w-1 bg-red-600 rounded-full" />
                      <h3 className="font-display font-black text-sm uppercase tracking-widest text-slate-200">Featured VOD</h3>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                      {featuredVODs.map((vod) => (
                        <div
                          key={vod.id}
                          onClick={() => handleSintonizeSlideChannel(vod.channelId)}
                          className="group relative aspect-[14/9] rounded-xl overflow-hidden cursor-pointer border border-white/5 hover:border-white/15 transition-all shadow-md bg-black"
                        >
                          {/* Image */}
                          <img 
                            src={vod.backdrop} 
                            alt={vod.title} 
                            className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-300"
                          />
                          {/* Dark overlays */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                          
                          {/* Info layer */}
                          <div className="absolute inset-x-2.5 bottom-2.5 z-10">
                            <span className="text-[8px] font-mono font-bold tracking-wider px-1.5 py-0.5 bg-red-600/20 text-red-400 border border-red-500/10 rounded mb-1.5 inline-block uppercase">
                              {vod.category}
                            </span>
                            <h4 className="text-[11.5px] font-bold text-white leading-tight truncate font-display group-hover:text-red-500 transition-colors">
                              {vod.theme}
                            </h4>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                {/* 4. "Canales en Vivo" Main Filter and Card Grid (Screen 1 & 3) */}
                <section className="py-8 px-4 lg:px-8 bg-gradient-to-b from-[#0a0a0a] to-[#060606] border-t border-white/5">
                  <div className="max-w-[1300px] mx-auto flex flex-col gap-6">
                    
                    {/* Grid Section Head */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-5 gap-4">
                      <div className="flex items-center gap-2">
                        {/* High contrast red vector bar marker */}
                        <span className="h-5 w-1 bg-red-600 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                        <h3 className="font-display font-black text-lg lg:text-xl text-white tracking-tight uppercase">
                          Canales en Vivo
                        </h3>
                      </div>

                      {/* Right side item metrics */}
                      <span className="text-[11.5px] font-mono font-semibold text-slate-500 lowercase self-end sm:self-auto">
                        {filteredChannels.length} channels
                      </span>
                    </div>

                    {/* Decoratively Glowing Categories tabs (Matches Screen 2 buttons) */}
                    <div className="flex flex-wrap gap-3.5">
                      {allCategories.map(cat => {
                        const style = getCategoryStyles(cat.id);
                        const isActive = activeCategory === cat.id;
                        return (
                          <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`px-4.5 py-2 rounded-xl text-xs font-extrabold tracking-wide uppercase border flex items-center transition-all cursor-pointer ${
                              isActive ? style.active : style.bg
                            }`}
                          >
                            {style.icon}
                            <span>{cat.label} ({getCategoryCount(cat.id)})</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Premium Grid layout - Clean 3D Reflex Logo cards (Matches Screen 3) */}
                    {filteredChannels.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                        {filteredChannels.map(channel => {
                          const isCurrent = selectedChannel?.id === channel.id;
                          const channelCountry = getChannelCountry(channel.n, channel.c);
                          
                          return (
                            <div
                              key={channel.id}
                              onClick={() => {
                                setSelectedChannel(channel);
                                setIsPlaying(true);
                                setActiveTab('live');
                              }}
                              className={`group relative bg-gradient-to-b from-[#111317] to-[#0a0a0d] rounded-2xl p-4 border transition-all flex flex-col justify-between select-none shadow-md h-40 ${
                                isCurrent 
                                  ? 'border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.15)] ring-1 ring-red-600/30' 
                                  : 'border-white/5 hover:border-slate-800 hover:scale-[1.02] hover:shadow-lg'
                              }`}
                            >
                              
                              {/* Top metadata detail segment */}
                              <div className="flex justify-between items-start">
                                {/* Bottom category label (GENERIC, ANIME, MOVIE) */}
                                <span className="text-[9px] font-mono font-black py-0.5 px-2 bg-white/5 text-slate-400 rounded-md tracking-wider uppercase">
                                  {channel.c === 'french' ? 'FRANCE' : channel.c.toUpperCase()}
                                </span>

                                {/* Top-right badge (MEXICO/SPAIN origin tag) */}
                                <span className="text-[9.5px] font-bold text-[#b3b3b3] bg-black/40 border border-white/5 px-2 py-0.5 rounded tracking-wide uppercase">
                                  {channelCountry}
                                </span>
                              </div>

                              {/* Center area with high fidelity flipped logo reflection! ( hallmark of layout) */}
                              <div className="flex flex-col items-center justify-center relative select-none h-16 mt-2 mb-1.5 overflow-hidden">
                                {/* Normal Logo */}
                                <img 
                                  src={channel.logo} 
                                  alt={channel.n} 
                                  className="h-10 object-contain z-10 filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)] group-hover:scale-105 transition-transform" 
                                />
                                
                                {/* Vertical flipped Mirror reflection with gradient mask! */}
                                <img 
                                  src={channel.logo} 
                                  alt="" 
                                  className="h-10 object-contain absolute top-[36px] scale-y-[-1] opacity-15 blur-[0.5px] pointer-events-none select-none" 
                                  style={{
                                    maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 60%)',
                                    WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 60%)',
                                  }}
                                />
                              </div>

                              {/* Bottom labels */}
                              <div className="flex items-end justify-between mt-auto">
                                <div className="min-w-0 w-4/5">
                                  <h4 className={`text-xs font-black truncate tracking-wide group-hover:text-red-500 transition-colors ${
                                    isCurrent ? 'text-red-500' : 'text-white'
                                  }`}>
                                    {channel.n}
                                  </h4>
                                </div>
                                
                                {/* Resolution Pill bottom right */}
                                <span className="text-[8px] font-mono font-black px-1.5 py-0.5 bg-red-600/10 text-red-500 border border-red-500/10 rounded tracking-wider uppercase flex-shrink-0">
                                  {channel.q || '1080P'}
                                </span>
                              </div>

                              {/* Corner status glow dot */}
                              <span className="absolute left-2.5 top-2.5 h-1 w-1 rounded-full animate-pulse bg-red-600" />
                              
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="bg-[#121212]/30 rounded-2xl p-12 text-center border border-white/5">
                        <Activity className="h-8 w-8 text-[#555] mx-auto mb-2" />
                        <h4 className="text-sm font-bold text-white">No se encontraron canales en esta categoría</h4>
                        <p className="text-xs text-slate-500 mt-1">Intente resetear los filtros o modificar su búsqueda.</p>
                      </div>
                    )}
                  </div>
                </section>

              </div>
            )}

            {/* TAB: LIVE IMMERSIVE PLAYER VIEW WITH AI ASSISTANT SIDEBAR */}
            {(activeTab === 'live' || activeTab === 'sports' || activeTab === 'news') && (
              <div className="max-w-[1300px] w-full mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
                
                {/* Widescreen theater player (Cols 1 - 3) */}
                <div className="lg:col-span-3 flex flex-col gap-5">
                  
                  {selectedChannel ? (
                    <div className="flex flex-col gap-4">
                      
                      {/* Active Player Wrapper frame */}
                      <div 
                        ref={playerWrapRef}
                        className="relative bg-black rounded-2xl overflow-hidden border border-white/5 shadow-2xl group animate-fadeIn"
                      >
                        {/* video viewport element */}
                        <div className="aspect-video w-full relative flex items-center justify-center overflow-hidden">
                          <video
                            ref={videoRef}
                            onClick={togglePlayPause}
                            className="w-full h-full object-contain"
                            playsInline
                          />

                          {/* Loading overlay spinner */}
                          {isLoading && (
                            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                              <div className="h-9 w-9 border-4 border-t-red-600 border-r-transparent border-b-transparent border-l-transparent animate-spin rounded-full"></div>
                              <span className="text-[10px] font-mono text-slate-500 tracking-widest uppercase">ENLAZANDO SEÑAL ...</span>
                            </div>
                          )}

                          {/* Player error bypass block code */}
                          {playerError && (
                            <div className="absolute inset-0 bg-[#0c0c0d] backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 gap-4 animate-scaleUp">
                              <div className="h-12 w-12 rounded-full bg-red-600/10 border border-red-600/30 flex items-center justify-center">
                                <Activity className="h-6 w-6 text-red-600" />
                              </div>
                              <div>
                                <h4 className="text-sm font-bold font-display uppercase tracking-wider text-white">Canal Temporalmente Fuera de Servicio</h4>
                                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
                                  La señal del streaming en vivo tiene restricciones de red. Intenta forzar reintentos de conexión o cambia de canal.
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => setSelectedChannel({ ...selectedChannel })}
                                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-white/5 rounded-xl text-xs font-semibold text-white transition-all cursor-pointer"
                                >
                                  <RotateCcw className="h-3 w-3" /> Reintentar Carga
                                </button>
                                <button 
                                  onClick={() => {
                                    const currIdx = allChannels.findIndex(c => c.id === selectedChannel.id);
                                    const nextIdx = (currIdx + 1) % allChannels.length;
                                    const nextCh = allChannels[nextIdx];
                                    if (nextCh) setSelectedChannel(nextCh);
                                  }}
                                  className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-500 rounded-xl text-xs font-bold text-white transition-all cursor-pointer shadow-lg shadow-red-600/20"
                                >
                                  <SkipForward className="h-3 w-3" /> Siguiente Canal
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Top channel overlays indicators */}
                          <div className="absolute top-4 right-4 flex items-center gap-2">
                            <span className="flex items-center gap-1 px-2.5 py-1 text-[9px] font-mono font-black tracking-widest rounded bg-red-600/80 text-white uppercase animate-pulse">
                              Live Feed
                            </span>
                            <span className="px-2.5 py-1 text-[10px] font-mono rounded bg-black/60 backdrop-blur-md text-slate-300 border border-white/5">
                              {selectedChannel.q}
                            </span>
                          </div>
                        </div>

                        {/* Control actions bar (Exactly styled) */}
                        <div className="bg-[#0f1013] border-t border-white/5 px-4 py-3.5 flex flex-wrap items-center justify-between gap-3 select-none">
                          <div className="flex items-center gap-4">
                            <button
                              onClick={togglePlayPause}
                              className="h-8 w-8 rounded-lg bg-red-600/15 hover:bg-red-600/25 text-red-500 flex items-center justify-center transition-colors cursor-pointer"
                              title={isPlaying ? 'Pausar' : 'Reproducir'}
                            >
                              {isPlaying ? <Pause className="h-4.5 w-4.5 fill-current" /> : <Play className="h-4.5 w-4.5 fill-current" />}
                            </button>

                            {/* volume sliders */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={toggleMute}
                                className="h-8 w-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                              >
                                {isMuted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                              </button>
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={isMuted ? 0 : volume}
                                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                                className="w-16 lg:w-20 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-600"
                              />
                            </div>
                          </div>

                          {/* Current title info display */}
                          <div className="flex items-center gap-3">
                            <img src={selectedChannel.logo} alt="" className="h-6 object-contain filter drop-shadow" />
                            <div className="flex flex-col text-left">
                              <span className="font-bold text-xs text-white leading-tight">{selectedChannel.n}</span>
                              <span className="text-[9px] text-slate-500 font-mono tracking-wide uppercase">CORS Bypass active</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[9px] bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/20 px-2.5 py-0.5 rounded font-mono font-bold">
                              CDN SYNC
                            </span>
                            <button
                              onClick={toggleFullscreen}
                              className="h-8 w-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                            >
                              <Maximize className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                      </div>

                      {/* Enriched TMDB Movie Metadata detail */}
                      <div className="bg-[#0f1013] rounded-2xl p-5 border border-white/5 relative overflow-hidden text-left shadow-lg">
                        
                        {enrichedMetadata?.backdrop && (
                          <div 
                            className="absolute inset-0 opacity-[0.03] bg-cover bg-center pointer-events-none"
                            style={{ backgroundImage: `url(${enrichedMetadata.backdrop})` }}
                          />
                        )}

                        <div className="flex flex-col sm:flex-row gap-5 relative z-10">
                          {/* poster */}
                          {enrichedMetadata?.poster && (
                            <img 
                              src={enrichedMetadata.poster} 
                              alt="" 
                              className="w-20 sm:w-24 aspect-[2/3] object-cover rounded-xl border border-white/5 shadow-md self-start"
                            />
                          )}

                          <div className="flex-1 flex flex-col justify-center gap-2">
                            <div className="flex items-center flex-wrap gap-2">
                              <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-red-600/10 text-red-500 border border-red-500/10">
                                {enrichedMetadata?.type ? enrichedMetadata.type : selectedChannel.c}
                              </span>
                              {enrichedMetadata?.year && (
                                <span className="text-xs text-slate-400 font-mono">Año: {enrichedMetadata.year}</span>
                              )}
                              {enrichedMetadata?.rating && (
                                <span className="text-xs text-amber-500 font-semibold flex items-center gap-1 bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10">
                                  ⭐️ {enrichedMetadata.rating.toFixed(1)}/10
                                </span>
                              )}
                            </div>

                            <h3 className="text-base sm:text-lg font-bold font-display text-white">
                              {enrichedMetadata?.title ? enrichedMetadata.title : `Sintonizando: ${selectedChannel.n}`}
                            </h3>

                            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-2xl">
                              {enrichedMetadata?.overview ? enrichedMetadata.overview : selectedChannel.d}
                            </p>

                            <div className="mt-2 flex flex-wrap items-center gap-4 border-t border-white/5 pt-3">
                              <span className="text-[10px] text-slate-600 font-mono uppercase font-bold flex items-center gap-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                SATÉLITE CORE: {enrichedMetadata?.source ? enrichedMetadata.source.toUpperCase() : 'CANAL IPTV CONFIG'}
                              </span>

                              <button
                                onClick={() => selectedChannel && predictWithAI(selectedChannel)}
                                disabled={isPredicting || metadataLoading}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-55 text-white text-[9.5px] uppercase font-black tracking-wider transition-all cursor-pointer"
                              >
                                <Sparkles className="h-3.5 w-3.5 animate-pulse text-yellow-300" />
                                {isPredicting ? 'Escaneando Video...' : '🔮 Recalcular con IA'}
                              </button>
                            </div>
                          </div>
                        </div>

                      </div>

                    </div>
                  ) : (
                    <div className="bg-[#121212]/30 rounded-2xl p-12 text-center border border-white/5 flex flex-col items-center gap-4">
                      <Tv className="h-12 w-12 text-[#444]" />
                      <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-white">Canal no detectado</h3>
                        <p className="text-xs text-slate-500 mt-1">Selecciona cualquier canal para comenzar a reproducir.</p>
                      </div>
                    </div>
                  )}

                  {/* Active Grid Filter selector listed below Player for Live page */}
                  <div className="flex flex-col gap-4 mt-2">
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                      <h4 className="text-sm font-display font-black text-white uppercase tracking-wider">Otros Canales</h4>
                      <span className="text-xs text-slate-500">{filteredChannels.length} disponibles</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {filteredChannels.slice(0, 36).map(channel => {
                        const isCurrent = selectedChannel?.id === channel.id;
                        return (
                          <div
                            key={channel.id}
                            onClick={() => { setSelectedChannel(channel); setIsPlaying(true); }}
                            className={`group relative bg-[#0f1013] hover:bg-[#14161a] p-2.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all select-none ${
                              isCurrent 
                                ? 'border-red-600 bg-red-950/5' 
                                : 'border-white/5 hover:border-white/10'
                            }`}
                          >
                            <img src={channel.logo} alt="" className="h-7 object-contain flex-shrink-0" />
                            <div className="text-left min-w-0 flex-1">
                              <h5 className={`text-xs font-bold truncate group-hover:text-red-500 transition-colors ${
                                isCurrent ? 'text-red-500' : 'text-white'
                              }`}>{channel.n}</h5>
                              <span className="block text-[9px] text-slate-500 uppercase">{channel.c}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>

                {/* Satellite Gemini Helper sidebar (Col 4) */}
                <div className="flex flex-col gap-5">
                  
                  {/* AI Chat Widget */}
                  <div className="bg-[#0f1013] rounded-2xl border border-white/5 flex flex-col h-[520px] shadow-2xl overflow-hidden relative">
                    
                    {/* Head */}
                    <div className="p-4 bg-white/[0.02] border-b border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-red-600 to-amber-600 flex items-center justify-center shadow-lg">
                          <Sparkles className="h-4 w-4 text-white animate-pulse" />
                        </div>
                        <div className="text-left">
                          <h4 className="text-[11.5px] font-black uppercase tracking-wider text-white">Edge Vision IA</h4>
                          <span className="block text-[8px] font-mono text-emerald-500 font-bold tracking-tight uppercase">Satellite active</span>
                        </div>
                      </div>
                      <span className="text-[9px] text-slate-400 bg-white/5 px-2 py-0.5 rounded font-mono font-medium uppercase">Gemini 3.5</span>
                    </div>

                    {/* Chat Messages */}
                    <div 
                      ref={chatScrollRef}
                      className="flex-1 overflow-y-auto p-4 flex flex-col gap-3.5 scrollbar-thin text-left"
                    >
                      {chatMessages.map((msg, idx) => {
                        const isAssistant = msg.sender === 'assistant';
                        return (
                          <div 
                            key={idx}
                            className={`flex flex-col max-w-[85%] ${isAssistant ? 'self-start' : 'self-end'}`}
                          >
                            <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                              isAssistant 
                                ? 'bg-white/5 text-[#f1f5f9] rounded-tl-none border border-white/5' 
                                : 'bg-red-600 text-white rounded-tr-none shadow-md shadow-red-600/10'
                            }`}>
                              {msg.text}
                            </div>
                            <span className="text-[8px] text-slate-600 mt-1 font-mono self-end">
                              {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        );
                      })}

                      {isAiLoading && (
                        <div className="self-start flex items-center gap-2 text-[10px] font-mono text-slate-500 bg-white/5 py-2 px-3 rounded-lg border border-white/5 animate-pulse">
                          <div className="h-1.5 w-1.5 bg-red-600 rounded-full animate-bounce" />
                          <div className="h-1.5 w-1.5 bg-amber-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                          <div className="h-1.5 w-1.5 bg-yellow-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                          <span>Analizando stream con IA...</span>
                        </div>
                      )}
                    </div>

                    {/* Chat Form Submission */}
                    <form 
                      onSubmit={handleSendChat}
                      className="p-3 bg-white/[0.01] border-t border-white/5 flex items-center gap-2"
                    >
                      <input
                        type="text"
                        placeholder="Pregúntale al satélite IA..."
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        disabled={isAiLoading}
                        className="flex-1 bg-black/60 border border-white/5 focus:border-red-600/50 focus:outline-none focus:ring-1 focus:ring-red-600/50 text-xs py-2 px-3 rounded-xl text-white transition-all placeholder-slate-600 disabled:opacity-50"
                      />
                      <button
                        type="submit"
                        disabled={!chatInput.trim() || isAiLoading}
                        className="h-8 w-8 rounded-xl bg-red-600 hover:bg-red-500 disabled:bg-slate-800 text-white disabled:text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <Send className="h-3.5 w-3.5 fill-current" />
                      </button>
                    </form>
                  </div>

                  {/* Curated History displayed below chat */}
                  {historyList.length > 0 && (
                    <div className="flex flex-col gap-3 text-left">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-red-500" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Sintonizados recientemente</h4>
                      </div>
                      <div className="flex flex-col gap-2">
                        {historyList.slice(0, 4).map(channel => (
                          <button
                            key={channel.id}
                            onClick={() => setSelectedChannel(channel)}
                            className="flex items-center gap-3 bg-[#0f1013] hover:bg-slate-800/40 p-2.5 rounded-xl border border-white/5 cursor-pointer text-left transition-all group"
                          >
                            <img src={channel.logo} alt="" className="h-6 object-contain flex-shrink-0" />
                            <div className="overflow-hidden min-w-0">
                              <h5 className="text-[11.5px] font-bold text-white truncate group-hover:text-red-500 transition-colors">{channel.n}</h5>
                              <span className="block text-[8.5px] text-slate-500 capitalize">{channel.c}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

              </div>
            )}

          </div>

          {/* Premium Footer */}
          <footer className="mt-auto border-t border-white/5 bg-black py-5 px-6">
            <div className="max-w-[1300px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-2 font-display">
                <span className="font-extrabold text-white tracking-widest uppercase">EDGE IPTV</span>
                <span>&mdash;</span>
                <span>Satélite de Canales Premium de Alta Definición</span>
              </div>
              <div className="flex items-center gap-4 font-mono text-[9px] uppercase tracking-wider">
                <span>🔴 {allChannels.length} canales online</span>
                <span>📡 CDN Activo</span>
                <span>v10.0 Stable</span>
              </div>
            </div>
          </footer>

        </motion.div>
      )}
    </AnimatePresence>
  );
}
