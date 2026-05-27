export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // CORS preflight
    if (url.pathname === '/api/ai' && request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST,OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    }

    // Mistral AI proxy
    if (url.pathname === '/api/ai' && request.method === 'POST') {
      try {
        const body = await request.json();
        const apiKey = env.MISTRAL_API || env.MISTRAL_API_KEY || '';
        if (!apiKey) {
          return new Response(
            JSON.stringify({ error: 'MISTRAL_API not configured. Add it in Cloudflare Dashboard > Workers > Settings > Variables.' }),
            { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
          );
        }
        const resp = await fetch('https://api.mistral.ai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
          body: JSON.stringify({
            model: body.model || 'mistral-small',
            messages: body.messages || [],
            max_tokens: body.max_tokens || 200
          })
        });
        const data = await resp.json();
        return new Response(JSON.stringify(data), {
          status: resp.status,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }
    }

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>EDGE - Free HD IPTV</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#0b0b0b;--surface:#141414;--elevated:#1d1d1d;
  --red:#e8112d;--red-glow:rgba(232,17,45,0.3);
  --white:#f0f0f0;--gray:#a0a0a0;--muted:#666;
  --font-display:'Orbitron',monospace;--font-body:'Space Grotesk',sans-serif;
  --radius-card:8px;--radius-chip:20px;--radius-input:6px;
  --shadow:0 4px 24px rgba(0,0,0,0.4);--shadow-hover:0 8px 32px rgba(0,0,0,0.5);
  --transition:240ms ease;
}
html{scroll-behavior:smooth}
body{font-family:var(--font-body);background:var(--bg);color:var(--white);overflow-x:hidden;line-height:1.6}
a{color:var(--gray);text-decoration:none}
button{cursor:pointer;font-family:var(--font-body);border:none;outline:none;background:none}
img{max-width:100%;display:block}
::-webkit-scrollbar{width:5px;height:5px}
::-webkit-scrollbar-track{background:var(--surface)}
::-webkit-scrollbar-thumb{background:var(--muted);border-radius:3px}

/* ===== SPLASH - BULLETPROOF ===== */
#splash{position:fixed;inset:0;z-index:10000;background:var(--bg);display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:1;visibility:visible;transition:opacity 0.6s ease,visibility 0.6s ease}
#splash.hide{opacity:0;visibility:hidden;pointer-events:none}
.splash-wrap{display:flex;flex-direction:column;align-items:center}
.splash-logo-area{position:relative;overflow:hidden;padding:8px 20px}
.splash-logo{font-family:var(--font-display);font-size:72px;font-weight:900;color:var(--white);letter-spacing:12px;animation:logoGlow 1.5s ease-in-out infinite}
.splash-logo span{color:var(--red)}
.scanline{position:absolute;left:0;right:0;height:3px;background:linear-gradient(90deg,transparent 0%,rgba(232,17,45,0.4) 20%,rgba(232,17,45,0.7) 50%,rgba(232,17,45,0.4) 80%,transparent 100%);animation:scan 2s linear infinite;pointer-events:none}
@keyframes scan{0%{top:0}100%{top:100%}}
@keyframes logoGlow{0%,100%{text-shadow:0 0 20px rgba(232,17,45,0.2),0 0 40px rgba(232,17,45,0.08)}50%{text-shadow:0 0 30px rgba(232,17,45,0.4),0 0 60px rgba(232,17,45,0.15),0 0 100px rgba(232,17,45,0.08)}}
.splash-sub{font-family:var(--font-display);font-size:11px;color:var(--muted);letter-spacing:6px;margin-top:8px}
.load-seq{position:relative;height:20px;margin-top:24px;width:280px;text-align:center}
.phase{position:absolute;width:100%;text-align:center;left:0;font-family:var(--font-body);font-size:10px;letter-spacing:3px;opacity:0;font-weight:500}
.p1{animation:fadeIO 0.9s ease 0s forwards;color:var(--muted)}
.p2{animation:fadeIO 0.9s ease 0.85s forwards;color:var(--gray)}
.p3{animation:fadeIn 0.3s ease 1.7s forwards;color:var(--red)}
@keyframes fadeIO{0%{opacity:0}15%{opacity:1}85%{opacity:1}100%{opacity:0}}
@keyframes fadeIn{0%{opacity:0}100%{opacity:1}}
.load-bar-track{width:280px;height:3px;background:var(--elevated);border-radius:2px;overflow:hidden;margin-top:20px}
.load-bar-fill{height:100%;background:linear-gradient(90deg,var(--red),#ff4466,var(--red));border-radius:2px;animation:loadProgress 2.3s ease-in-out forwards}
@keyframes loadProgress{0%{width:0%}25%{width:30%}50%{width:55%}75%{width:80%}100%{width:100%}}

/* ===== NAVBAR ===== */
header{position:sticky;top:0;z-index:1000;background:rgba(11,11,11,0.8);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-bottom:1px solid rgba(255,255,255,0.06);padding:0 32px;height:64px;display:flex;align-items:center;justify-content:space-between}
.logo-mark{font-family:var(--font-display);font-size:22px;font-weight:900;letter-spacing:5px;color:var(--white)}
.logo-mark span{color:var(--red)}
header nav{display:flex;gap:24px;align-items:center}
header nav a{color:var(--muted);font-size:13px;font-weight:500;display:flex;align-items:center;gap:6px;transition:color var(--transition);padding:8px 0;position:relative}
header nav a:hover{color:var(--white)}
header nav a.active{color:var(--white)}
header nav a.active::after{content:'';position:absolute;bottom:-2px;left:0;width:100%;height:2px;background:rgba(255,255,255,0.3);border-radius:1px}
.hdr-right{display:flex;align-items:center;gap:14px}
.hdr-right button{color:var(--muted);font-size:17px;transition:color var(--transition);padding:6px}
.hdr-right button:hover{color:var(--white)}
#search-box{position:absolute;top:64px;right:32px;width:340px;background:rgba(20,20,20,0.9);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.08);border-radius:var(--radius-card);padding:14px;display:none;z-index:1001;box-shadow:var(--shadow)}
#search-box.open{display:block}
#search-box input{width:100%;background:var(--elevated);border:1px solid rgba(255,255,255,0.1);border-radius:var(--radius-input);padding:10px 14px;color:var(--white);font-size:13px;font-family:var(--font-body)}
#search-box input:focus{border-color:rgba(255,255,255,0.25);outline:none}

/* ===== HERO ===== */
.hero{position:relative;width:100%;height:420px;overflow:hidden;background:linear-gradient(135deg,var(--surface) 0%,#1a1a1a 50%,var(--surface) 100%)}
.hero::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 20% 50%,rgba(232,17,45,0.06) 0%,transparent 60%);z-index:1;pointer-events:none}
.hero::after{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 85% 40%,rgba(100,120,255,0.04) 0%,transparent 50%);z-index:1;pointer-events:none}
.hero-slide{position:absolute;inset:0;opacity:0;transition:opacity 1.2s ease;display:flex;align-items:center}
.hero-slide.active{opacity:1}
.hero-slide .slide-bg{position:absolute;inset:0;background-size:cover;background-position:center;filter:brightness(0.2) saturate(1.3) blur(1px)}
.hero-slide.active .slide-bg{animation:kenBurns 20s ease-in-out infinite alternate}
@keyframes kenBurns{0%{transform:scale(1)}100%{transform:scale(1.06)}}
.hero-slide .slide-grad{position:absolute;inset:0;background:linear-gradient(90deg,rgba(11,11,11,0.95) 0%,rgba(11,11,11,0.75) 40%,rgba(11,11,11,0.35) 70%,transparent 100%)}
.hero-slide .slide-content{position:relative;z-index:2;padding:0 60px;max-width:680px}
.slide-label{font-family:var(--font-display);font-size:10px;letter-spacing:4px;color:var(--red);text-transform:uppercase;margin-bottom:10px;font-weight:700}
.slide-title{font-family:var(--font-display);font-size:34px;font-weight:700;margin-bottom:10px;line-height:1.2;color:var(--white)}
.slide-desc{color:var(--gray);font-size:14px;margin-bottom:16px;line-height:1.5}
.slide-logo{height:50px;width:auto;max-width:180px;object-fit:contain;margin-bottom:12px;filter:drop-shadow(0 2px 8px rgba(0,0,0,0.6));background:rgba(0,0,0,0.4);border-radius:6px;padding:4px 10px}
.slide-meta{display:flex;align-items:center;gap:10px;margin-bottom:20px;flex-wrap:wrap}
.meta-badge{font-size:10px;padding:3px 10px;border-radius:4px;font-weight:600;letter-spacing:1px}
.meta-badge.dur{background:rgba(255,255,255,0.08);color:var(--gray);border:1px solid rgba(255,255,255,0.1)}
.meta-badge.qual{background:rgba(232,17,45,0.15);color:var(--red);border:1px solid rgba(232,17,45,0.3)}
.meta-badge.cat{background:rgba(255,255,255,0.06);color:var(--white);border:1px solid rgba(255,255,255,0.1)}
.meta-badge.src{background:rgba(255,255,255,0.05);color:var(--muted);border:1px solid rgba(255,255,255,0.06)}
.btn-watch{background:var(--red);color:#fff;padding:12px 28px;border-radius:var(--radius-card);font-weight:600;font-size:13px;letter-spacing:1px;transition:all var(--transition);display:inline-flex;align-items:center;gap:8px;font-family:var(--font-body)}
.btn-watch:hover{transform:translateY(-2px);box-shadow:0 8px 24px var(--red-glow)}
.hero-arrows{position:absolute;top:50%;width:100%;display:flex;justify-content:space-between;padding:0 16px;z-index:3;transform:translateY(-50%)}
.hero-arrows button{background:rgba(0,0,0,0.5);backdrop-filter:blur(8px);color:#fff;width:42px;height:42px;border-radius:50%;font-size:16px;display:flex;align-items:center;justify-content:center;transition:all var(--transition);border:1px solid rgba(255,255,255,0.1)}
.hero-arrows button:hover{background:rgba(255,255,255,0.15);border-color:rgba(255,255,255,0.2)}
.hero-dots{position:absolute;bottom:20px;left:50%;transform:translateX(-50%);display:flex;gap:8px;z-index:3}
.hero-dots span{width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,0.2);cursor:pointer;transition:all var(--transition)}
.hero-dots span.active{background:var(--white);box-shadow:0 0 10px rgba(255,255,255,0.3);width:24px;border-radius:4px}

/* ===== CATEGORY CHIPS ===== */
.cat-filter{display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap}
.cat-filter button{background:rgba(255,255,255,0.05);color:var(--gray);padding:7px 18px;border-radius:var(--radius-chip);font-size:12px;font-weight:500;transition:all var(--transition);border:1px solid rgba(255,255,255,0.08);backdrop-filter:blur(8px);display:flex;align-items:center;gap:5px}
.cat-filter button:hover{border-color:rgba(255,255,255,0.2);box-shadow:0 0 12px rgba(255,255,255,0.05);color:var(--white)}
.cat-filter button.active{background:var(--white);color:#0b0b0b;border-color:var(--white);font-weight:600}

/* ===== CHANNEL GRID ===== */
.channels-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px}
.ch-card{background:var(--surface);border-radius:var(--radius-card);overflow:hidden;border:1px solid rgba(255,255,255,0.04);transition:transform 240ms ease,box-shadow 240ms ease,border-color 240ms ease;position:relative;cursor:pointer;opacity:0;transform:translateY(10px)}
.ch-card.visible{opacity:1;transform:translateY(0);transition:opacity 300ms ease,transform 300ms ease,box-shadow 240ms ease,border-color 240ms ease}
.ch-card:hover{transform:translateY(-4px) scale(1.03);border-color:rgba(255,255,255,0.1);box-shadow:var(--shadow-hover)}
.ch-card .ch-thumb{width:100%;height:160px;position:relative;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center}
.ch-card .ch-thumb-img{position:absolute;inset:0;background-size:cover;background-position:center;filter:brightness(0.35) saturate(1.4);transition:filter 400ms ease,transform 400ms ease}
.ch-card:hover .ch-thumb-img{filter:brightness(0.5) saturate(1.6);transform:scale(1.08)}
.ch-card .ch-thumb-overlay{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0.15) 0%,rgba(0,0,0,0.85) 100%);z-index:1}
.ch-card .ch-thumb-icon{position:relative;z-index:2;font-size:32px;color:rgba(255,255,255,0.12);margin-bottom:4px}
.ch-card .ch-thumb-label{font-family:var(--font-display);font-size:11px;color:rgba(255,255,255,0.95);letter-spacing:3px;text-align:center;padding:10px;word-break:break-word;position:relative;z-index:2;text-shadow:0 2px 12px rgba(0,0,0,0.8);font-weight:700}
.ch-card .ch-logo{position:relative;z-index:2;height:60px;width:auto;max-width:140px;object-fit:contain;filter:drop-shadow(0 2px 8px rgba(0,0,0,0.6))}
.ch-card .ch-thumb-src{font-family:var(--font-body);font-size:9px;color:rgba(255,255,255,0.5);letter-spacing:1px;text-align:center;position:relative;z-index:2;margin-top:-4px;text-transform:uppercase}
.ch-card .live-badge{position:absolute;top:10px;left:10px;background:var(--red);color:#fff;font-size:9px;font-weight:700;padding:2px 8px;border-radius:4px;letter-spacing:1px;animation:livePulse 2s infinite;display:flex;align-items:center;gap:4px;z-index:3;font-family:var(--font-body)}
.ch-card .live-badge::before{content:'';width:5px;height:5px;border-radius:50%;background:#fff;animation:dotPulse 1s infinite}
.ch-card .ch-quality{position:absolute;top:10px;right:10px;background:rgba(0,0,0,0.7);color:var(--white);font-size:9px;font-weight:600;padding:2px 8px;border-radius:3px;letter-spacing:1px;z-index:3;border:1px solid rgba(255,255,255,0.15)}
.ch-card .ch-viewers{position:absolute;bottom:10px;left:10px;font-size:10px;color:rgba(255,255,255,0.7);z-index:3;display:flex;align-items:center;gap:4px;background:rgba(0,0,0,0.5);padding:2px 8px;border-radius:3px}
.ch-card .ch-viewers i{font-size:8px}
.ch-card .ch-cat-tag{position:absolute;bottom:10px;right:10px;font-size:9px;color:var(--white);z-index:3;background:rgba(0,0,0,0.5);padding:2px 8px;border-radius:3px;text-transform:capitalize}
.ch-card .ch-play{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) scale(0.8);width:44px;height:44px;border-radius:50%;background:rgba(232,17,45,0.85);display:flex;align-items:center;justify-content:center;color:#fff;font-size:16px;opacity:0;transition:all var(--transition);z-index:4}
.ch-card:hover .ch-play{opacity:1;transform:translate(-50%,-50%) scale(1)}
.ch-card .ch-body{padding:12px 14px}
.ch-card .ch-name{font-weight:600;font-size:13px;margin-bottom:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ch-card .ch-desc{color:var(--muted);font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
@keyframes livePulse{0%,100%{opacity:1}50%{opacity:0.7}}
@keyframes dotPulse{0%,100%{opacity:1}50%{opacity:0.3}}

/* ===== SKELETON CARDS ===== */
.skeleton-card{background:var(--surface);border-radius:var(--radius-card);overflow:hidden;border:1px solid rgba(255,255,255,0.04)}
.skeleton-thumb{width:100%;height:160px;background:linear-gradient(90deg,var(--elevated) 25%,#252525 50%,var(--elevated) 75%);background-size:200% 100%;animation:shimmer 1.5s infinite}
.skeleton-body{padding:12px 14px}
.skeleton-line{height:12px;background:linear-gradient(90deg,var(--elevated) 25%,#252525 50%,var(--elevated) 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;border-radius:4px;margin-bottom:8px}
.skeleton-line.short{width:60%}
@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}

/* ===== MAIN LAYOUT ===== */
.main-layout{display:flex;gap:24px;max-width:1440px;margin:0 auto;padding:28px 24px}
.main-content{flex:1;min-width:0}
.sidebar{width:300px;flex-shrink:0}
.section-title{font-family:var(--font-display);font-size:16px;font-weight:700;margin-bottom:18px;display:flex;align-items:center;gap:10px;color:var(--white)}
.section-title .st-bar{width:3px;height:18px;background:linear-gradient(180deg,var(--red),rgba(232,17,45,0.3));border-radius:2px}
.section-title .st-count{font-size:11px;color:var(--muted);font-weight:400;margin-left:auto;font-family:var(--font-body)}

/* ===== SIDEBAR ===== */
.sidebar-section{background:var(--surface);border-radius:var(--radius-card);border:1px solid rgba(255,255,255,0.04);padding:16px;margin-bottom:16px}
.sidebar-section h3{font-family:var(--font-display);font-size:10px;letter-spacing:2px;color:var(--red);margin-bottom:14px;text-transform:uppercase;display:flex;align-items:center;gap:8px}
.sidebar-toggle{cursor:pointer;display:flex;align-items:center;justify-content:space-between}
.sidebar-toggle .chevron{transition:transform var(--transition);font-size:12px;color:var(--muted)}
.sidebar-toggle.collapsed .chevron{transform:rotate(-90deg)}
.sidebar-body{overflow:hidden;transition:max-height 0.4s ease;max-height:600px}
.sidebar-body.collapsed{max-height:0}
.on-air-ch{display:flex;align-items:center;gap:10px;padding:6px;border-radius:6px;cursor:pointer;transition:background var(--transition);margin-bottom:4px}
.on-air-ch:hover{background:var(--elevated)}
.on-air-ch .oa-dot{width:8px;height:8px;border-radius:50%;background:var(--red);flex-shrink:0;animation:dotPulse 1.5s infinite}
.on-air-ch .oa-name{font-size:12px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1}
.on-air-ch .oa-viewers{font-size:10px;color:var(--muted)}
.on-air-ch .oa-logo{height:20px;width:auto;max-width:60px;object-fit:contain;flex-shrink:0;filter:drop-shadow(0 1px 4px rgba(0,0,0,0.5))}
.trending-item .tr-logo{height:20px;width:auto;max-width:60px;object-fit:contain;flex-shrink:0;filter:drop-shadow(0 1px 4px rgba(0,0,0,0.5))}
.trending-item{display:flex;align-items:center;gap:8px;margin-bottom:8px;cursor:pointer;padding:4px 6px;border-radius:4px;transition:background var(--transition)}
.trending-item:hover{background:var(--elevated)}
.trending-item .tr-rank{font-family:var(--font-display);font-size:14px;color:var(--red);min-width:20px}
.trending-item .tr-name{font-size:12px;font-weight:500;flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.trending-item .tr-viewers{font-size:10px;color:var(--muted)}
.mp-chat{display:flex;flex-direction:column;gap:8px}
.mp-input-wrap{display:flex;gap:6px}
.mp-input{flex:1;background:var(--elevated);border:1px solid rgba(255,255,255,0.1);border-radius:var(--radius-input);padding:8px 10px;color:var(--white);font-size:12px;font-family:var(--font-body)}
.mp-input:focus{border-color:rgba(255,255,255,0.25);outline:none}
.mp-send{background:var(--red);color:#fff;padding:8px 12px;border-radius:var(--radius-input);font-size:12px;transition:all var(--transition)}
.mp-send:hover{box-shadow:0 0 12px var(--red-glow)}
.mp-msg{font-size:12px;color:var(--gray);line-height:1.5;padding:8px;background:var(--elevated);border-radius:6px;border-left:2px solid var(--red)}

/* ===== PLAYER ===== */
#player-modal{position:fixed;inset:0;z-index:9000;background:rgba(0,0,0,0.95);display:none;align-items:center;justify-content:center}
#player-modal.open{display:flex}
.player-wrap{position:relative;width:92%;max-width:1000px;background:#000;border-radius:var(--radius-card);overflow:hidden;box-shadow:0 0 80px rgba(0,0,0,0.6)}
.player-wrap video{width:100%;aspect-ratio:16/9;display:block;background:#000}
.player-close{position:absolute;top:12px;right:12px;background:rgba(0,0,0,0.6);backdrop-filter:blur(8px);color:#fff;width:38px;height:38px;border-radius:50%;font-size:16px;display:flex;align-items:center;justify-content:center;z-index:5;transition:all var(--transition);border:1px solid rgba(255,255,255,0.1)}
.player-close:hover{background:var(--red);border-color:var(--red)}
.player-spinner{position:absolute;inset:0;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,0.5);z-index:4}
.player-spinner.show{display:flex}
.spinner-ring{width:48px;height:48px;border:3px solid rgba(255,255,255,0.1);border-top-color:var(--red);border-radius:50%;animation:spin 0.8s linear infinite}
@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
.buffering-overlay{position:absolute;inset:0;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,0.3);z-index:3}
.buffering-overlay.show{display:flex}
.buffer-pulse{width:12px;height:12px;border-radius:50%;background:var(--red);animation:bufferPulse 1s ease infinite}
@keyframes bufferPulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.5);opacity:0.5}}
.offline-overlay{position:absolute;inset:0;background:rgba(0,0,0,0.9);display:none;flex-direction:column;align-items:center;justify-content:center;gap:14px;z-index:5}
.offline-overlay.show{display:flex}
.offline-overlay .off-icon{font-size:48px;color:var(--red);opacity:0.5}
.offline-overlay .off-text{font-family:var(--font-display);font-size:14px;color:var(--gray);letter-spacing:4px}
.offline-overlay .off-hint{font-size:12px;color:var(--muted);max-width:300px;text-align:center;line-height:1.5}
.offline-overlay .btn-retry{background:var(--red);color:#fff;padding:10px 24px;border-radius:var(--radius-card);font-weight:600;font-size:13px;transition:all var(--transition)}
.offline-overlay .btn-retry:hover{box-shadow:0 0 20px var(--red-glow)}
.offline-overlay .btn-switch{background:var(--elevated);color:var(--gray);padding:8px 20px;border-radius:var(--radius-card);font-size:12px;transition:all var(--transition);border:1px solid rgba(255,255,255,0.1)}
.offline-overlay .btn-switch:hover{background:var(--surface);color:var(--white)}
.player-bar{display:flex;align-items:center;gap:12px;padding:10px 16px;background:var(--surface);border-top:1px solid rgba(255,255,255,0.06)}
.player-bar button{color:var(--muted);font-size:16px;transition:color var(--transition);padding:4px}
.player-bar button:hover{color:var(--white)}
.p-title{flex:1;font-size:13px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-family:var(--font-body)}
.p-status{font-size:10px;padding:2px 8px;border-radius:4px;font-weight:600;letter-spacing:1px}
.p-status.live{background:var(--red);color:#fff;animation:livePulse 2s infinite}
.p-status.connecting{background:rgba(255,193,7,0.2);color:#ffc107}
.p-status.offline{background:var(--elevated);color:var(--muted)}
.p-quality{font-size:10px;padding:2px 8px;border-radius:4px;background:rgba(255,255,255,0.08);color:var(--white);font-weight:600;letter-spacing:1px;display:none}
.vol-slider{-webkit-appearance:none;appearance:none;width:80px;height:4px;background:var(--muted);border-radius:2px;outline:none;cursor:pointer}
.vol-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:12px;height:12px;border-radius:50%;background:var(--white);cursor:pointer;transition:background var(--transition)}
.vol-slider::-webkit-slider-thumb:hover{background:var(--red)}
.vol-slider::-moz-range-thumb{width:12px;height:12px;border-radius:50%;background:var(--white);cursor:pointer;border:none}

/* ===== UPCOMING SCROLL ===== */
.upcoming-scroll{display:flex;gap:14px;overflow-x:auto;padding-bottom:10px;scroll-snap-type:x mandatory}
.upcoming-card{min-width:200px;background:var(--surface);border-radius:var(--radius-card);padding:14px;border:1px solid rgba(255,255,255,0.04);scroll-snap-align:start;flex-shrink:0;cursor:pointer;transition:all var(--transition)}
.upcoming-card:hover{border-color:rgba(255,255,255,0.1);transform:translateY(-2px)}
.upcoming-card .uc-cat{font-size:9px;color:var(--red);font-weight:600;letter-spacing:2px;margin-bottom:6px;text-transform:uppercase}
.upcoming-card .uc-name{font-size:13px;font-weight:500;margin-bottom:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.upcoming-card .uc-time{font-family:var(--font-display);font-size:13px;color:var(--white);letter-spacing:1px}

/* ===== FOOTER ===== */
footer{background:var(--surface);border-top:1px solid rgba(255,255,255,0.04);padding:28px 24px;text-align:center;margin-top:48px}
footer .f-brand{font-family:var(--font-display);font-size:11px;letter-spacing:4px;color:var(--muted)}
footer .f-brand span{color:var(--red)}
footer .f-stats{display:flex;justify-content:center;gap:28px;margin-top:12px}
footer .f-stats .stat{font-size:11px;color:var(--muted)}
footer .f-stats .stat strong{color:var(--white);font-family:var(--font-display)}

/* ===== TOAST ===== */
.toast{position:fixed;bottom:24px;right:24px;background:var(--elevated);color:var(--white);padding:12px 20px;border-radius:var(--radius-card);font-size:13px;z-index:9999;transform:translateY(80px);opacity:0;transition:all var(--transition);border-left:3px solid var(--red);max-width:320px;box-shadow:var(--shadow)}
.toast.show{transform:translateY(0);opacity:1}
.toast.error{border-left-color:#ff4444}

/* ===== RESPONSIVE ===== */
@media(max-width:1024px){
  .main-layout{flex-direction:column}
  .sidebar{width:100%}
  .channels-grid{grid-template-columns:repeat(auto-fill,minmax(200px,1fr))}
  .hero{height:360px}
  .hero-slide .slide-content{padding:0 30px}
  .slide-title{font-size:28px}
}
@media(max-width:640px){
  .channels-grid{grid-template-columns:1fr 1fr}
  header nav{gap:12px}
  header nav a span{display:none}
  header{padding:0 16px}
  .hero{height:280px}
  .slide-title{font-size:22px}
  .hero-slide .slide-content{padding:0 20px}
  .slide-desc{display:none}
  .sidebar-section{padding:12px}
  .vol-slider{width:50px}
}
</style>
</head>
<body>

<div id="splash">
  <div class="splash-wrap">
    <div class="splash-logo-area">
      <div class="splash-logo">E<span>D</span>GE</div>
      <div class="scanline"></div>
    </div>
    <div class="splash-sub">FREE HD IPTV</div>
    <div class="load-seq">
      <span class="phase p1">INITIALIZING...</span>
      <span class="phase p2">LOADING STREAMS...</span>
      <span class="phase p3">READY</span>
    </div>
    <div class="load-bar-track"><div class="load-bar-fill"></div></div>
  </div>
</div>

<header>
  <div class="logo-mark">E<span>D</span>GE</div>
  <nav>
    <a href="#" class="active" data-nav="home"><i class="fas fa-home"></i><span>Home</span></a>
    <a href="#" data-nav="live"><i class="fas fa-tv"></i><span>Live</span></a>
    <a href="#" data-nav="sports"><i class="fas fa-futbol"></i><span>Sports</span></a>
    <a href="#" data-nav="news"><i class="fas fa-newspaper"></i><span>News</span></a>
  </nav>
  <div class="hdr-right">
    <button id="sound-toggle" title="Toggle Sound"><i class="fas fa-volume-mute"></i></button>
    <button id="search-toggle" title="Search"><i class="fas fa-search"></i></button>
  </div>
</header>
<div id="search-box">
  <input type="text" id="search-input" placeholder="Search channels...">
</div>

<section class="hero" id="hero-section">
  <div id="hero-slides"></div>
  <div class="hero-arrows">
    <button id="hero-prev"><i class="fas fa-chevron-left"></i></button>
    <button id="hero-next"><i class="fas fa-chevron-right"></i></button>
  </div>
  <div class="hero-dots" id="hero-dots"></div>
</section>

<div class="main-layout">
  <main class="main-content">
    <section id="channels-section">
      <h2 class="section-title"><span class="st-bar"></span>Live Channels<span class="st-count" id="ch-count"></span></h2>
      <div class="cat-filter" id="cat-filter"></div>
      <div class="channels-grid" id="channels-grid"></div>
    </section>
    <section id="upcoming-section" style="margin-top:40px">
      <h2 class="section-title"><span class="st-bar"></span>Coming Up</h2>
      <div class="upcoming-scroll" id="upcoming-scroll"></div>
    </section>
  </main>
  <aside class="sidebar">
    <div class="sidebar-section">
      <div class="sidebar-toggle" id="on-air-toggle">
        <h3><i class="fas fa-broadcast-tower"></i>On Air Now</h3>
        <i class="fas fa-chevron-down chevron"></i>
      </div>
      <div class="sidebar-body" id="on-air-body"></div>
    </div>
    <div class="sidebar-section">
      <div class="sidebar-toggle" id="trending-toggle">
        <h3><i class="fas fa-fire"></i>Trending</h3>
        <i class="fas fa-chevron-down chevron"></i>
      </div>
      <div class="sidebar-body" id="trending-body"></div>
    </div>
    <div class="sidebar-section">
      <div class="sidebar-toggle" id="mistral-toggle">
        <h3><i class="fas fa-robot"></i>AI Assistant</h3>
        <i class="fas fa-chevron-down chevron"></i>
      </div>
      <div class="sidebar-body" id="mistral-body">
        <div class="mp-chat">
          <div class="mp-msg" id="mistral-msg">Ask me about channels! I can recommend similar content.</div>
          <div class="mp-input-wrap">
            <input class="mp-input" id="mistral-input" placeholder="Ask about channels...">
            <button class="mp-send" id="mistral-send"><i class="fas fa-paper-plane"></i></button>
          </div>
        </div>
      </div>
    </div>
  </aside>
</div>

<div id="player-modal">
  <div class="player-wrap">
    <button class="player-close" id="player-close"><i class="fas fa-times"></i></button>
    <video id="hls-video" muted playsinline></video>
    <div class="player-spinner" id="player-spinner"><div class="spinner-ring"></div></div>
    <div class="buffering-overlay" id="buffering-overlay"><div class="buffer-pulse"></div></div>
    <div class="offline-overlay" id="offline-overlay">
      <i class="fas fa-signal off-icon"></i>
      <div class="off-text">STREAM OFFLINE</div>
      <div class="off-hint">This stream may be geo-blocked. Try another channel or use a VPN.</div>
      <button class="btn-retry" id="btn-retry"><i class="fas fa-redo"></i> Retry</button>
      <button class="btn-switch" id="btn-switch"><i class="fas fa-exchange-alt"></i> Try Next Channel</button>
    </div>
    <div class="player-bar">
      <button id="play-pause"><i class="fas fa-play"></i></button>
      <button id="vol-btn"><i class="fas fa-volume-mute"></i></button>
      <input type="range" id="vol-slider" min="0" max="100" value="0" class="vol-slider">
      <span class="p-title" id="player-title">-</span>
      <span class="p-quality" id="quality-indicator">HD</span>
      <span class="p-status connecting" id="player-status">CONNECTING</span>
      <button id="audio-btn" title="Audio"><i class="fas fa-headphones"></i></button>
      <button id="fullscreen-btn"><i class="fas fa-expand"></i></button>
    </div>
  </div>
</div>

<div class="toast" id="toast"></div>

<footer>
  <div class="f-brand">EDGE <span>v4.0</span> &mdash; 100% Free IPTV</div>
  <div class="f-stats">
    <div class="stat"><strong id="stat-ch">0</strong> channels</div>
    <div class="stat"><strong id="stat-hd">0</strong> HD</div>
    <div class="stat"><strong>9</strong> categories</div>
  </div>
</footer>

<script>
// ===== BULLETPROOF SPLASH DISMISS =====
(function(){
  function killSplash(){
    var s=document.getElementById('splash');
    if(s)s.classList.add('hide');
  }
  setTimeout(killSplash,2500);
  setTimeout(killSplash,3500);
  setTimeout(killSplash,5000);
  document.addEventListener('DOMContentLoaded',function(){setTimeout(killSplash,1000);});
  window.addEventListener('load',function(){setTimeout(killSplash,500);});
  window.onerror=function(msg,url,line){
    killSplash();
    console.error('JS Error:',msg,url,line);
    return true;
  };
})();
<\/script>
<script src="https://cdn.jsdelivr.net/npm/hls.js@1.5.7"><\/script>
<script>
// ===== EDGE IPTV - Main Application =====
(function(){
'use strict';

// ===== CHANNEL DATA WITH ORIGINAL LOGOS =====
var CHANNELS=[
{id:1,n:"Al Jazeera English",s:"https://live-hls-apps-aje-fa.getaj.net/AJE/index.m3u8",c:"news",q:"1080p",src:"Al Jazeera",v:10492,d:"Global news from the Middle East",clr:"#fa9000",logo:"https://upload.wikimedia.org/wikipedia/en/thumb/f/f2/Aljazeera.svg/200px-Aljazeera.svg.png"},
{id:2,n:"Al Jazeera Arabic",s:"https://live-hls-apps-aja-fa.getaj.net/AJA/01.m3u8",c:"news",q:"1080p",src:"Al Jazeera",v:13631,d:"Arabic-language 24h news",clr:"#fa9000",logo:"https://upload.wikimedia.org/wikipedia/en/thumb/f/f2/Aljazeera.svg/200px-Aljazeera.svg.png"},
{id:3,n:"France 24 English",s:"https://live.france24.com/hls/live/2037218-b/F24_EN_HI_HLS/master_5000.m3u8",c:"news",q:"1080p",src:"France 24",v:12298,d:"International news from Paris",clr:"#0055a5",logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/France_24_logo.svg/200px-France_24_logo.svg.png"},
{id:4,n:"France 24 French",s:"https://live.france24.com/hls/live/2037179-b/F24_FR_HI_HLS/master_5000.m3u8",c:"news",q:"1080p",src:"France 24",v:14869,d:"Actualites en francais",clr:"#0055a5",logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/France_24_logo.svg/200px-France_24_logo.svg.png"},
{id:5,n:"France 24 Arabic",s:"https://live.france24.com/hls/live/2037222-b/F24_AR_HI_HLS/master_5000.m3u8",c:"news",q:"1080p",src:"France 24",v:7713,d:"Arabic French news",clr:"#0055a5",logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/France_24_logo.svg/200px-France_24_logo.svg.png"},
{id:6,n:"DW English",s:"https://dwamdstream102.akamaized.net/hls/live/2015525/dwstream102/master.m3u8",c:"news",q:"1080p",src:"Deutsche Welle",v:6034,d:"Germany international broadcaster",clr:"#003399",logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Deutsche_Welle_symbol_2012.svg/200px-Deutsche_Welle_symbol_2012.svg.png"},
{id:7,n:"DW Spanish",s:"https://dwamdstream104.akamaized.net/hls/live/2015530/dwstream104/master.m3u8",c:"news",q:"1080p",src:"Deutsche Welle",v:793,d:"DW en espanol",clr:"#003399",logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Deutsche_Welle_symbol_2012.svg/200px-Deutsche_Welle_symbol_2012.svg.png"},
{id:8,n:"ABC News Live",s:"https://abc-news-dmd-streams-1.akamaized.net/out/v1/701126012d044971b3fa89406a440133/index.m3u8",c:"news",q:"720p",src:"ABC News",v:10380,d:"24/7 live news from ABC",clr:"#e4002b",logo:"https://upload.wikimedia.org/wikipedia/en/thumb/2/2f/ABC_News_logo_2021.svg/200px-ABC_News_logo_2021.svg.png"},
{id:9,n:"ABC News Stream 1",s:"https://abcnews-streams.akamaized.net/hls/live/2023560/abcnewshudson1/master_4000.m3u8",c:"news",q:"720p",src:"ABC News",v:8200,d:"ABC News live stream",clr:"#e4002b",logo:"https://upload.wikimedia.org/wikipedia/en/thumb/2/2f/ABC_News_logo_2021.svg/200px-ABC_News_logo_2021.svg.png"},
{id:10,n:"Africa 24",s:"https://africa24.vedge.infomaniak.com/livecast/ik:africa24/manifest.m3u8",c:"news",q:"1080p",src:"Infomaniak",v:2469,d:"Pan-African news",clr:"#007a3d",logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Africa_24_logo.svg/200px-Africa_24_logo.svg.png"},
{id:11,n:"Euronews English",s:"https://d35j504z0x2vu2.cloudfront.net/v1/master/0bc8e8376bd8417a1b6761138aa41c26c7309312/euronews/euronews-en.m3u8",c:"news",q:"720p",src:"Euronews",v:6721,d:"European world news",clr:"#003876",logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Euronews_2016_logo.svg/200px-Euronews_2016_logo.svg.png"},
{id:12,n:"Court TV",s:"https://cdn-uw2-prod.tsv2.amagi.tv/linear/amg01438-ewscrippscompan-courttv-tablo/playlist.m3u8",c:"news",q:"1080p",src:"Stirr",v:13660,d:"Live trial coverage",clr:"#1a3a5c",logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Court_TV_2019.svg/200px-Court_TV_2019.svg.png"},
{id:13,n:"ACCDN",s:"https://raycom-accdn-firetv.amagi.tv/playlist.m3u8",c:"sports",q:"1080p",src:"Amagi",v:9995,d:"ACC Digital Network",clr:"#003087",logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/ACC_Network_logo.svg/200px-ACC_Network_logo.svg.png"},
{id:14,n:"CBS Sports Golazo",s:"https://proped3fhg87.airspace-cdn.cbsivideo.com/golazo-live-dai/master/golazo-live-dai.m3u8",c:"sports",q:"720p",src:"CBS",v:8200,d:"24/7 soccer network",clr:"#0047ab",logo:"https://upload.wikimedia.org/wikipedia/en/thumb/3/3a/CBS_Sports_Golazo_Network_logo.svg/200px-CBS_Sports_Golazo_Network_logo.svg.png"},
{id:15,n:"FIFA+ English",s:"https://a62dad94.wurl.com/master/f36d25e7e52f1ba8d7e56eb859c636563214f541/UmFrdXRlblRWLWV1X0ZJRkFQbHVzRW5nbGlzaF9ITFM/playlist.m3u8",c:"sports",q:"720p",src:"FIFA+",v:7100,d:"FIFA content English",clr:"#326295",logo:"https://upload.wikimedia.org/wikipedia/en/thumb/5/50/FIFA%2B_logo.svg/200px-FIFA%2B_logo.svg.png"},
{id:16,n:"FIFA+ Spanish",s:"https://6c849fb3.wurl.com/master/f36d25e7e52f1ba8d7e56eb859c636563214f541/TEctbXhfRklGQVBsdXNTcGFuaXNoLTFfS0xT/playlist.m3u8",c:"sports",q:"720p",src:"FIFA+",v:5200,d:"FIFA en espanol",clr:"#326295",logo:"https://upload.wikimedia.org/wikipedia/en/thumb/5/50/FIFA%2B_logo.svg/200px-FIFA%2B_logo.svg.png"},
{id:17,n:"fubo Sports",s:"https://dnf08l6u6uxnz.cloudfront.net/master.m3u8",c:"sports",q:"1080p",src:"fuboTV",v:11400,d:"Free sports network",clr:"#6c2dc7",logo:"https://upload.wikimedia.org/wikipedia/en/thumb/8/8e/FuboTV.svg/200px-FuboTV.svg.png"},
{id:18,n:"Billiard TV",s:"https://1621590671.rsc.cdn77.org/HLS/BILLIARDTV.m3u8",c:"sports",q:"1080p",src:"CDN77",v:6314,d:"24/7 billiards",clr:"#1b5e20",logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Cue_sports_pictogram.svg/120px-Cue_sports_pictogram.svg.png"},
{id:19,n:"FTF Sports",s:"https://1657061170.rsc.cdn77.org/HLS/FTF-LINEAR.m3u8",c:"sports",q:"720p",src:"CDN77",v:4400,d:"Football combat sports",clr:"#b71c1c",logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Football_pictogram.svg/120px-Football_pictogram.svg.png"},
{id:20,n:"FanDuel Racing",s:"https://d3ehq1uaxory6w.cloudfront.net/out/v1/35c05f080f4e49a4b4eb031b5a14e505/TVG2index_2.m3u8",c:"sports",q:"720p",src:"FanDuel",v:3500,d:"Live horse racing",clr:"#1493ff",logo:"https://upload.wikimedia.org/wikipedia/en/thumb/4/4c/FanDuel_logo.svg/200px-FanDuel_logo.svg.png"},
{id:21,n:"FanDuel TV",s:"https://d2jl8r92tdc3f1.cloudfront.net/out/v1/59419700344b4625b7cb0693ba265ea3/TVGindex_1.m3u8",c:"sports",q:"720p",src:"FanDuel",v:4100,d:"Sports betting analysis",clr:"#1493ff",logo:"https://upload.wikimedia.org/wikipedia/en/thumb/4/4c/FanDuel_logo.svg/200px-FanDuel_logo.svg.png"},
{id:22,n:"DAZN Combat",s:"https://dazn-combat-rakuten.amagi.tv/hls/amagi_hls_data_rakutenAA-dazn-combat-rakuten/CDN/master.m3u8",c:"sports",q:"1080p",src:"Rakuten",v:8600,d:"Combat sports 24/7",clr:"#333",logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/DAZN_logo.svg/200px-DAZN_logo.svg.png"},
{id:23,n:"GLORY Kickboxing",s:"https://6f972d29.wurl.com/master/f36d25e7e52f1ba8d7e56eb859c636563214f541/UmFrdXRlblRWLWV1X0dsb3J5S2lja2JveGluZ19ITFM/playlist.m3u8",c:"sports",q:"720p",src:"Rakuten",v:3700,d:"World kickboxing",clr:"#dc143c",logo:"https://upload.wikimedia.org/wikipedia/en/thumb/8/8e/Glory_Logo.jpg/200px-Glory_Logo.jpg"},
{id:24,n:"Speed Sport 1",s:"https://linear-599.frequency.stream/dist/stirr/599/hls/master/playlist.m3u8",c:"sports",q:"1080p",src:"Stirr",v:5400,d:"Motorsport racing",clr:"#ff6600",logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Auto_racing_pictogram.svg/120px-Auto_racing_pictogram.svg.png"},
{id:25,n:"Artflix Classics",s:"https://amogonetworx-artflix-1-nl.samsung.wurl.tv/playlist.m3u8",c:"movies",q:"720p",src:"Samsung TV+",v:5800,d:"Classic cinema golden age",clr:"#8d6e63",logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Samsung_TV_Plus_logo.svg/200px-Samsung_TV_Plus_logo.svg.png"},
{id:26,n:"Alien Nation DUST",s:"https://dqi7ayt2o24fn.cloudfront.net/playlist.m3u8",c:"movies",q:"1080p",src:"DUST",v:2479,d:"Sci-fi short films",clr:"#4a148c",logo:"https://upload.wikimedia.org/wikipedia/en/thumb/0/0f/Dust_short_film_logo.svg/200px-Dust_short_film_logo.svg.png"},
{id:27,n:"70s Cinema",s:"https://jmp2.uk/plu-5f4d878d3d19b30007d2e782.m3u8",c:"movies",q:"720p",src:"Pluto TV",v:4100,d:"Classic 1970s movies",clr:"#bf360c",logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Pluto_TV_logo_2020.svg/200px-Pluto_TV_logo_2020.svg.png"},
{id:28,n:"80s Rewind",s:"https://jmp2.uk/plu-5ca525b650be2571e3943c63.m3u8",c:"movies",q:"720p",src:"Pluto TV",v:6200,d:"Best of 1980s cinema",clr:"#e91e63",logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Pluto_TV_logo_2020.svg/200px-Pluto_TV_logo_2020.svg.png"},
{id:29,n:"90s Throwback",s:"https://jmp2.uk/plu-5f4d86f519358a00072b978e.m3u8",c:"movies",q:"720p",src:"Pluto TV",v:5500,d:"90s movies marathon",clr:"#9c27b0",logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Pluto_TV_logo_2020.svg/200px-Pluto_TV_logo_2020.svg.png"},
{id:30,n:"24h Free Movies",s:"https://d1b5mlajbmvkjv.cloudfront.net/v1/master/9d062541f2ff39b5c0f48b743c6411d25f62fc25/UDU-DistroTV/145.m3u8",c:"movies",q:"720p",src:"DistroTV",v:7800,d:"Free movies 24/7",clr:"#37474f",logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Distro_TV_logo.svg/200px-Distro_TV_logo.svg.png"},
{id:31,n:"30A Classic Movies",s:"https://30a-tv.com/feeds/pzaz/30atvmovies.m3u8",c:"movies",q:"720p",src:"30A TV",v:3200,d:"Timeless movie classics",clr:"#3e2723",logo:"https://upload.wikimedia.org/wikipedia/en/thumb/8/85/30A_Entertainment_logo.svg/200px-30A_Entertainment_logo.svg.png"},
{id:32,n:"Rakuten Action",s:"https://284824cf70404fdfb6ddf9349009c710.mediatailor.eu-west-1.amazonaws.com/v1/master/0547f18649bd788bec7b67b746e47670f558b6b2/production-LiveChannel-6066/master.m3u8",c:"movies",q:"1080p",src:"Rakuten",v:12246,d:"Action movies 24/7",clr:"#d32f2f",logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Rakuten_TV_logo.svg/200px-Rakuten_TV_logo.svg.png"},
{id:33,n:"Rakuten Top UK",s:"https://0145451975a64b35866170fd2e8fa486.mediatailor.eu-west-1.amazonaws.com/v1/master/0547f18649bd788bec7b67b746e47670f558b6b2/production-LiveChannel-5987/master.m3u8",c:"movies",q:"1080p",src:"Rakuten",v:9466,d:"Top UK movies",clr:"#1565c0",logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Rakuten_TV_logo.svg/200px-Rakuten_TV_logo.svg.png"},
{id:34,n:"Charge! Action",s:"https://fast-channels.sinclairstoryline.com/CHARGE/index.m3u8",c:"movies",q:"1080p",src:"Sinclair",v:10663,d:"Action movies series",clr:"#c62828",logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Charge%21_TV_logo.svg/200px-Charge%21_TV_logo.svg.png"},
{id:35,n:"AMC Reality",s:"https://amc-absolutereality-1-us.plex.wurl.tv/playlist.m3u8",c:"entertainment",q:"720p",src:"Plex TV",v:7100,d:"Reality TV from AMC",clr:"#5d4037",logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/AMC_Networks_2024.svg/200px-AMC_Networks_2024.svg.png"},
{id:36,n:"ALLBLK Gems",s:"https://df1zke3zj042m.cloudfront.net/playlist.m3u8",c:"entertainment",q:"720p",src:"ALLBLK",v:4200,d:"Black culture entertainment",clr:"#4a148c",logo:"https://upload.wikimedia.org/wikipedia/en/thumb/0/05/ALLBLK_logo.svg/200px-ALLBLK_logo.svg.png"},
{id:37,n:"Bounce XL",s:"https://cdn-uw2-prod.tsv2.amagi.tv/linear/amg01438-ewscrippscompan-bouncexl-tablo/playlist.m3u8",c:"entertainment",q:"1080p",src:"Stirr",v:6800,d:"African-American entertainment",clr:"#ff6f00",logo:"https://upload.wikimedia.org/wikipedia/en/thumb/2/29/Bounce_TV_logo.svg/200px-Bounce_TV_logo.svg.png"},
{id:38,n:"Buzzr Game Shows",s:"https://buzzrota-ono.amagi.tv/playlist.m3u8",c:"entertainment",q:"1080p",src:"Amagi",v:9100,d:"Classic game shows 24/7",clr:"#ff9800",logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Buzzr_logo.svg/200px-Buzzr_logo.svg.png"},
{id:39,n:"AsianCrush",s:"https://linear-900.frequency.stream/dist/cineverse/900/hls/master/playlist.m3u8",c:"entertainment",q:"1080p",src:"Frequency",v:5400,d:"Asian movies dramas",clr:"#e91e63",logo:"https://upload.wikimedia.org/wikipedia/en/thumb/9/9f/AsianCrush_logo.svg/200px-AsianCrush_logo.svg.png"},
{id:40,n:"AfroLandTV",s:"https://alt-al.otteravision.com/alt/al/al.m3u8",c:"entertainment",q:"1080p",src:"AfroLand",v:3800,d:"African entertainment",clr:"#1b5e20",logo:"https://upload.wikimedia.org/wikipedia/en/thumb/7/70/AfroLandTV_logo.svg/200px-AfroLandTV_logo.svg.png"},
{id:41,n:"30A Television",s:"https://30a-tv.com/feeds/masters/30atv.m3u8",c:"entertainment",q:"720p",src:"30A TV",v:2900,d:"Florida beach lifestyle",clr:"#00838f",logo:"https://upload.wikimedia.org/wikipedia/en/thumb/8/85/30A_Entertainment_logo.svg/200px-30A_Entertainment_logo.svg.png"},
{id:42,n:"Forensic Files",s:"https://jmp2.uk/plu-5bb1af6a268cae539bcedb0a.m3u8",c:"entertainment",q:"720p",src:"Pluto TV",v:8300,d:"Crime investigations",clr:"#455a64",logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Pluto_TV_logo_2020.svg/200px-Pluto_TV_logo_2020.svg.png"},
{id:43,n:"CMC California",s:"https://cmc-ono.amagi.tv/playlist.m3u8",c:"music",q:"1080p",src:"Amagi",v:6126,d:"California Music Channel",clr:"#e91e63",logo:"https://upload.wikimedia.org/wikipedia/en/thumb/e/ef/CMC_Music_Channel_logo.svg/200px-CMC_Music_Channel_logo.svg.png"},
{id:44,n:"30A Music",s:"https://30a-tv.com/music.m3u8",c:"music",q:"720p",src:"30A TV",v:2100,d:"Beach music vibes",clr:"#00bcd4",logo:"https://upload.wikimedia.org/wikipedia/en/thumb/8/85/30A_Entertainment_logo.svg/200px-30A_Entertainment_logo.svg.png"},
{id:45,n:"Dance Television",s:"https://m1b2.worldcast.tv/dancetelevisionone/dancetelevisionone.m3u8",c:"music",q:"1080p",src:"WorldCast",v:4300,d:"Electronic dance music",clr:"#7c4dff",logo:"https://upload.wikimedia.org/wikipedia/en/thumb/b/b7/Dance_Television_logo.png/200px-Dance_Television_logo.png"},
{id:46,n:"DanceTV EDM",s:"https://mbit1.worldcast.tv/dancetelevisionseven/multibit.m3u8",c:"music",q:"1080p",src:"WorldCast",v:3800,d:"Mainstage EDM live",clr:"#651fff",logo:"https://upload.wikimedia.org/wikipedia/en/thumb/b/b7/Dance_Television_logo.png/200px-Dance_Television_logo.png"},
{id:47,n:"DanceTV Techno",s:"https://m2b2.worldcast.tv:7443/dancetelevisionthree/dancetelevisionthree.m3u8",c:"music",q:"1080p",src:"WorldCast",v:2900,d:"Underground techno",clr:"#311b92",logo:"https://upload.wikimedia.org/wikipedia/en/thumb/b/b7/Dance_Television_logo.png/200px-Dance_Television_logo.png"},
{id:48,n:"Clubbing TV",s:"https://d1j2csarxnwazk.cloudfront.net/v1/master/3722c60a815c199d9c0ef36c5b73da68a62b09d1/cc-uze1m6xh4fiyr-ssai-prd/master.m3u8",c:"music",q:"720p",src:"Rakuten",logo:"https://upload.wikimedia.org/wikipedia/en/thumb/a/a2/Clubbing_TV_logo.svg/200px-Clubbing_TV_logo.svg.png",v:5100,d:"Club DJ music",clr:"#9c27b0"},
{id:49,n:"Stingray Rock",s:"https://lotus.stingray.com/manifest/ose-101ads-montreal/samsungtvplus/master.m3u8",c:"music",q:"1080p",src:"Samsung TV+",v:7200,d:"Classic rock hits",clr:"#f44336",logo:"https://upload.wikimedia.org/wikipedia/en/thumb/9/98/Stingray_Music_logo.svg/200px-Stingray_Music_logo.svg.png"},
{id:50,n:"Stingray Hit List",s:"https://lotus.stingray.com/manifest/ose-107ads-montreal/samsungtvplus/master.m3u8",c:"music",q:"1080p",src:"Samsung TV+",v:10903,d:"Today biggest hits",clr:"#ff5722",logo:"https://upload.wikimedia.org/wikipedia/en/thumb/9/98/Stingray_Music_logo.svg/200px-Stingray_Music_logo.svg.png"},
{id:51,n:"BBC Kids",s:"https://dmr1h4skdal9h.cloudfront.net/playlist.m3u8",c:"kids",q:"720p",src:"BBC",v:2721,d:"Children BBC programming",clr:"#00897b",logo:"https://upload.wikimedia.org/wikipedia/en/thumb/4/41/CBBC_2016.svg/200px-CBBC_2016.svg.png"},
{id:52,n:"Baby Shark TV",s:"https://newidco-babysharktv-1-us.roku.wurl.tv/playlist.m3u8",c:"kids",q:"1080p",src:"Roku",v:3477,d:"Baby Shark friends",clr:"#ff9800",logo:"https://upload.wikimedia.org/wikipedia/en/thumb/9/96/Baby_Shark%27s_Big_Show_logo.svg/200px-Baby_Shark%27s_Big_Show_logo.svg.png"},
{id:53,n:"Brat TV",s:"https://streams2.sofast.tv/v1/master/611d79b11b77e2f571934fd80ca1413453772ac7/04072b68-dc6a-4d5e-98af-f356ba8d5063/playlist.m3u8",c:"kids",q:"720p",src:"SoFast",v:4398,d:"Gen Z entertainment",clr:"#e040fb",logo:"https://upload.wikimedia.org/wikipedia/en/thumb/d/d4/Brat_TV_logo.svg/200px-Brat_TV_logo.svg.png"},
{id:54,n:"Camp Spoopy",s:"https://stream.ads.ottera.tv/playlist.m3u8?network_id=269",c:"kids",q:"576p",src:"Ottera",v:1800,d:"Spooky fun kids",clr:"#4a148c",logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Ghost_pictogram.svg/120px-Ghost_pictogram.svg.png"},
{id:55,n:"Avatar Pluto",s:"https://jmp2.uk/plu-600adbdf8c554e00072125c9.m3u8",c:"kids",q:"720p",src:"Pluto TV",v:6700,d:"Avatar Nickelodeon",clr:"#00897b",logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Pluto_TV_logo_2020.svg/200px-Pluto_TV_logo_2020.svg.png"},
{id:56,n:"Anime Vision",s:"https://d1ujfw1zyymzyd.cloudfront.net/v1/master/3722c60a815c199d9c0ef36c5b73da68a62b09d1/cc-a6fukwkbxmex8/live/fast-channel-animevision-64527ec0/fast-channel-animevision-64527ec0.m3u8",c:"kids",q:"1080p",src:"Cineverse",v:3603,d:"Anime streaming 24/7",clr:"#e91e63",logo:"https://upload.wikimedia.org/wikipedia/en/thumb/9/9e/Anime_Network_logo.svg/200px-Anime_Network_logo.svg.png"},
{id:57,n:"Documentary+",s:"https://ef79b15c8c7c46c7a9de9d33001dbd07.mediatailor.us-west-2.amazonaws.com/v1/master/ba62fe743df0fe93366eba3a257d792884136c7f/LINEAR-859-DOCUMENTARYPLUS-DOCUMENTARYPLUS/mt/documentaryplus/859/hls/master/playlist.m3u8",c:"documentary",q:"1080p",src:"Amazon",v:7800,d:"Award-winning docs",clr:"#1b5e20",logo:"https://upload.wikimedia.org/wikipedia/en/thumb/9/9a/Documentary%2B_logo.svg/200px-Documentary%2B_logo.svg.png"},
{id:58,n:"Docurama",s:"https://docurama-plex-ingest.cinedigm.com/playlist.m3u8",c:"documentary",q:"1080p",src:"Plex TV",v:4600,d:"Curated documentary films",clr:"#0d47a1",logo:"https://upload.wikimedia.org/wikipedia/en/thumb/5/5e/Docurama_logo.svg/200px-Docurama_logo.svg.png"},
{id:59,n:"DangerTV",s:"https://dk0n7jh428tzj.cloudfront.net/v1/dangertv/samsungheadend_us/latest/main/hls/playlist.m3u8",c:"documentary",q:"720p",src:"Samsung TV+",v:3200,d:"Extreme adventure",clr:"#b71c1c",logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Samsung_TV_Plus_logo.svg/200px-Samsung_TV_Plus_logo.svg.png"},
{id:60,n:"Curiosity NOW",s:"https://amg00170-amg00170c4-samsung-gb-4232.playouts.now.amagi.tv/playlist.m3u8",c:"documentary",q:"1080p",src:"Samsung TV+",v:5100,d:"Science nature docs",clr:"#0277bd",logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Samsung_TV_Plus_logo.svg/200px-Samsung_TV_Plus_logo.svg.png"},
{id:61,n:"4K Travel TV",s:"https://d35j504z0x2vu2.cloudfront.net/v1/master/0bc8e8376bd8417a1b6761138aa41c26c7309312/4k-travel-tv/manifest.m3u8",c:"documentary",q:"1080p",src:"DistroTV",v:4900,d:"Travel world in 4K",clr:"#00695c",logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Distro_TV_logo.svg/200px-Distro_TV_logo.svg.png"},
{id:62,n:"5-Minute Craft",s:"https://soul-5mincrafteng-rakuten.amagi.tv/playlist.m3u8",c:"documentary",q:"1080p",src:"Rakuten",v:12145,d:"DIY craft videos",clr:"#ff6f00",logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Rakuten_TV_logo.svg/200px-Rakuten_TV_logo.svg.png"},
{id:63,n:"Bloomberg TV",s:"https://d35j504z0x2vu2.cloudfront.net/v1/master/0bc8e8376bd8417a1b6761138aa41c26c7309312/bloomberg-television/bloombergtv.m3u8",c:"international",q:"1080p",src:"Bloomberg",v:11414,d:"Global business finance",clr:"#5c068c",logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Bloomberg_L.P._Logo.svg/200px-Bloomberg_L.P._Logo.svg.png"},
{id:64,n:"BBC Earth",s:"https://amg00793-amg00793c6-xumo-us-2669.playouts.now.amagi.tv/BBCStudios-BBCEarthA-hls/playlist.m3u8",c:"international",q:"1080p",src:"Xumo",v:10718,d:"Nature science BBC",clr:"#2e7d32",logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/BBC_Earth_2023.svg/200px-BBC_Earth_2023.svg.png"},
{id:65,n:"BBC Top Gear",s:"https://amg00793-amg00793c5-xumo-us-2664.playouts.now.amagi.tv/bbcstudios-bbctopgear8min-all/playlist.m3u8",c:"international",q:"1080p",src:"Xumo",v:7734,d:"Top Gear highlights",clr:"#c62828",logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/TopGearLogo.svg/200px-TopGearLogo.svg.png"},
{id:66,n:"Alhurra Iraq",s:"https://mbn-ingest-worldsafe.akamaized.net/hls/live/2038899/MBN_Iraq_Worldsafe_HLS/master.m3u8",c:"international",q:"720p",src:"MBN",v:3400,d:"Iraqi news programming",clr:"#1565c0",logo:"https://upload.wikimedia.org/wikipedia/en/thumb/5/5e/Alhurra_TV_logo.svg/200px-Alhurra_TV_logo.svg.png"},
{id:67,n:"ABC 5 St Paul",s:"https://amg01942-amg01942c2-stirr-us-10173.playouts.now.amagi.tv/playlist.m3u8",c:"international",q:"1080p",src:"Stirr",v:2200,d:"Local ABC Minneapolis",clr:"#e4002b",logo:"https://upload.wikimedia.org/wikipedia/en/thumb/2/2f/ABC_News_logo_2021.svg/200px-ABC_News_logo_2021.svg.png"},
{id:68,n:"AccuWeather NOW",s:"https://cdn-ue1-prod.tsv2.amagi.tv/linear/amg00684-accuweather-accuweather-plex/playlist.m3u8",c:"international",q:"1080p",src:"Plex TV",v:6100,d:"24/7 weather forecasts",clr:"#0277bd",logo:"https://upload.wikimedia.org/wikipedia/en/thumb/d/d3/AccuWeather_logo.svg/200px-AccuWeather_logo.svg.png"},
{id:69,n:"Al Jazeera Mubasher",s:"https://live-hls-apps-ajm-fa.getaj.net/AJM/index.m3u8",c:"news",q:"1080p",src:"Al Jazeera",v:7218,d:"Live events conferences",clr:"#fa9000",logo:"https://upload.wikimedia.org/wikipedia/en/thumb/f/f2/Aljazeera.svg/200px-Aljazeera.svg.png"},
{id:70,n:"France 24 Spanish",s:"https://live.france24.com/hls/live/2037220-b/F24_ES_HI_HLS/master_5000.m3u8",c:"news",q:"1080p",src:"France 24",v:9333,d:"Noticias en espanol",clr:"#0055a5",logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/France_24_logo.svg/200px-France_24_logo.svg.png"},
{id:71,n:"Africanews",s:"https://d35j504z0x2vu2.cloudfront.net/v1/master/0bc8e8376bd8417a1b6761138aa41c26c7309312/africanews/africanews-en.m3u8",c:"news",q:"720p",src:"Africanews",v:1800,d:"African news English",clr:"#007a3d",logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Africanews_logo.svg/200px-Africanews_logo.svg.png"},
{id:72,n:"America Voice News",s:"https://content.uplynk.com/channel/26bd482ffe364a1282bc3df28bd3c21f.m3u8",c:"news",q:"720p",src:"Uplynk",v:4100,d:"American news",clr:"#b71c1c",logo:"https://upload.wikimedia.org/wikipedia/en/thumb/2/2f/ABC_News_logo_2021.svg/200px-ABC_News_logo_2021.svg.png"},
{id:73,n:"ACI Sport TV",s:"https://webstream.multistream.it/memfs/e2cb3629-c1a2-495b-b43a-9eb386f04ed8.m3u8",c:"sports",q:"1080p",src:"Multistream",v:4057,d:"Italian motorsport",clr:"#009688",logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Auto_racing_pictogram.svg/120px-Auto_racing_pictogram.svg.png"},
{id:74,n:"FITE 24/7",s:"https://d3d85c7qkywguj.cloudfront.net/scheduler/scheduleMaster/263.m3u8",c:"sports",q:"1080p",src:"FITE",v:5600,d:"Combat pro wrestling",clr:"#311b92",logo:"https://upload.wikimedia.org/wikipedia/en/thumb/e/e8/FITE_logo.svg/200px-FITE_logo.svg.png"},
{id:75,n:"Sport Italia",s:"https://amg01370-italiansportcom-sportitalia-rakuten-3hmdb.amagi.tv/hls/amagi_hls_data_rakutenAA-sportitalia-rakuten/CDN/master.m3u8",c:"sports",q:"1080p",src:"Rakuten",v:6764,d:"Italian sports",clr:"#00897b",logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Rakuten_TV_logo.svg/200px-Rakuten_TV_logo.svg.png"},
{id:76,n:"Africa 24 Sport",s:"https://africa24.vedge.infomaniak.com/livecast/ik:africa24sport/manifest.m3u8",c:"sports",q:"1080p",src:"Infomaniak",v:2800,d:"African sports",clr:"#007a3d",logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Africa_24_logo.svg/200px-Africa_24_logo.svg.png"}
];

var CATS=[
{id:"all",label:"All",icon:"fa-globe"},
{id:"news",label:"News",icon:"fa-newspaper"},
{id:"sports",label:"Sports",icon:"fa-futbol"},
{id:"movies",label:"Movies",icon:"fa-film"},
{id:"entertainment",label:"Entertainment",icon:"fa-star"},
{id:"music",label:"Music",icon:"fa-music"},
{id:"kids",label:"Kids",icon:"fa-child"},
{id:"documentary",label:"Docs",icon:"fa-book"},
{id:"international",label:"World",icon:"fa-earth-americas"}
];

var CAT_GRAD={
news:'linear-gradient(135deg,#1a237e 0%,#0d47a1 50%,#01579b 100%)',
sports:'linear-gradient(135deg,#1b5e20 0%,#2e7d32 50%,#388e3c 100%)',
movies:'linear-gradient(135deg,#311b92 0%,#4a148c 50%,#6a1b9a 100%)',
entertainment:'linear-gradient(135deg,#bf360c 0%,#d84315 50%,#e65100 100%)',
music:'linear-gradient(135deg,#880e4f 0%,#ad1457 50%,#c2185b 100%)',
kids:'linear-gradient(135deg,#e65100 0%,#f57c00 50%,#ff9800 100%)',
documentary:'linear-gradient(135deg,#263238 0%,#37474f 50%,#455a64 100%)',
international:'linear-gradient(135deg,#004d40 0%,#00695c 50%,#00796b 100%)'
};
var CAT_ICON={
news:'fa-newspaper',sports:'fa-futbol',movies:'fa-film',entertainment:'fa-star',
music:'fa-music',kids:'fa-child',documentary:'fa-book-open',international:'fa-earth-americas'
};

// ===== STATE =====
var curFilter='all',curCh=null,hlsInst=null,heroIdx=0,heroIv=null;
var retryCount=0,MAX_RETRIES=3,playerRetryTimer=null;
var audioCtx=null;
var soundEnabled=true;
try{soundEnabled=localStorage.getItem('edge-sound')!=='off';}catch(e){}

// ===== UTILITIES =====
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function fmtV(v){if(v>=1000)return (v/1000).toFixed(1)+'K';return v.toString();}
function catLabel(c){for(var i=0;i<CATS.length;i++){if(CATS[i].id===c)return CATS[i].label;}return c;}

// ===== AUDIO =====
function initAudio(){try{audioCtx=new(window.AudioContext||window.webkitAudioContext)();}catch(e){}}
function playBlip(){
  if(!audioCtx||!soundEnabled)return;
  try{var o=audioCtx.createOscillator(),g=audioCtx.createGain();o.connect(g);g.connect(audioCtx.destination);o.type='sine';o.frequency.setValueAtTime(880,audioCtx.currentTime);o.frequency.exponentialRampToValueAtTime(440,audioCtx.currentTime+0.1);g.gain.setValueAtTime(0.08,audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(0.001,audioCtx.currentTime+0.1);o.start(audioCtx.currentTime);o.stop(audioCtx.currentTime+0.1);}catch(e){}
}
function playClick(){
  if(!audioCtx||!soundEnabled)return;
  try{var o=audioCtx.createOscillator(),g=audioCtx.createGain();o.connect(g);g.connect(audioCtx.destination);o.type='sine';o.frequency.setValueAtTime(1200,audioCtx.currentTime);o.frequency.exponentialRampToValueAtTime(600,audioCtx.currentTime+0.05);g.gain.setValueAtTime(0.03,audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(0.001,audioCtx.currentTime+0.05);o.start(audioCtx.currentTime);o.stop(audioCtx.currentTime+0.05);}catch(e){}
}
document.addEventListener('click',function onFirstClick(){
  if(!audioCtx)initAudio();
  document.removeEventListener('click',onFirstClick);
},{once:true});

// ===== DISMISS SPLASH HELPER =====
function killSplash(){
  var s=document.getElementById('splash');
  if(s)s.classList.add('hide');
}

// ===== RENDER CATEGORIES =====
function renderCats(){
  var el=document.getElementById('cat-filter');
  if(!el)return;
  var h='';
  for(var i=0;i<CATS.length;i++){
    var c=CATS[i];
    var cnt=c.id==='all'?CHANNELS.length:CHANNELS.filter(function(ch){return ch.c===c.id;}).length;
    h+='<button data-cat="'+c.id+'" class="'+(c.id===curFilter?'active':'')+'"><i class="fas '+c.icon+'"></i> '+c.label+' <span style="opacity:0.6">('+cnt+')</span></button>';
  }
  el.innerHTML=h;
}

// ===== RENDER SKELETONS =====
function renderSkeletons(){
  var grid=document.getElementById('channels-grid');
  if(!grid)return;
  var h='';
  for(var i=0;i<12;i++){
    h+='<div class="skeleton-card"><div class="skeleton-thumb"></div><div class="skeleton-body"><div class="skeleton-line"></div><div class="skeleton-line short"></div></div></div>';
  }
  grid.innerHTML=h;
}

// ===== RENDER CHANNEL GRID =====
function renderGrid(){
  var grid=document.getElementById('channels-grid');
  if(!grid)return;
  var list=curFilter==='all'?CHANNELS:CHANNELS.filter(function(ch){return ch.c===curFilter;});
  var countEl=document.getElementById('ch-count');
  if(countEl)countEl.textContent=list.length+' channels';
  if(!list.length){grid.innerHTML='<div style="text-align:center;padding:40px;color:var(--muted)">No channels found</div>';return;}
  var h='';
  for(var i=0;i<list.length;i++){
    var ch=list[i];
    var catGrad=CAT_GRAD[ch.c]||CAT_GRAD.news;
    var catIcon=CAT_ICON[ch.c]||'fa-tv';
    var logoHtml=ch.logo?'<img class="ch-logo" src="'+ch.logo+'" alt="'+esc(ch.n)+'" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\';">':'';
    var iconStyle=ch.logo?'style="display:none"':'';
    h+='<div class="ch-card" data-id="'+ch.id+'">'+
      '<div class="ch-thumb">'+
        '<div class="ch-thumb-img" style="background:'+catGrad+'"></div>'+
        '<div class="ch-thumb-overlay"></div>'+
        logoHtml+
        '<div class="ch-thumb-icon" '+iconStyle+'><i class="fas '+catIcon+'"></i></div>'+
        '<div class="ch-thumb-label">'+esc(ch.n)+'</div>'+
        '<div class="ch-thumb-src">'+esc(ch.src)+'</div>'+
        '<span class="live-badge">LIVE</span>'+
        '<span class="ch-quality">'+ch.q+'</span>'+
        '<span class="ch-viewers"><i class="fas fa-eye"></i> '+fmtV(ch.v)+'</span>'+
        '<span class="ch-cat-tag">'+catLabel(ch.c)+'</span>'+
        '<div class="ch-play"><i class="fas fa-play"></i></div>'+
      '</div>'+
      '<div class="ch-body">'+
        '<div class="ch-name">'+esc(ch.n)+'</div>'+
        '<div class="ch-desc">'+esc(ch.d)+'</div>'+
      '</div></div>';
  }
  grid.innerHTML=h;
}

// ===== LAZY LOAD =====
function setupLazyLoad(){
  if(!('IntersectionObserver' in window)){
    var cards=document.querySelectorAll('.ch-card');
    for(var i=0;i<cards.length;i++)cards[i].classList.add('visible');
    return;
  }
  var observer=new IntersectionObserver(function(entries){
    for(var i=0;i<entries.length;i++){
      if(entries[i].isIntersecting){
        entries[i].target.classList.add('visible');
        observer.unobserve(entries[i].target);
      }
    }
  },{threshold:0.1,rootMargin:'50px'});
  var cards=document.querySelectorAll('.ch-card');
  for(var i=0;i<cards.length;i++)observer.observe(cards[i]);
}

// ===== RENDER HERO =====
function renderHero(){
  var featured=CHANNELS.slice().sort(function(a,b){return b.v-a.v;}).slice(0,5);
  var slidesEl=document.getElementById('hero-slides');
  var dotsEl=document.getElementById('hero-dots');
  if(!slidesEl||!dotsEl)return;
  var sh='',dh='';
  for(var i=0;i<featured.length;i++){
    var ch=featured[i];
    var isActive=i===0?'active':'';
    var logoHtml=ch.logo?'<img class="slide-logo" src="'+ch.logo+'" alt="'+esc(ch.n)+'" onerror="this.style.display=\'none\'">':'';
    sh+='<div class="hero-slide '+isActive+'" data-idx="'+i+'">'+
      '<div class="slide-bg" style="background:'+(CAT_GRAD[ch.c]||CAT_GRAD.news)+'"></div>'+
      '<div class="slide-grad"></div>'+
      '<div class="slide-content">'+
        '<div class="slide-label">NOW STREAMING</div>'+
        logoHtml+
        '<h2 class="slide-title">'+esc(ch.n)+'</h2>'+
        '<p class="slide-desc">'+esc(ch.d)+'</p>'+
        '<div class="slide-meta">'+
          '<span class="meta-badge dur"><i class="fas fa-clock" style="margin-right:3px"></i>24/7</span>'+
          '<span class="meta-badge qual">'+ch.q+'</span>'+
          '<span class="meta-badge cat">'+catLabel(ch.c)+'</span>'+
          '<span class="meta-badge src">'+esc(ch.src)+'</span>'+
        '</div>'+
        '<button class="btn-watch" data-id="'+ch.id+'"><i class="fas fa-play"></i> Watch Now</button>'+
      '</div></div>';
    dh+='<span data-idx="'+i+'" class="'+(i===0?'active':'')+'"></span>';
  }
  slidesEl.innerHTML=sh;
  dotsEl.innerHTML=dh;
}

function startHero(){
  heroIv=setInterval(function(){
    var slides=document.querySelectorAll('.hero-slide');
    var dots=document.querySelectorAll('.hero-dots span');
    if(!slides.length)return;
    slides[heroIdx].classList.remove('active');
    dots[heroIdx].classList.remove('active');
    heroIdx=(heroIdx+1)%slides.length;
    slides[heroIdx].classList.add('active');
    dots[heroIdx].classList.add('active');
  },6000);
}

function goHero(idx){
  var slides=document.querySelectorAll('.hero-slide');
  var dots=document.querySelectorAll('.hero-dots span');
  if(!slides.length)return;
  slides[heroIdx].classList.remove('active');
  dots[heroIdx].classList.remove('active');
  heroIdx=idx%slides.length;
  slides[heroIdx].classList.add('active');
  dots[heroIdx].classList.add('active');
}

// ===== RENDER SIDEBAR =====
function renderSidebar(){
  var onAirBody=document.getElementById('on-air-body');
  var trendingBody=document.getElementById('trending-body');
  var topCh=CHANNELS.slice().sort(function(a,b){return b.v-a.v;}).slice(0,6);
  if(onAirBody){
    var oh='';
    for(var i=0;i<topCh.length;i++){
      var ch=topCh[i];
      var logoHtml=ch.logo?'<img class="oa-logo" src="'+ch.logo+'" onerror="this.style.display=\'none\'">':'';
      oh+='<div class="on-air-ch" data-id="'+ch.id+'"><div class="oa-dot"></div>'+logoHtml+'<span class="oa-name">'+esc(ch.n)+'</span><span class="oa-viewers">'+fmtV(ch.v)+'</span></div>';
    }
    onAirBody.innerHTML=oh;
  }
  if(trendingBody){
    var th='';
    for(var j=0;j<topCh.length;j++){
      var tc=topCh[j];
      var logoHtml2=tc.logo?'<img class="tr-logo" src="'+tc.logo+'" onerror="this.style.display=\'none\'">':'';
      th+='<div class="trending-item" data-id="'+tc.id+'"><span class="tr-rank">'+(j+1)+'</span>'+logoHtml2+'<span class="tr-name">'+esc(tc.n)+'</span><span class="tr-viewers">'+fmtV(tc.v)+'</span></div>';
    }
    trendingBody.innerHTML=th;
  }
}

// ===== RENDER UPCOMING =====
function renderUpcoming(){
  var el=document.getElementById('upcoming-scroll');
  if(!el)return;
  var cats=['news','sports','movies','entertainment','music','kids','documentary','international'];
  var h='';
  for(var i=0;i<cats.length;i++){
    var chs=CHANNELS.filter(function(c){return c.c===cats[i];});
    if(!chs.length)continue;
    var pick=chs[Math.floor(Math.random()*chs.length)];
    var hrs=[18,19,20,21,22,23,0,1,2];
    var hr=hrs[Math.floor(Math.random()*hrs.length)];
    var ampm=hr>=12?'PM':'AM';
    var disp=hr===0?12:hr>12?hr-12:hr;
    h+='<div class="upcoming-card" data-id="'+pick.id+'">'+
      '<div class="uc-cat">'+catLabel(pick.c)+'</div>'+
      '<div class="uc-name">'+esc(pick.n)+'</div>'+
      '<div class="uc-time">'+disp+':00 '+ampm+'</div></div>';
  }
  el.innerHTML=h;
}

// ===== PLAYER =====
function openPlayer(ch){
  curCh=ch;
  retryCount=0;
  if(playerRetryTimer){clearTimeout(playerRetryTimer);playerRetryTimer=null;}
  var modal=document.getElementById('player-modal');
  var video=document.getElementById('hls-video');
  var title=document.getElementById('player-title');
  var status=document.getElementById('player-status');
  if(title)title.textContent=ch.n;
  if(status){status.className='p-status connecting';status.textContent='CONNECTING';}
  if(modal)modal.classList.add('open');
  hideOffline();
  showSpinnerEl();
  startStream(ch.s);
  document.body.style.overflow='hidden';
  var msgEl=document.getElementById('mistral-msg');
  if(msgEl)msgEl.textContent='Now playing: '+ch.n+'. Ask me for similar channels!';
}

function startStream(url){
  if(hlsInst){hlsInst.destroy();hlsInst=null;}
  var video=document.getElementById('hls-video');
  if(!video)return;
  video.removeAttribute('src');
  video.load();
  hideOffline();
  showSpinnerEl();
  if(typeof Hls!=='undefined'&&Hls.isSupported()){
    hlsInst=new Hls({enableWorker:true,lowLatencyMode:true,maxBufferLength:30,maxMaxBufferLength:60});
    hlsInst.loadSource(url);
    hlsInst.attachMedia(video);
    hlsInst.on(Hls.Events.MANIFEST_PARSED,function(){
      video.play().catch(function(){});
      hideSpinnerEl();
      setStatus('live');
      updateQuality();
    });
    hlsInst.on(Hls.Events.ERROR,function(event,data){
      if(data.fatal){
        if(data.type===Hls.ErrorTypes.MEDIA_ERROR){hlsInst.recoverMediaError();}
        else{handleFatalError(url);}
      }
    });
  }else if(video.canPlayType('application/vnd.apple.mpegurl')){
    video.src=url;
    video.addEventListener('loadedmetadata',function onMeta(){
      video.play().catch(function(){});
      hideSpinnerEl();
      setStatus('live');
      updateQuality();
      video.removeEventListener('loadedmetadata',onMeta);
    });
  }
  video.onerror=function(){handleFatalError(url);};
  video.onwaiting=function(){showBuffering();};
  video.onplaying=function(){hideBuffering();hideSpinnerEl();setStatus('live');};
  video.onloadedmetadata=function(){updateQuality();};
}

function handleFatalError(url){
  if(retryCount<MAX_RETRIES){
    retryCount++;
    var delay=Math.pow(2,retryCount)*1000;
    showToast('Retrying in '+(delay/1000)+'s ('+retryCount+'/'+MAX_RETRIES+')');
    if(playerRetryTimer)clearTimeout(playerRetryTimer);
    playerRetryTimer=setTimeout(function(){startStream(url);},delay);
  }else{tryNextInCategory();}
}

function tryNextInCategory(){
  if(!curCh){showOffline();return;}
  var same=CHANNELS.filter(function(ch){return ch.c===curCh.c&&ch.id!==curCh.id;});
  if(!same.length){showOffline();return;}
  var next=same[0];
  showToast('Switching to: '+next.n);
  retryCount=0;
  curCh=next;
  var t=document.getElementById('player-title');if(t)t.textContent=next.n;
  setStatus('connecting');
  hideOffline();
  showSpinnerEl();
  startStream(next.s);
}

function closePlayer(){
  var modal=document.getElementById('player-modal');
  var video=document.getElementById('hls-video');
  if(hlsInst){hlsInst.destroy();hlsInst=null;}
  if(video){video.pause();video.removeAttribute('src');video.load();}
  if(modal)modal.classList.remove('open');
  if(playerRetryTimer){clearTimeout(playerRetryTimer);playerRetryTimer=null;}
  document.body.style.overflow='';
  hideOffline();hideSpinnerEl();hideBuffering();
}

function setStatus(s){
  var el=document.getElementById('player-status');
  if(!el)return;
  el.className='p-status '+s;
  el.textContent=s==='live'?'LIVE':s==='connecting'?'CONNECTING':'OFFLINE';
}
function showSpinnerEl(){var el=document.getElementById('player-spinner');if(el)el.classList.add('show');}
function hideSpinnerEl(){var el=document.getElementById('player-spinner');if(el)el.classList.remove('show');}
function showBuffering(){var el=document.getElementById('buffering-overlay');if(el)el.classList.add('show');}
function hideBuffering(){var el=document.getElementById('buffering-overlay');if(el)el.classList.remove('show');}
function showOffline(){var el=document.getElementById('offline-overlay');if(el)el.classList.add('show');setStatus('offline');hideSpinnerEl();hideBuffering();}
function hideOffline(){var el=document.getElementById('offline-overlay');if(el)el.classList.remove('show');}

function updateQuality(){
  var video=document.getElementById('hls-video');
  var qi=document.getElementById('quality-indicator');
  if(!video||!qi)return;
  var w=video.videoWidth;
  if(w>=2160)qi.textContent='4K';
  else if(w>=1280)qi.textContent='HD';
  else if(w>=720)qi.textContent='720p';
  else qi.textContent='SD';
  qi.style.display='inline-block';
}

// ===== TOAST =====
var toastTimer=null;
function showToast(msg,type){
  var el=document.getElementById('toast');
  if(!el)return;
  el.textContent=msg;
  el.className='toast'+(type==='error'?' error':'')+' show';
  if(toastTimer)clearTimeout(toastTimer);
  toastTimer=setTimeout(function(){el.classList.remove('show');},3000);
}

// ===== SOUND TOGGLE =====
function toggleSound(){
  soundEnabled=!soundEnabled;
  try{localStorage.setItem('edge-sound',soundEnabled?'on':'off');}catch(e){}
  var btn=document.getElementById('sound-toggle');
  if(btn)btn.innerHTML=soundEnabled?'<i class="fas fa-volume-up"></i>':'<i class="fas fa-volume-mute"></i>';
  if(soundEnabled&&!audioCtx)initAudio();
  showToast(soundEnabled?'Sound enabled':'Sound disabled');
}

// ===== SEARCH =====
function doSearch(q){
  q=q.toLowerCase().trim();
  if(!q){curFilter='all';renderGrid();setupLazyLoad();renderCats();return;}
  var results=CHANNELS.filter(function(ch){
    return ch.n.toLowerCase().indexOf(q)>=0||ch.c.toLowerCase().indexOf(q)>=0||ch.src.toLowerCase().indexOf(q)>=0||ch.d.toLowerCase().indexOf(q)>=0;
  });
  var grid=document.getElementById('channels-grid');
  var countEl=document.getElementById('ch-count');
  if(countEl)countEl.textContent=results.length+' results';
  if(!results.length){if(grid)grid.innerHTML='<div style="text-align:center;padding:40px;color:var(--muted)">No channels match "'+esc(q)+'"</div>';return;}
  var h='';
  for(var i=0;i<results.length;i++){
    var ch=results[i];
    var catGrad=CAT_GRAD[ch.c]||CAT_GRAD.news;
    var catIcon=CAT_ICON[ch.c]||'fa-tv';
    var logoHtml=ch.logo?'<img class="ch-logo" src="'+ch.logo+'" alt="'+esc(ch.n)+'" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\';">':'';
    var iconStyle=ch.logo?'style="display:none"':'';
    h+='<div class="ch-card visible" data-id="'+ch.id+'">'+
      '<div class="ch-thumb">'+
        '<div class="ch-thumb-img" style="background:'+catGrad+'"></div>'+
        '<div class="ch-thumb-overlay"></div>'+
        logoHtml+
        '<div class="ch-thumb-icon" '+iconStyle+'><i class="fas '+catIcon+'"></i></div>'+
        '<div class="ch-thumb-label">'+esc(ch.n)+'</div>'+
        '<div class="ch-thumb-src">'+esc(ch.src)+'</div>'+
        '<span class="live-badge">LIVE</span>'+
        '<span class="ch-quality">'+ch.q+'</span>'+
        '<span class="ch-viewers"><i class="fas fa-eye"></i> '+fmtV(ch.v)+'</span>'+
        '<span class="ch-cat-tag">'+catLabel(ch.c)+'</span>'+
        '<div class="ch-play"><i class="fas fa-play"></i></div>'+
      '</div>'+
      '<div class="ch-body">'+
        '<div class="ch-name">'+esc(ch.n)+'</div>'+
        '<div class="ch-desc">'+esc(ch.d)+'</div>'+
      '</div></div>';
  }
  if(grid)grid.innerHTML=h;
}

// ===== STATS =====
function updateStats(){
  var chEl=document.getElementById('stat-ch');
  var hdEl=document.getElementById('stat-hd');
  if(chEl)chEl.textContent=CHANNELS.length;
  if(hdEl)hdEl.textContent=CHANNELS.filter(function(ch){return ch.q==='1080p'||ch.q==='4K';}).length;
}

// ===== MISTRAL AI =====
function getChannelContext(){
  var cats={};
  for(var i=0;i<CHANNELS.length;i++){var ch=CHANNELS[i];if(!cats[ch.c])cats[ch.c]=[];cats[ch.c].push(ch.n);}
  var ctx='';
  for(var k in cats){ctx+=k+': '+cats[k].join(', ')+'. ';}
  return ctx;
}

function askMistral(question,channelContext){
  var msgEl=document.getElementById('mistral-msg');
  if(!msgEl)return;
  msgEl.textContent='Thinking...';
  var sysPrompt='You are EDGE IPTV assistant. We have '+CHANNELS.length+' free live HD TV channels. '+getChannelContext()+(channelContext?' User is currently watching: '+channelContext+'. ':'')+'Help users find channels. Be brief and specific. Recommend channels by name.';
  fetch('/api/ai',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({messages:[{role:'system',content:sysPrompt},{role:'user',content:question}],max_tokens:200})
  }).then(function(r){return r.json();}).then(function(data){
    if(data.choices&&data.choices[0])msgEl.textContent=data.choices[0].message.content;
    else if(data.error)msgEl.textContent=typeof data.error==='string'?data.error:JSON.stringify(data.error);
    else msgEl.textContent='No response from AI.';
  }).catch(function(){
    var q=question.toLowerCase();
    var matches=CHANNELS.filter(function(ch){
      return ch.n.toLowerCase().indexOf(q)>=0||ch.c.indexOf(q)>=0||ch.d.toLowerCase().indexOf(q)>=0;
    }).slice(0,5);
    if(matches.length){
      var resp='Try these channels: ';
      for(var i=0;i<matches.length;i++){
        resp+=matches[i].n+' ('+catLabel(matches[i].c)+', '+matches[i].q+')';
        if(i<matches.length-1)resp+=', ';
      }
      msgEl.textContent=resp;
    }else{
      msgEl.textContent='No matching channels found. Try searching for a topic like "news", "sports", or "music".';
    }
  });
}

// ===== INIT APP =====
function initApp(){
  try{
    renderCats();
    renderSkeletons();
    setTimeout(function(){renderGrid();setupLazyLoad();},150);
    renderHero();
    startHero();
    renderSidebar();
    renderUpcoming();
    bindAll();
    updateStats();
  }catch(e){
    console.error('initApp error:',e);
  }
  killSplash();
}

// ===== BIND ALL EVENTS =====
function bindAll(){
  // Category filter
  var catEl=document.getElementById('cat-filter');
  if(catEl)catEl.addEventListener('click',function(e){
    var btn=e.target.closest('button');
    if(!btn)return;
    curFilter=btn.getAttribute('data-cat');
    playClick();
    renderCats();renderGrid();setupLazyLoad();
  });

  // Channel card click
  var gridEl=document.getElementById('channels-grid');
  if(gridEl)gridEl.addEventListener('click',function(e){
    var card=e.target.closest('.ch-card');
    if(!card)return;
    var id=parseInt(card.getAttribute('data-id'));
    var ch=CHANNELS.find(function(c){return c.id===id;});
    if(ch){playClick();openPlayer(ch);}
  });

  // Hero controls
  var heroNext=document.getElementById('hero-next');
  var heroPrev=document.getElementById('hero-prev');
  var heroDots=document.getElementById('hero-dots');
  var heroSlides=document.getElementById('hero-slides');
  if(heroNext)heroNext.addEventListener('click',function(){goHero(heroIdx+1);});
  if(heroPrev)heroPrev.addEventListener('click',function(){goHero(heroIdx-1<0?4:heroIdx-1);});
  if(heroDots)heroDots.addEventListener('click',function(e){
    var dot=e.target.closest('span');if(!dot)return;
    goHero(parseInt(dot.getAttribute('data-idx')));
  });
  if(heroSlides)heroSlides.addEventListener('click',function(e){
    var btn=e.target.closest('.btn-watch');if(!btn)return;
    var id=parseInt(btn.getAttribute('data-id'));
    var ch=CHANNELS.find(function(c){return c.id===id;});
    if(ch)openPlayer(ch);
  });

  // Player controls
  var playerClose=document.getElementById('player-close');
  var playerModal=document.getElementById('player-modal');
  if(playerClose)playerClose.addEventListener('click',closePlayer);
  if(playerModal)playerModal.addEventListener('click',function(e){if(e.target===this)closePlayer();});

  var playPause=document.getElementById('play-pause');
  if(playPause)playPause.addEventListener('click',function(){
    var v=document.getElementById('hls-video');
    var icon=this.querySelector('i');
    if(!v)return;
    if(v.paused){v.play().catch(function(){});icon.className='fas fa-pause';}
    else{v.pause();icon.className='fas fa-play';}
  });

  var volBtn=document.getElementById('vol-btn');
  var volSlider=document.getElementById('vol-slider');
  if(volBtn)volBtn.addEventListener('click',function(){
    var v=document.getElementById('hls-video');
    var icon=volBtn.querySelector('i');
    if(!v)return;
    if(v.muted){v.muted=false;volSlider.value=v.volume*100;icon.className='fas fa-volume-up';}
    else{v.muted=true;volSlider.value=0;icon.className='fas fa-volume-mute';}
  });
  if(volSlider)volSlider.addEventListener('input',function(){
    var v=document.getElementById('hls-video');
    if(!v)return;
    var val=parseInt(this.value);
    v.volume=val/100;v.muted=val===0;
    var icon=volBtn?volBtn.querySelector('i'):null;
    if(icon){
      if(val===0)icon.className='fas fa-volume-mute';
      else if(val<50)icon.className='fas fa-volume-down';
      else icon.className='fas fa-volume-up';
    }
  });

  var fullscreenBtn=document.getElementById('fullscreen-btn');
  if(fullscreenBtn)fullscreenBtn.addEventListener('click',function(){
    var wrap=document.querySelector('.player-wrap');
    if(!wrap)return;
    if(document.fullscreenElement)document.exitFullscreen();
    else wrap.requestFullscreen().catch(function(){});
  });

  var audioBtn=document.getElementById('audio-btn');
  if(audioBtn)audioBtn.addEventListener('click',function(){showToast('Audio selection coming soon');});

  var btnRetry=document.getElementById('btn-retry');
  var btnSwitch=document.getElementById('btn-switch');
  if(btnRetry)btnRetry.addEventListener('click',function(){
    if(!curCh)return;retryCount=0;hideOffline();showSpinnerEl();setStatus('connecting');startStream(curCh.s);
  });
  if(btnSwitch)btnSwitch.addEventListener('click',function(){tryNextInCategory();});

  // Search
  var searchToggle=document.getElementById('search-toggle');
  var searchBox=document.getElementById('search-box');
  var searchInput=document.getElementById('search-input');
  if(searchToggle)searchToggle.addEventListener('click',function(){
    if(searchBox){searchBox.classList.toggle('open');
    if(searchBox.classList.contains('open')&&searchInput)searchInput.focus();}
  });
  if(searchInput)searchInput.addEventListener('input',function(){doSearch(this.value);});

  // Sound toggle
  var soundBtn=document.getElementById('sound-toggle');
  if(soundBtn)soundBtn.addEventListener('click',toggleSound);
  if(soundBtn&&soundEnabled)soundBtn.innerHTML='<i class="fas fa-volume-up"></i>';

  // Sidebar toggles
  var toggleIds=['on-air-toggle','trending-toggle','mistral-toggle'];
  for(var t=0;t<toggleIds.length;t++){
    (function(tid){
      var el=document.getElementById(tid);
      if(el)el.addEventListener('click',function(){
        this.classList.toggle('collapsed');
        var body=this.nextElementSibling;
        if(body)body.classList.toggle('collapsed');
      });
    })(toggleIds[t]);
  }

  // Sidebar channel clicks
  var onAirBody=document.getElementById('on-air-body');
  if(onAirBody)onAirBody.addEventListener('click',function(e){
    var item=e.target.closest('.on-air-ch');if(!item)return;
    var id=parseInt(item.getAttribute('data-id'));
    var ch=CHANNELS.find(function(c){return c.id===id;});
    if(ch)openPlayer(ch);
  });
  var trendingBody=document.getElementById('trending-body');
  if(trendingBody)trendingBody.addEventListener('click',function(e){
    var item=e.target.closest('.trending-item');if(!item)return;
    var id=parseInt(item.getAttribute('data-id'));
    var ch=CHANNELS.find(function(c){return c.id===id;});
    if(ch)openPlayer(ch);
  });

  // Upcoming clicks
  var upcomingScroll=document.getElementById('upcoming-scroll');
  if(upcomingScroll)upcomingScroll.addEventListener('click',function(e){
    var card=e.target.closest('.upcoming-card');if(!card)return;
    var id=parseInt(card.getAttribute('data-id'));
    var ch=CHANNELS.find(function(c){return c.id===id;});
    if(ch)openPlayer(ch);
  });

  // Nav links
  var navLinks=document.querySelectorAll('header nav a');
  for(var n=0;n<navLinks.length;n++){
    navLinks[n].addEventListener('click',function(e){
      e.preventDefault();
      for(var j=0;j<navLinks.length;j++)navLinks[j].classList.remove('active');
      this.classList.add('active');
      var nav=this.getAttribute('data-nav');
      if(nav==='sports')curFilter='sports';
      else if(nav==='news')curFilter='news';
      else curFilter='all';
      renderCats();renderGrid();setupLazyLoad();
      var chSec=document.getElementById('channels-section');
      if(chSec)window.scrollTo({top:chSec.offsetTop-80,behavior:'smooth'});
    });
  }

  // Mistral send
  var mistralSend=document.getElementById('mistral-send');
  var mistralInput=document.getElementById('mistral-input');
  if(mistralSend)mistralSend.addEventListener('click',function(){
    if(mistralInput&&mistralInput.value.trim())askMistral(mistralInput.value.trim(),curCh?curCh.n+' ('+catLabel(curCh.c)+')':'');
    if(mistralInput)mistralInput.value='';
  });
  if(mistralInput)mistralInput.addEventListener('keydown',function(e){
    if(e.key==='Enter'){
      if(this.value.trim())askMistral(this.value.trim(),curCh?curCh.n+' ('+catLabel(curCh.c)+')':'');
      this.value='';
    }
  });

  // ESC to close player
  document.addEventListener('keydown',function(e){if(e.key==='Escape')closePlayer();});
}

// ===== BOOT =====
try{initApp();}catch(e){console.error('BOOT error:',e);killSplash();}

})();
<\/script>
</body>
</html>`;

    return new Response(html, {
      headers: { 'Content-Type': 'text/html;charset=UTF-8' }
    });
  }
};
