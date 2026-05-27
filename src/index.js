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
<title>EDGE - IPTV HD Gratis</title>
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

#splash{position:fixed;inset:0;z-index:10000;background:var(--bg);display:flex;flex-direction:column;align-items:center;justify-content:center;transition:opacity 0.6s ease,visibility 0.6s ease}
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

.hero{position:relative;width:100%;height:420px;overflow:hidden;background:linear-gradient(135deg,var(--surface) 0%,#1a1a1a 50%,var(--surface) 100%)}
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

.cat-filter{display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap}
.cat-filter button{background:rgba(255,255,255,0.05);color:var(--gray);padding:7px 18px;border-radius:var(--radius-chip);font-size:12px;font-weight:500;transition:all var(--transition);border:1px solid rgba(255,255,255,0.08);backdrop-filter:blur(8px);display:flex;align-items:center;gap:5px}
.cat-filter button:hover{border-color:rgba(255,255,255,0.2);color:var(--white)}
.cat-filter button.active{background:var(--white);color:#0b0b0b;border-color:var(--white);font-weight:600}

.channels-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px}
.ch-card{background:var(--surface);border-radius:var(--radius-card);overflow:hidden;border:1px solid rgba(255,255,255,0.04);transition:transform 240ms ease,box-shadow 240ms ease;position:relative;cursor:pointer;opacity:0;transform:translateY(10px)}
.ch-card.visible{opacity:1;transform:translateY(0);transition:opacity 300ms ease,transform 300ms ease}
.ch-card:hover{transform:translateY(-4px) scale(1.03);border-color:rgba(255,255,255,0.1);box-shadow:var(--shadow-hover)}
.ch-card .ch-thumb{width:100%;height:160px;position:relative;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center}
.ch-card .ch-thumb-img{position:absolute;inset:0;background-size:cover;background-position:center;filter:brightness(0.35) saturate(1.4);transition:filter 400ms ease,transform 400ms ease}
.ch-card:hover .ch-thumb-img{filter:brightness(0.5) saturate(1.6);transform:scale(1.08)}
.ch-card .ch-thumb-overlay{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0.15) 0%,rgba(0,0,0,0.85) 100%);z-index:1}
.ch-card .ch-thumb-icon{position:relative;z-index:2;font-size:32px;color:rgba(255,255,255,0.12);margin-bottom:4px}
.ch-card .ch-thumb-label{font-family:var(--font-display);font-size:11px;color:rgba(255,255,255,0.95);letter-spacing:3px;text-align:center;padding:10px;word-break:break-word;position:relative;z-index:2;text-shadow:0 2px 12px rgba(0,0,0,0.8);font-weight:700}
.ch-card .ch-logo{position:relative;z-index:2;height:60px;width:auto;max-width:140px;object-fit:contain;filter:drop-shadow(0 2px 8px rgba(0,0,0,0.6))}
.ch-card .ch-logo-fb{position:relative;z-index:2;width:56px;height:56px;border-radius:14px;color:#fff;font-size:22px;font-weight:900;display:none;align-items:center;justify-content:center;font-family:var(--font-display);letter-spacing:1px;filter:drop-shadow(0 2px 8px rgba(0,0,0,0.6))}
.ch-card .ch-thumb-src{font-family:var(--font-body);font-size:9px;color:rgba(255,255,255,0.5);letter-spacing:1px;text-align:center;position:relative;z-index:2;margin-top:-4px;text-transform:uppercase}
.ch-card .live-badge{position:absolute;top:10px;left:10px;background:var(--red);color:#fff;font-size:9px;font-weight:700;padding:2px 8px;border-radius:4px;letter-spacing:1px;animation:livePulse 2s infinite;display:flex;align-items:center;gap:4px;z-index:3}
.ch-card .live-badge::before{content:'';width:5px;height:5px;border-radius:50%;background:#fff;animation:dotPulse 1s infinite}
.ch-card .ch-quality{position:absolute;top:10px;right:10px;background:rgba(0,0,0,0.7);color:var(--white);font-size:9px;font-weight:600;padding:2px 8px;border-radius:3px;z-index:3;border:1px solid rgba(255,255,255,0.15)}
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

.skeleton-card{background:var(--surface);border-radius:var(--radius-card);overflow:hidden;border:1px solid rgba(255,255,255,0.04)}
.skeleton-thumb{width:100%;height:160px;background:linear-gradient(90deg,var(--elevated) 25%,#252525 50%,var(--elevated) 75%);background-size:200% 100%;animation:shimmer 1.5s infinite}
.skeleton-body{padding:12px 14px}
.skeleton-line{height:12px;background:linear-gradient(90deg,var(--elevated) 25%,#252525 50%,var(--elevated) 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;border-radius:4px;margin-bottom:8px}
.skeleton-line.short{width:60%}
@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}

.main-layout{display:flex;gap:24px;max-width:1440px;margin:0 auto;padding:28px 24px}
.main-content{flex:1;min-width:0}
.sidebar{width:300px;flex-shrink:0}
.section-title{font-family:var(--font-display);font-size:16px;font-weight:700;margin-bottom:18px;display:flex;align-items:center;gap:10px;color:var(--white)}
.section-title .st-bar{width:3px;height:18px;background:linear-gradient(180deg,var(--red),rgba(232,17,45,0.3));border-radius:2px}
.section-title .st-count{font-size:11px;color:var(--muted);font-weight:400;margin-left:auto;font-family:var(--font-body)}

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
.on-air-ch .oa-logo{height:20px;width:auto;max-width:60px;object-fit:contain;flex-shrink:0}
.on-air-ch .oa-logo-fb{height:20px;width:20px;border-radius:4px;color:#fff;font-size:9px;font-weight:900;display:none;align-items:center;justify-content:center;font-family:var(--font-display);flex-shrink:0}
.trending-item .tr-logo{height:20px;width:auto;max-width:60px;object-fit:contain;flex-shrink:0}
.trending-item .tr-logo-fb{width:20px;height:20px;border-radius:4px;color:#fff;font-size:9px;font-weight:900;display:none;align-items:center;justify-content:center;font-family:var(--font-display);flex-shrink:0}
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
.offline-overlay .btn-retry{background:var(--red);color:#fff;padding:10px 24px;border-radius:var(--radius-card);font-weight:600;font-size:13px}
.offline-overlay .btn-switch{background:var(--elevated);color:var(--gray);padding:8px 20px;border-radius:var(--radius-card);font-size:12px;border:1px solid rgba(255,255,255,0.1)}
.player-bar{display:flex;align-items:center;gap:12px;padding:10px 16px;background:var(--surface);border-top:1px solid rgba(255,255,255,0.06)}
.player-bar button{color:var(--muted);font-size:16px;transition:color var(--transition);padding:4px}
.player-bar button:hover{color:var(--white)}
.p-title{flex:1;font-size:13px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.p-status{font-size:10px;padding:2px 8px;border-radius:4px;font-weight:600;letter-spacing:1px}
.p-status.live{background:var(--red);color:#fff;animation:livePulse 2s infinite}
.p-status.connecting{background:rgba(255,193,7,0.2);color:#ffc107}
.p-status.offline{background:var(--elevated);color:var(--muted)}
.p-quality{font-size:10px;padding:2px 8px;border-radius:4px;background:rgba(255,255,255,0.08);color:var(--white);font-weight:600;display:none}
.vol-slider{-webkit-appearance:none;appearance:none;width:80px;height:4px;background:var(--muted);border-radius:2px;outline:none;cursor:pointer}
.vol-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:12px;height:12px;border-radius:50%;background:var(--white);cursor:pointer}
.vol-slider::-moz-range-thumb{width:12px;height:12px;border-radius:50%;background:var(--white);cursor:pointer;border:none}

.upcoming-scroll{display:flex;gap:14px;overflow-x:auto;padding-bottom:10px;scroll-snap-type:x mandatory}
.upcoming-card{min-width:200px;background:var(--surface);border-radius:var(--radius-card);padding:14px;border:1px solid rgba(255,255,255,0.04);scroll-snap-align:start;flex-shrink:0;cursor:pointer;transition:all var(--transition)}
.upcoming-card:hover{border-color:rgba(255,255,255,0.1);transform:translateY(-2px)}
.upcoming-card .uc-cat{font-size:9px;color:var(--red);font-weight:600;letter-spacing:2px;margin-bottom:6px;text-transform:uppercase}
.upcoming-card .uc-name{font-size:13px;font-weight:500;margin-bottom:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.upcoming-card .uc-time{font-family:var(--font-display);font-size:13px;color:var(--white);letter-spacing:1px}

footer{background:var(--surface);border-top:1px solid rgba(255,255,255,0.04);padding:28px 24px;text-align:center;margin-top:48px}
footer .f-brand{font-family:var(--font-display);font-size:11px;letter-spacing:4px;color:var(--muted)}
footer .f-brand span{color:var(--red)}
footer .f-stats{display:flex;justify-content:center;gap:28px;margin-top:12px}
footer .f-stats .stat{font-size:11px;color:var(--muted)}
footer .f-stats .stat strong{color:var(--white);font-family:var(--font-display)}

.toast{position:fixed;bottom:24px;right:24px;background:var(--elevated);color:var(--white);padding:12px 20px;border-radius:var(--radius-card);font-size:13px;z-index:9999;transform:translateY(80px);opacity:0;transition:all var(--transition);border-left:3px solid var(--red);max-width:320px;box-shadow:var(--shadow)}
.toast.show{transform:translateY(0);opacity:1}

@media(max-width:1024px){
  .main-layout{flex-direction:column}.sidebar{width:100%}
  .channels-grid{grid-template-columns:repeat(auto-fill,minmax(200px,1fr))}
  .hero{height:360px}.slide-title{font-size:28px}
}
@media(max-width:640px){
  .channels-grid{grid-template-columns:1fr 1fr}
  header nav a span{display:none}header{padding:0 16px}
  .hero{height:280px}.slide-title{font-size:22px}.slide-desc{display:none}
  .vol-slider{width:50px}
}
</style>
</head>
<body>
<div id="splash"><div class="splash-wrap"><div class="splash-logo-area"><div class="splash-logo">E<span>D</span>GE</div><div class="scanline"></div></div><div class="splash-sub">IPTV HD GRATIS</div><div class="load-seq"><span class="phase p1">INITIALIZING...</span><span class="phase p2">LOADING STREAMS...</span><span class="phase p3">READY</span></div><div class="load-bar-track"><div class="load-bar-fill"></div></div></div></div>
<header><div class="logo-mark">E<span>D</span>GE</div><nav><a href="#" class="active" data-nav="home"><i class="fas fa-home"></i><span>Home</span></a><a href="#" data-nav="live"><i class="fas fa-tv"></i><span>Live</span></a><a href="#" data-nav="sports"><i class="fas fa-futbol"></i><span>Sports</span></a><a href="#" data-nav="news"><i class="fas fa-newspaper"></i><span>News</span></a></nav><div class="hdr-right"><button id="sound-toggle" title="Toggle Sound"><i class="fas fa-volume-mute"></i></button><button id="search-toggle" title="Search"><i class="fas fa-search"></i></button></div></header>
<div id="search-box"><input type="text" id="search-input" placeholder="Buscar canales..."></div>
<section class="hero" id="hero-section"><div id="hero-slides"></div><div class="hero-arrows"><button id="hero-prev"><i class="fas fa-chevron-left"></i></button><button id="hero-next"><i class="fas fa-chevron-right"></i></button><div class="hero-dots" id="hero-dots"></div></section>
<div class="main-layout"><main class="main-content"><section id="channels-section"><h2 class="section-title"><span class="st-bar"></span>Canales en Vivo<span class="st-count" id="ch-count"></span></h2><div class="cat-filter" id="cat-filter"></div><div class="channels-grid" id="channels-grid"></div></section><section id="upcoming-section" style="margin-top:40px"><h2 class="section-title"><span class="st-bar"></span>Coming Up</h2><div class="upcoming-scroll" id="upcoming-scroll"></div></section></main><aside class="sidebar"><div class="sidebar-section"><div class="sidebar-toggle" id="on-air-toggle"><h3><i class="fas fa-broadcast-tower"></i>En Vivo Ahora</h3><i class="fas fa-chevron-down chevron"></i></div><div class="sidebar-body" id="on-air-body"></div></div><div class="sidebar-section"><div class="sidebar-toggle" id="trending-toggle"><h3><i class="fas fa-fire"></i>Tendencias</h3><i class="fas fa-chevron-down chevron"></i></div><div class="sidebar-body" id="trending-body"></div></div><div class="sidebar-section"><div class="sidebar-toggle" id="mistral-toggle"><h3><i class="fas fa-robot"></i>Asistente IA</h3><i class="fas fa-chevron-down chevron"></i></div><div class="sidebar-body" id="mistral-body"><div class="mp-chat"><div class="mp-msg" id="mistral-msg">Preguntame sobre canales!</div><div class="mp-input-wrap"><input class="mp-input" id="mistral-input" placeholder="Pregunta sobre canales..."><button class="mp-send" id="mistral-send"><i class="fas fa-paper-plane"></i></button></div></div></div></div></aside></div>
<div id="player-modal"><div class="player-wrap"><button class="player-close" id="player-close"><i class="fas fa-times"></i></button><video id="hls-video" muted playsinline></video><div class="player-spinner" id="player-spinner"><div class="spinner-ring"></div></div><div class="buffering-overlay" id="buffering-overlay"><div class="buffer-pulse"></div></div><div class="offline-overlay" id="offline-overlay"><i class="fas fa-signal off-icon"></i><div class="off-text">CANAL OFFLINE</div><div class="off-hint">Este canal puede estar bloqueado. Prueba otro o usa VPN.</div><button class="btn-retry" id="btn-retry"><i class="fas fa-redo"></i> Reintentar</button><button class="btn-switch" id="btn-switch"><i class="fas fa-exchange-alt"></i> Siguiente Canal</button></div><div class="player-bar"><button id="play-pause"><i class="fas fa-play"></i></button><button id="vol-btn"><i class="fas fa-volume-mute"></i></button><input type="range" id="vol-slider" min="0" max="100" value="0" class="vol-slider"><span class="p-title" id="player-title">-</span><span class="p-quality" id="quality-indicator">HD</span><span class="p-status connecting" id="player-status">CONNECTING</span><button id="audio-btn"><i class="fas fa-headphones"></i></button><button id="fullscreen-btn"><i class="fas fa-expand"></i></button></div></div></div>
<div class="toast" id="toast"></div>
<footer><div class="f-brand">EDGE <span>v5.0</span> &mdash; IPTV 100% Gratis</div><div class="f-stats"><div class="stat"><strong id="stat-ch">121</strong> canales</div><div class="stat"><strong id="stat-hd">75</strong> HD</div><div class="stat"><strong>9</strong> categorias</div></div></footer>
<script>
(function(){function k(){var s=document.getElementById('splash');if(s)s.classList.add('hide');}setTimeout(k,2500);setTimeout(k,3500);setTimeout(k,5000);document.addEventListener('DOMContentLoaded',function(){setTimeout(k,800);});window.addEventListener('load',function(){setTimeout(k,300);});window.onerror=function(){k();return true;};})();
<\/script>
<script src="https://cdn.jsdelivr.net/npm/hls.js@1.5.7"><\/script>
<script>
(function(){
'use strict';
var CHANNELS=[
{id:1,n:"8NTV",s:"https://60417ddeaf0d9.streamlock.net/ntv/videontv/playlist.m3u8",c:"general",q:"1080p",src:"General",v:3680,d:"8NTV - En vivo 24/7",clr:"#00695C",logo:""},
{id:2,n:"13 Festival",s:"https://origin.dpsgo.com/ssai/event/Nftd0fM2SXasfDlRphvUsg/master.m3u8",c:"music",q:"1080p",src:"Music",v:3670,d:"13 Festival - En vivo 24/7",clr:"#AD1457",logo:""},
{id:3,n:"13 Kids",s:"https://origin.dpsgo.com/ssai/event/LhHrVtyeQkKZ-Ye_xEU75g/master.m3u8",c:"kids",q:"1080p",src:"Kids",v:3660,d:"13 Kids - En vivo 24/7",clr:"#F57C00",logo:""},
{id:4,n:"13 Realities",s:"https://origin.dpsgo.com/ssai/event/g7_JOM0ORki9SR5RKHe-Kw/master.m3u8",c:"entertainment",q:"1080p",src:"Entertainment",v:3650,d:"13 Realities - En vivo 24/7",clr:"#E65100",logo:""},
{id:5,n:"Aguacate TV",s:"https://streamtv.intervenhosting.net:3040/hybrid/play.m3u8",c:"entertainment",q:"1080p",src:"Entertainment",v:3640,d:"Aguacate TV - En vivo 24/7",clr:"#E65100",logo:""},
{id:6,n:"Aire de Santa Fe",s:"https://unlimited1-us.dps.live/airedesantafetv/airedesantafetv.smil/playlist.m3u8",c:"general",q:"1080p",src:"General",v:3630,d:"Aire de Santa Fe - En vivo 24/7",clr:"#00695C",logo:""},
{id:7,n:"América Estéreo Quito",s:"https://video.makrodigital.com/americaestereoquito/americaestereoquito/playlist.m3u8",c:"general",q:"1080p",src:"General",v:3620,d:"América Estéreo Quito - En vivo 24/7",clr:"#00695C",logo:""},
{id:8,n:"América TeVé",s:"https://live.gideo.video/americateve2/master.m3u8",c:"entertainment",q:"1080p",src:"Entertainment",v:3610,d:"América TeVé - En vivo 24/7",clr:"#E65100",logo:""},
{id:9,n:"Antofagasta TV (ATV)",s:"https://unlimited6-cl.dps.live/atv/atv.smil/playlist.m3u8",c:"general",q:"1080p",src:"General",v:3600,d:"Antofagasta TV (ATV) - En vivo 24/7",clr:"#00695C",logo:""},
{id:10,n:"Arabí TV",s:"https://streamtv2.elitecomunicacion.cloud:3628/live/arabitv2025live.m3u8",c:"general",q:"1080p",src:"General",v:3590,d:"Arabí TV - En vivo 24/7",clr:"#00695C",logo:""},
{id:11,n:"AS3 Sport TV",s:"https://streamtv.as3sport.online:3394/hybrid/play.m3u8",c:"sports",q:"1080p",src:"Sports",v:3580,d:"AS3 Sport TV - En vivo 24/7",clr:"#2E7D32",logo:""},
{id:12,n:"Austral TV",s:"https://stmv3.voxtvhd.com.br/australtv/australtv/playlist.m3u8",c:"general",q:"1080p",src:"General",v:3570,d:"Austral TV - En vivo 24/7",clr:"#00695C",logo:""},
{id:13,n:"Azteca Internacional",s:"https://azt-mun.otteravision.com/azt/mun/mun.m3u8",c:"entertainment",q:"1080p",src:"Entertainment",v:3560,d:"Azteca Internacional - En vivo 24/7",clr:"#E65100",logo:""},
{id:14,n:"BabyTV Spain",s:"https://xykt-fix.github.io/iptv/streams/SP88/index.m3u8",c:"kids",q:"1080p",src:"Kids",v:3550,d:"BabyTV Spain - En vivo 24/7",clr:"#F57C00",logo:""},
{id:15,n:"Bebeto TV",s:"https://mlb.essastream.com:8081/bebetotelevision/index.m3u8",c:"general",q:"1080p",src:"General",v:3540,d:"Bebeto TV - En vivo 24/7",clr:"#00695C",logo:""},
{id:16,n:"beIN Sports XTRA en Espanol",s:"https://dc1644a9jazgj.cloudfront.net/beIN_Sports_Xtra_Espanol.m3u8",c:"sports",q:"1080p",src:"Sports",v:3530,d:"beIN Sports XTRA en Espanol - En vivo 24/7",clr:"#2E7D32",logo:""},
{id:17,n:"BHTV",s:"https://sc1.wasidata.com/Bhtv/index.fmp4.m3u8",c:"general",q:"1080p",src:"General",v:3520,d:"BHTV - En vivo 24/7",clr:"#00695C",logo:""},
{id:18,n:"Buena TV",s:"https://59825a54e4454.streamlock.net:8443/papo351/papo351/playlist.m3u8",c:"entertainment",q:"1080p",src:"Entertainment",v:3510,d:"Buena TV - En vivo 24/7",clr:"#E65100",logo:""},
{id:19,n:"C9N",s:"https://alba-py-c9n-c9n.stream.mediatiquestream.com/index.m3u8",c:"news",q:"1080p",src:"News",v:3500,d:"C9N - En vivo 24/7",clr:"#1565C0",logo:""},
{id:20,n:"Canal 2 de Ushuaia",s:"https://nd106.republicaservers.com:4433/hls/c6611/index.m3u8",c:"general",q:"1080p",src:"General",v:3490,d:"Canal 2 de Ushuaia - En vivo 24/7",clr:"#00695C",logo:""},
{id:21,n:"Canal 4 RD",s:"https://protvradiostream.com:1936/canal4rd-1/ngrp:canal4rd-1_all/playlist.m3u8",c:"general",q:"1080p",src:"General",v:3480,d:"Canal 4 RD - En vivo 24/7",clr:"#00695C",logo:""},
{id:22,n:"Canal 5 TV Cozumel",s:"https://video0.rogohosting.com:19360/tvcozumel/tvcozumel.m3u8",c:"general",q:"1080p",src:"General",v:3470,d:"Canal 5 TV Cozumel - En vivo 24/7",clr:"#00695C",logo:""},
{id:23,n:"Canal 7 Neuquén",s:"https://stream.arcast.com.ar/c7nq/ngrp:c7nq_all/playlist.m3u8",c:"general",q:"1080p",src:"General",v:3460,d:"Canal 7 Neuquén - En vivo 24/7",clr:"#00695C",logo:""},
{id:24,n:"Canal 26",s:"https://stream-gtlc.telecentro.net.ar/hls/canal26hls/main.m3u8",c:"news",q:"1080p",src:"News",v:3450,d:"Canal 26 - En vivo 24/7",clr:"#1565C0",logo:""},
{id:25,n:"Canal Extremadura Satelite",s:"https://canalextremadura-live.flumotion.cloud/canalextremadura/live_all/playlist.m3u8",c:"general",q:"1080p",src:"General",v:3440,d:"Canal Extremadura Satelite - En vivo 24/7",clr:"#00695C",logo:""},
{id:26,n:"Canal Sur Andalucia",s:"https://dfk2a268yviz9.cloudfront.net/v1/master/3722c60a815c199d9c0ef36c5b73da68a62b09d1/cc-ddiii1m6jt6of/CanalSurAndaluciaES.m3u8",c:"general",q:"1080p",src:"General",v:3430,d:"Canal Sur Andalucia - En vivo 24/7",clr:"#00695C",logo:""},
{id:27,n:"Canela.TV",s:"https://d3cx6yargdnl7q.cloudfront.net/canelatv.m3u8",c:"entertainment",q:"1080p",src:"Entertainment",v:3420,d:"Canela.TV - En vivo 24/7",clr:"#E65100",logo:""},
{id:28,n:"Cáritas TV",s:"https://rds3.desdeparaguay.net/caritastv/caritastv/playlist.m3u8",c:"general",q:"1080p",src:"General",v:3410,d:"Cáritas TV - En vivo 24/7",clr:"#00695C",logo:""},
{id:29,n:"CGTN Español",s:"https://espanol-livews.cgtn.com/hls/LSveOGBaBw41Ea7ukkVAUdKQ220802LSTexu6xAuFH8VZNBLE1ZNEa220802cd/playlist.m3u8",c:"news",q:"1080p",src:"News",v:3400,d:"CGTN Español - En vivo 24/7",clr:"#1565C0",logo:""},
{id:30,n:"CHTV",s:"https://viewhn.com/chtv/live/playlist.m3u8",c:"general",q:"1080p",src:"General",v:3390,d:"CHTV - En vivo 24/7",clr:"#00695C",logo:""},
{id:31,n:"CINDIE TV",s:"https://d20xuwbyc4yoag.cloudfront.net/v1/master/9d062541f2ff39b5c0f48b743c6411d25f62fc25/DistroTV-MuxIP-CINDIE/387.m3u8?ads.vf=grWTpG3NQNi",c:"movies",q:"1080p",src:"Movies",v:3380,d:"CINDIE TV - En vivo 24/7",clr:"#6A1B9A",logo:""},
{id:32,n:"CMM TV HD",s:"https://cdnapisec.kaltura.com/p/2288691/sp/228869100/playManifest/entryId/1_gnz6ity9/protocol/https/format/applehttp/flavorIds/1_a9gxgxzy,1_v71ryg4b,1_vbfvtjw6,1_obo1bqsx,1_3shk3s5d/a.m3u8",c:"general",q:"1080p",src:"General",v:3370,d:"CMM TV HD - En vivo 24/7",clr:"#00695C",logo:""},
{id:33,n:"Cotubanama TV",s:"https://host.streamingnation.live/p/3588/hybrid/play.m3u8",c:"general",q:"1080p",src:"General",v:3360,d:"Cotubanama TV - En vivo 24/7",clr:"#00695C",logo:""},
{id:34,n:"CreaLaTV",s:"https://stream8.mexiserver.com:2000/hls/crealatv/crealatv.m3u8",c:"general",q:"1080p",src:"General",v:3350,d:"CreaLaTV - En vivo 24/7",clr:"#00695C",logo:""},
{id:35,n:"Diez TV Las Villas",s:"https://streaming.cloud.innovasur.es/mmj2/index.m3u8",c:"general",q:"1080p",src:"General",v:3340,d:"Diez TV Las Villas - En vivo 24/7",clr:"#00695C",logo:""},
{id:36,n:"Diez TV Úbeda",s:"https://streaming.cloud.innovasur.es/mmj/index.m3u8",c:"general",q:"1080p",src:"General",v:3330,d:"Diez TV Úbeda - En vivo 24/7",clr:"#00695C",logo:""},
{id:37,n:"Distrito TV",s:"https://nlb2-live.emitstream.com/hls/3mn7wpcv7hbmxmdzaxap/master.m3u8",c:"general",q:"1080p",src:"General",v:3320,d:"Distrito TV - En vivo 24/7",clr:"#00695C",logo:""},
{id:38,n:"DW Espanol",s:"https://dwamdstream104.akamaized.net/hls/live/2015530/dwstream104/master.m3u8",c:"news",q:"1080p",src:"News",v:3310,d:"DW Espanol - En vivo 24/7",clr:"#1565C0",logo:""},
{id:39,n:"El Sol Network TV",s:"https://tv.wracanal10.com:3025/live/elsoltvlive.m3u8",c:"music",q:"1080p",src:"Music",v:3300,d:"El Sol Network TV - En vivo 24/7",clr:"#AD1457",logo:""},
{id:40,n:"EnerGeek Radio",s:"https://backend.energeek.cl/webtv/egradioweb/index.m3u8?token=ZZDemoIPTVGH",c:"music",q:"1080p",src:"Music",v:3290,d:"EnerGeek Radio - En vivo 24/7",clr:"#AD1457",logo:""},
{id:41,n:"Estrella Games",s:"https://estrella-games-oando.amagi.tv/playlist.m3u8",c:"entertainment",q:"1080p",src:"Entertainment",v:3280,d:"Estrella Games - En vivo 24/7",clr:"#E65100",logo:""},
{id:42,n:"Estrella News",s:"https://estrella-news-oando.amagi.tv/playlist.m3u8",c:"news",q:"1080p",src:"News",v:3270,d:"Estrella News - En vivo 24/7",clr:"#1565C0",logo:""},
{id:43,n:"Estrella TV",s:"https://estrellatv-oando.amagi.tv/playlist.m3u8",c:"entertainment",q:"1080p",src:"Entertainment",v:3260,d:"Estrella TV - En vivo 24/7",clr:"#E65100",logo:""},
{id:44,n:"ETB Events 1",s:"https://cdn1.etbon.eus/oc1/index.m3u8",c:"general",q:"1080p",src:"General",v:3250,d:"ETB Events 1 - En vivo 24/7",clr:"#00695C",logo:""},
{id:45,n:"FM Mundo",s:"https://video2.makrodigital.com/fmmundo/fmmundo/playlist.m3u8",c:"music",q:"1080p",src:"Music",v:3240,d:"FM Mundo - En vivo 24/7",clr:"#AD1457",logo:""},
{id:46,n:"Fuerteventura TV",s:"https://5c0956165db0b.streamlock.net/ftv/directo/.m3u8",c:"general",q:"1080p",src:"General",v:3230,d:"Fuerteventura TV - En vivo 24/7",clr:"#00695C",logo:""},
{id:47,n:"Gex TV",s:"https://live20.bozztv.com/akamaissh101/ssh101/gextvaccess/playlist.m3u8",c:"entertainment",q:"1080p",src:"Entertainment",v:3220,d:"Gex TV - En vivo 24/7",clr:"#E65100",logo:""},
{id:48,n:"Gol Classics",s:"https://d71gqtnep83vb.cloudfront.net/gol_classics/gol_classics.m3u8",c:"sports",q:"1080p",src:"Sports",v:3210,d:"Gol Classics - En vivo 24/7",clr:"#2E7D32",logo:""},
{id:49,n:"Hilando Fino TV",s:"https://hilandofinotv.essastream.com:3606/live/canalhilandofinotvlive.m3u8",c:"general",q:"1080p",src:"General",v:3200,d:"Hilando Fino TV - En vivo 24/7",clr:"#00695C",logo:""},
{id:50,n:"Historia",s:"https://d1k3vzh2ivy22k.cloudfront.net/Historia.m3u8",c:"entertainment",q:"1080p",src:"Entertainment",v:3190,d:"Historia - En vivo 24/7",clr:"#E65100",logo:""},
{id:51,n:"HOLA! Play",s:"https://hola-play-2108fd06-86d4-44e8-9867-c35b4895a1c1-es.fast.rakuten.tv/v1/master/0547f18649bd788bec7b67b746e47670f558b6b2/production-LiveChannel-6433/master.m3u8",c:"entertainment",q:"1080p",src:"Entertainment",v:3180,d:"HOLA! Play - En vivo 24/7",clr:"#E65100",logo:""},
{id:52,n:"Infinita TV",s:"https://s2.tvdatta.com:3753/hybrid/play.m3u8",c:"music",q:"1080p",src:"Music",v:3170,d:"Infinita TV - En vivo 24/7",clr:"#AD1457",logo:""},
{id:53,n:"interTV",s:"https://streamtv.intervenhosting.net:3439/hybrid/play.m3u8",c:"entertainment",q:"1080p",src:"Entertainment",v:3160,d:"interTV - En vivo 24/7",clr:"#E65100",logo:""},
{id:54,n:"La Nueva Radio TV 97.7",s:"https://sv72.ecuaradiotv.net/lanuevatv/live/playlist.m3u8",c:"entertainment",q:"1080p",src:"Entertainment",v:3150,d:"La Nueva Radio TV 97.7 - En vivo 24/7",clr:"#E65100",logo:""},
{id:55,n:"Más Talk",s:"https://vod2live.univtec.com/manifest/89290956-94ab-4950-accb-a54bbd7e176f.m3u8",c:"entertainment",q:"1080p",src:"Entertainment",v:3140,d:"Más Talk - En vivo 24/7",clr:"#E65100",logo:""},
{id:56,n:"Mega Cine TV",s:"https://cnn.hostlagarto.com/megacinetv/playlist.m3u8",c:"movies",q:"1080p",src:"Movies",v:3130,d:"Mega Cine TV - En vivo 24/7",clr:"#6A1B9A",logo:""},
{id:57,n:"Mega TV",s:"https://www.desde-paraguay.com/mega.m3u8",c:"news",q:"1080p",src:"News",v:3120,d:"Mega TV - En vivo 24/7",clr:"#1565C0",logo:""},
{id:58,n:"MyTime movie network Spain",s:"https://appletree-mytimespain-rakuten.amagi.tv/playlist.m3u8",c:"movies",q:"1080p",src:"Movies",v:3110,d:"MyTime movie network Spain - En vivo 24/7",clr:"#6A1B9A",logo:""},
{id:59,n:"NCTV",s:"https://pantera1-100gb-cl-movistar.dps.live/nctv/nctv.smil/playlist.m3u8",c:"news",q:"1080p",src:"News",v:3100,d:"NCTV - En vivo 24/7",clr:"#1565C0",logo:""},
{id:60,n:"Nickelodeon",s:"https://xykt-fix.github.io/iptv/streams/SP57.m3u8",c:"kids",q:"1080p",src:"Kids",v:3090,d:"Nickelodeon - En vivo 24/7",clr:"#F57C00",logo:""},
{id:61,n:"Noticiero 90 Minutos",s:"https://play.cdn.enetres.net/621B146D29C541AFB1507809F038F471021/021/playlist.m3u8",c:"news",q:"1080p",src:"News",v:3080,d:"Noticiero 90 Minutos - En vivo 24/7",clr:"#1565C0",logo:""},
{id:62,n:"Planet 100.9 FM",s:"https://streamlov.alsolnet.com/planet1009fm/live/playlist.m3u8",c:"music",q:"1080p",src:"Music",v:3070,d:"Planet 100.9 FM - En vivo 24/7",clr:"#AD1457",logo:""},
{id:63,n:"Pluto TV Futbol Para Fans",s:"https://jmp2.uk/plu-63c6e37e636b7e0007ccb635.m3u8",c:"sports",q:"1080p",src:"Sports",v:3060,d:"Pluto TV Futbol Para Fans - En vivo 24/7",clr:"#2E7D32",logo:""},
{id:64,n:"Prensa Latina TV",s:"https://eu1.servers10.com:8081/8192/index.m3u8",c:"news",q:"1080p",src:"News",v:3050,d:"Prensa Latina TV - En vivo 24/7",clr:"#1565C0",logo:""},
{id:65,n:"PRIDEtv LATAM",s:"https://backend.energeek.cl/webtv/pridetvweb/index.m3u8?token=ZZDemoIPTVGH",c:"entertainment",q:"1080p",src:"Entertainment",v:3040,d:"PRIDEtv LATAM - En vivo 24/7",clr:"#E65100",logo:""},
{id:66,n:"Rakuten TV Action Movies Spain",s:"https://a9c57ec7ec5e4b7daeacc6316a0bb404.mediatailor.eu-west-1.amazonaws.com/v1/master/0547f18649bd788bec7b67b746e47670f558b6b2/production-LiveChannel-6069/master.m3u8",c:"movies",q:"1080p",src:"Movies",v:3030,d:"Rakuten TV Action Movies Spain - En vivo 24/7",clr:"#6A1B9A",logo:""},
{id:67,n:"Rakuten TV Comedy Movies Spain",s:"https://71db867f03ce4d71a29e92155f07ab87.mediatailor.eu-west-1.amazonaws.com/v1/master/0547f18649bd788bec7b67b746e47670f558b6b2/production-LiveChannel-6180/master.m3u8",c:"movies",q:"1080p",src:"Movies",v:3020,d:"Rakuten TV Comedy Movies Spain - En vivo 24/7",clr:"#6A1B9A",logo:""},
{id:68,n:"Rakuten TV Drama Movies Spain",s:"https://a7089c89d85f453d850c4a1518b43076.mediatailor.eu-west-1.amazonaws.com/v1/master/0547f18649bd788bec7b67b746e47670f558b6b2/production-LiveChannel-6092/master.m3u8",c:"movies",q:"1080p",src:"Movies",v:3010,d:"Rakuten TV Drama Movies Spain - En vivo 24/7",clr:"#6A1B9A",logo:""},
{id:69,n:"Rakuten TV Top Movies Spain",s:"https://ff335120300e4742a2b135ee9a9e7df8.mediatailor.eu-west-1.amazonaws.com/v1/master/0547f18649bd788bec7b67b746e47670f558b6b2/production-LiveChannel-5983/master.m3u8",c:"movies",q:"1080p",src:"Movies",v:3000,d:"Rakuten TV Top Movies Spain - En vivo 24/7",clr:"#6A1B9A",logo:""},
{id:70,n:"Rakuten Viki",s:"https://newidco-rakutenviki-2-eu.xiaomi.wurl.tv/playlist.m3u8",c:"entertainment",q:"1080p",src:"Entertainment",v:2990,d:"Rakuten Viki - En vivo 24/7",clr:"#E65100",logo:""},
{id:71,n:"RCN Más",s:"https://rcntv-rcnmas-1-us.plex.wurl.tv/playlist.m3u8",c:"entertainment",q:"1080p",src:"Entertainment",v:2980,d:"RCN Más - En vivo 24/7",clr:"#E65100",logo:""},
{id:72,n:"RPP TV",s:"https://cdn-ssai.smartbit.co/rpp/index.m3u8",c:"news",q:"1080p",src:"News",v:2970,d:"RPP TV - En vivo 24/7",clr:"#1565C0",logo:""},
{id:73,n:"RQP Paraguay",s:"https://alba-py-rqp-rqp.stream.mediatiquestream.com/index.m3u8",c:"music",q:"1080p",src:"Music",v:2960,d:"RQP Paraguay - En vivo 24/7",clr:"#AD1457",logo:""},
{id:74,n:"RTV Vida",s:"https://vidartv2.todostreaming.es/live/radiovida-emisiontvhd.m3u8",c:"music",q:"1080p",src:"Music",v:2950,d:"RTV Vida - En vivo 24/7",clr:"#AD1457",logo:""},
{id:75,n:"Señal Positiva TV",s:"https://eu1.servers10.com:8081/8108/index.m3u8",c:"entertainment",q:"1080p",src:"Entertainment",v:2940,d:"Señal Positiva TV - En vivo 24/7",clr:"#E65100",logo:""},
{id:76,n:"Stingray Classica",s:"https://lotus.stingray.com/manifest/classica-cla008-montreal/samsungtvplus/master.m3u8",c:"music",q:"1080p",src:"Music",v:2930,d:"Stingray Classica - En vivo 24/7",clr:"#AD1457",logo:""},
{id:77,n:"STZ Telebista",s:"https://cloudvideo.servers10.com:8081/stztelebista/index.m3u8",c:"music",q:"1080p",src:"Music",v:2920,d:"STZ Telebista - En vivo 24/7",clr:"#AD1457",logo:""},
{id:78,n:"Súper Q Panamá",s:"https://vcp8.myplaytv.com:1936/superq/superq/playlist.m3u8",c:"music",q:"1080p",src:"Music",v:2910,d:"Súper Q Panamá - En vivo 24/7",clr:"#AD1457",logo:""},
{id:79,n:"Telerayo",s:"https://s.emisoras.tv:8081/telerayo/index.m3u8",c:"entertainment",q:"1080p",src:"Entertainment",v:2900,d:"Telerayo - En vivo 24/7",clr:"#E65100",logo:""},
{id:80,n:"Telesur HD",s:"https://mblesmain01.telesur.ultrabase.net/mbliveMain/hd/playlist.m3u8",c:"news",q:"1080p",src:"News",v:2890,d:"Telesur HD - En vivo 24/7",clr:"#1565C0",logo:""},
{id:81,n:"Totalmusic",s:"https://cdn.global.elektamedia.com/live/c7eds/Totalmusic/SA_LIVE_hls_enc/master.m3u8",c:"music",q:"1080p",src:"Music",v:2880,d:"Totalmusic - En vivo 24/7",clr:"#AD1457",logo:""},
{id:82,n:"Tropi Q 99.7 FM",s:"https://www.streaming507.net:19360/videotropiq/videotropiq.m3u8",c:"music",q:"1080p",src:"Music",v:2870,d:"Tropi Q 99.7 FM - En vivo 24/7",clr:"#AD1457",logo:""},
{id:83,n:"TV Canal Sur",s:"https://streamtvs.tvcanalsur.com.do/hls/stream/index.m3u8",c:"entertainment",q:"1080p",src:"Entertainment",v:2860,d:"TV Canal Sur - En vivo 24/7",clr:"#E65100",logo:""},
{id:84,n:"TVOMIX",s:"https://cloud.tvomix.com/TVOMIX/index.m3u8",c:"music",q:"1080p",src:"Music",v:2850,d:"TVOMIX - En vivo 24/7",clr:"#AD1457",logo:""},
{id:85,n:"TyC Sports",s:"https://amg26268-amg26268c14-freelivesports-emea-10267.playouts.now.amagi.tv/ts-us-e2-n2/playlist/amg26268-sportsstudio-tycsports-freelivesportsemea/playlist.m3u8",c:"sports",q:"1080p",src:"Sports",v:2840,d:"TyC Sports - En vivo 24/7",clr:"#2E7D32",logo:""},
{id:86,n:"VB Media TV",s:"https://capomo01-enitv.eninetworks.com/locales_vbmedia_publico/index.m3u8",c:"entertainment",q:"1080p",src:"Entertainment",v:2830,d:"VB Media TV - En vivo 24/7",clr:"#E65100",logo:""},
{id:87,n:"Venus Media",s:"https://tigocloud.desdeparaguay.net/venusmedia/venusmedia/playlist.m3u8",c:"music",q:"1080p",src:"Music",v:2820,d:"Venus Media - En vivo 24/7",clr:"#AD1457",logo:""},
{id:88,n:"Vive Kanal D Drama",s:"https://thema-vivekanald-rakuten.amagi.tv/playlist.m3u8",c:"entertainment",q:"1080p",src:"Entertainment",v:2810,d:"Vive Kanal D Drama - En vivo 24/7",clr:"#E65100",logo:""},
{id:89,n:"VIVO TV",s:"https://stream.vivotv.uy/hls/stream.m3u8",c:"entertainment",q:"1080p",src:"Entertainment",v:2800,d:"VIVO TV - En vivo 24/7",clr:"#E65100",logo:""},
{id:90,n:"WTV Canal 20",s:"https://cootv.cootel.com.ni:8095/Canal40_WTV/playlist.m3u8",c:"entertainment",q:"1080p",src:"Entertainment",v:2790,d:"WTV Canal 20 - En vivo 24/7",clr:"#E65100",logo:""},
{id:91,n:"X Level Media",s:"https://tuvideoonline.com.ar:3332/live/xlevelmedialive.m3u8",c:"music",q:"1080p",src:"Music",v:2780,d:"X Level Media - En vivo 24/7",clr:"#AD1457",logo:""},
{id:92,n:"XITE Nuevo Latino",s:"https://d3bsgqzbpkrvbb.cloudfront.net/v1/master/3722c60a815c199d9c0ef36c5b73da68a62b09d1/cc-w288eaw03izg1/XITE_Nuevo_Latino.m3u8",c:"music",q:"1080p",src:"Music",v:2770,d:"XITE Nuevo Latino - En vivo 24/7",clr:"#AD1457",logo:""},
{id:93,n:"XITE Siempre Latino",s:"https://d1xc25jm9e0l4b.cloudfront.net/v1/master/3722c60a815c199d9c0ef36c5b73da68a62b09d1/cc-xplkt8i7m24dc/XITE_Siempre_Latino.m3u8",c:"music",q:"1080p",src:"Music",v:2760,d:"XITE Siempre Latino - En vivo 24/7",clr:"#AD1457",logo:""},
{id:94,n:"ZAZ",s:"https://cloud.fastchannel.es/mic/manifiest/hls/zaztv/zaztv.m3u8",c:"entertainment",q:"1080p",src:"Entertainment",v:2750,d:"ZAZ - En vivo 24/7",clr:"#E65100",logo:""},
{id:95,n:"Zylo Cine Friki",s:"https://d2mr4fu91mjx9m.cloudfront.net/v1/master/3722c60a815c199d9c0ef36c5b73da68a62b09d1/cc-rb0tx75ojbc5u/CineFriki_ES.m3u8",c:"movies",q:"1080p",src:"Movies",v:2740,d:"Zylo Cine Friki - En vivo 24/7",clr:"#6A1B9A",logo:""},
{id:96,n:"Zylo Cine Western",s:"https://d2nq34q0i1r3la.cloudfront.net/v1/master/3722c60a815c199d9c0ef36c5b73da68a62b09d1/cc-awohw8g217ho8/CineWestern_ES.m3u8",c:"movies",q:"1080p",src:"Movies",v:2730,d:"Zylo Cine Western - En vivo 24/7",clr:"#6A1B9A",logo:""},
{id:97,n:"13C",s:"https://origin.dpsgo.com/ssai/event/GI-9cp_bT8KcerLpZwkuhw/master.m3u8",c:"documentary",q:"1080p",src:"Culture",v:2720,d:"13C - En vivo 24/7",clr:"#37474F",logo:""},
{id:98,n:"Anime Vision",s:"https://d1ujfw1zyymzyd.cloudfront.net/v1/master/3722c60a815c199d9c0ef36c5b73da68a62b09d1/cc-a6fukwkbxmex8/live/fast-channel-animevision-64527ec0/fast-channel-animevision-64527ec0.m3u8",c:"kids",q:"1080p",src:"Animation",v:2700,d:"Anime Vision - En vivo 24/7",clr:"#F57C00",logo:""},
{id:99,n:"Anime Vision Classics",s:"https://d82pyvmcw2kdc.cloudfront.net/v1/master/3722c60a815c199d9c0ef36c5b73da68a62b09d1/cc-swfivzrzwamaq/live/fast-channel-animevisionclassics-efc8dc6d/fast-channel-animevisionclassics-efc8dc6d.m3u8",c:"kids",q:"1080p",src:"Animation",v:2690,d:"Anime Vision Classics - En vivo 24/7",clr:"#F57C00",logo:""},
{id:100,n:"Aruba.TV",s:"https://cdn01.setar.aw/Canal49/canal49/playlist.m3u8",c:"general",q:"1080p",src:"Travel",v:2680,d:"Aruba.TV - En vivo 24/7",clr:"#00695C",logo:""},
{id:101,n:"Canal 2 Misiones",s:"https://nd106.republicaservers.com:4433/hls/canal2misioness/index.m3u8",c:"general",q:"1080p",src:"Undefined",v:2660,d:"Canal 2 Misiones - En vivo 24/7",clr:"#00695C",logo:""},
{id:102,n:"Canal 3 La Pampa",s:"https://stream.arcast.com.ar/c3lapampa/ngrp:c3lapampa_all/playlist.m3u8",c:"general",q:"1080p",src:"Undefined",v:2650,d:"Canal 3 La Pampa - En vivo 24/7",clr:"#00695C",logo:""},
{id:103,n:"Canal 6 Posadas",s:"https://iptv.ixfo.com.ar:30443/live/c6digital/playlist.m3u8",c:"general",q:"1080p",src:"Undefined",v:2640,d:"Canal 6 Posadas - En vivo 24/7",clr:"#00695C",logo:""},
{id:104,n:"Canal 7 Salta",s:"https://vivo.solumedia.com:19360/cooperativa/cooperativa.m3u8",c:"general",q:"1080p",src:"Undefined",v:2630,d:"Canal 7 Salta - En vivo 24/7",clr:"#00695C",logo:""},
{id:105,n:"Canal 21 TV",s:"https://iptv.ixfo.com.ar:30443/c21tv/hd/c21tv/playlist.m3u8",c:"general",q:"1080p",src:"Undefined",v:2620,d:"Canal 21 TV - En vivo 24/7",clr:"#00695C",logo:""},
{id:106,n:"Canal 26 Aguascalientes",s:"https://60417ddeaf0d9.streamlock.net/telemetrika3/smil:telemetrika3.smil/playlist.m3u8",c:"general",q:"1080p",src:"Undefined",v:2610,d:"Canal 26 Aguascalientes - En vivo 24/7",clr:"#00695C",logo:""},
{id:107,n:"Canal Oración Con Son",s:"https://canal.mediaserver.com.co/live/oracionconson.m3u8",c:"religious",q:"1080p",src:"Religious",v:2600,d:"Canal Oración Con Son - En vivo 24/7",clr:"#6A1B9A",logo:""},
{id:108,n:"CBN Espanol",s:"https://fastly.live.brightcove.com/6383462549112/us-east-1/734546207001/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJob3N0IjoiczFpM3ZpLmVncmVzcy50N2M3emwiLCJhY2NvdW50X2lkIjoiNzM0NTQ2MjA3MDAxIiwiZWhuIjoiZmFzdGx5LmxpdmUuYnJpZ2h0Y292ZS5jb20iLCJpc3MiOiJibGl2ZS1wbGF5YmFjay1zb3VyY2UtYXBpIiwic3ViIjoicGF0aG1hcHRva2VuIiwiYXVkIjpbIjczNDU0NjIwNzAwMSJdLCJqdGkiOiI2MzgzNDYyNTQ5MTEyIn0.g04lznsvgqgIXQt2ZH0H_tWtIeTsMgGjVORsjOJ0T6U/playlist-hls.m3u8",c:"religious",q:"1080p",src:"Religious",v:2590,d:"CBN Espanol - En vivo 24/7",clr:"#6A1B9A",logo:""},
{id:109,n:"Choluteca TV",s:"https://s.emisoras.tv:8081/cholutecatv/index.m3u8",c:"religious",q:"1080p",src:"Religious",v:2580,d:"Choluteca TV - En vivo 24/7",clr:"#6A1B9A",logo:""},
{id:110,n:"Cielo TV",s:"https://streaming.servervideo.net:1936/cielotv/cielotv/playlist.m3u8",c:"religious",q:"1080p",src:"Religious",v:2570,d:"Cielo TV - En vivo 24/7",clr:"#6A1B9A",logo:""},
{id:111,n:"Dios Tv Talanga",s:"https://tv.webmedialive.com/unciontv/live/playlist.m3u8",c:"religious",q:"1080p",src:"Religious",v:2560,d:"Dios Tv Talanga - En vivo 24/7",clr:"#6A1B9A",logo:""},
{id:112,n:"Eduvision",s:"https://stmv3.voxtvhd.com.br/conex2/conex2/playlist.m3u8",c:"documentary",q:"1080p",src:"Education",v:2540,d:"Eduvision - En vivo 24/7",clr:"#37474F",logo:""},
{id:113,n:"EnerGeek Fan",s:"https://backend.energeek.cl/webtv/egfanweb/index.m3u8?token=ZZDemoIPTVGH",c:"kids",q:"1080p",src:"Animation",v:2530,d:"EnerGeek Fan - En vivo 24/7",clr:"#F57C00",logo:""},
{id:114,n:"Hamaika Telebista",s:"https://cdn3.wowza.com/1/RERMR282dnU5eE5Z/OHY0dVFs/hls/live/playlist.m3u8",c:"documentary",q:"1080p",src:"Culture",v:2510,d:"Hamaika Telebista - En vivo 24/7",clr:"#37474F",logo:""},
{id:115,n:"ICRTV Colima",s:"https://5fc584f3f19c9.streamlock.net/icrtvcolima/smil:icrtvcolima.smil/playlist.m3u8",c:"general",q:"1080p",src:"Legislative",v:2500,d:"ICRTV Colima - En vivo 24/7",clr:"#00695C",logo:""},
{id:116,n:"Love Nature",s:"https://aegis-cloudfront-1.tubi.video/6d6d0f24-8445-4b4c-bdf6-44f9e38beaa4/playlist.m3u8",c:"general",q:"1080p",src:"Outdoor",v:2480,d:"Love Nature - En vivo 24/7",clr:"#00695C",logo:""},
{id:117,n:"MCI Televisión",s:"https://video.ejeserver.com/live/mcitelevision.m3u8",c:"general",q:"1080p",src:"Family",v:2470,d:"MCI Televisión - En vivo 24/7",clr:"#00695C",logo:""},
{id:118,n:"Mr. Bean Anime Spain",s:"https://amg00627-amg00627c30-rakuten-es-3990.playouts.now.amagi.tv/playlist/amg00627-banijayfast-mrbeanescc-rakutenes/playlist.m3u8",c:"kids",q:"1080p",src:"Animation",v:2450,d:"Mr. Bean Anime Spain - En vivo 24/7",clr:"#F57C00",logo:""},
{id:119,n:"NatureTime Finland",s:"https://bamusa-naturetime-emea-eng-rakuten.amagi.tv/playlist.m3u8",c:"documentary",q:"1080p",src:"Documentary",v:2430,d:"NatureTime Finland - En vivo 24/7",clr:"#37474F",logo:""},
{id:120,n:"Once México",s:"https://vivo.canaloncelive.tv/securepkgr3/oncemexico/playlist.m3u8",c:"documentary",q:"1080p",src:"Education",v:2410,d:"Once México - En vivo 24/7",clr:"#37474F",logo:""},
{id:121,n:"Platzi TV",s:"https://mdstrm.com/live-stream-playlist/629a63ae8df27c082901f78b.m3u8",c:"documentary",q:"1080p",src:"Education",v:2390,d:"Platzi TV - En vivo 24/7",clr:"#37474F",logo:""},
{id:122,n:"TV BUAP",s:"https://tvenvivo.buap.mx/livestream/stream/index.m3u8",c:"documentary",q:"1080p",src:"Education",v:2230,d:"TV BUAP - En vivo 24/7",clr:"#37474F",logo:""},
{id:123,n:"TV Cuatro 4.2",s:"https://5f2c1b0d880e5.streamlock.net/tv42/tv42.smil/.m3u8",c:"documentary",q:"1080p",src:"Culture",v:2220,d:"TV Cuatro 4.2 - En vivo 24/7",clr:"#37474F",logo:""},
{id:124,n:"24/7 Canal de Noticias",s:"https://panel.host-live.com:19360/cn247tv/cn247tv.m3u8",c:"news",q:"720p",src:"News",v:2120,d:"24/7 Canal de Noticias - En vivo 24/7",clr:"#1565C0",logo:""},
{id:125,n:"Activa TV",s:"https://streamtv.mediasector.es/hls/activatv/index.m3u8",c:"music",q:"720p",src:"Music",v:2110,d:"Activa TV - En vivo 24/7",clr:"#AD1457",logo:""},
{id:126,n:"ADN 40",s:"https://mdstrm.com/live-stream-playlist/60b578b060947317de7b57ac.m3u8",c:"news",q:"720p",src:"News",v:2100,d:"ADN 40 - En vivo 24/7",clr:"#1565C0",logo:""},
{id:127,n:"Alcance FM PLAY TV",s:"https://video.wilohosting.com:19360/alcancefmtv/alcancefmtv.m3u8",c:"music",q:"720p",src:"Music",v:2090,d:"Alcance FM PLAY TV - En vivo 24/7",clr:"#AD1457",logo:""},
{id:128,n:"ATV+",s:"https://d2qsan2ut81n2k.cloudfront.net/live/77eece7f-8de5-4406-9f7e-7be16d81f2ce/ts:abr.m3u8",c:"news",q:"720p",src:"News",v:2080,d:"ATV+ - En vivo 24/7",clr:"#1565C0",logo:""},
{id:129,n:"Aurora Media Films",s:"https://cdn.streamhispanatv.net:3417/live/auroramflive.m3u8",c:"movies",q:"720p",src:"Movies",v:2070,d:"Aurora Media Films - En vivo 24/7",clr:"#6A1B9A",logo:""},
{id:130,n:"Canal 24 Horas",s:"https://ztnr.rtve.es/ztnr/1694255.m3u8",c:"news",q:"720p",src:"News",v:2020,d:"Canal 24 Horas - En vivo 24/7",clr:"#1565C0",logo:""},
{id:131,n:"Canal 24 Horas Canarias",s:"https://ztnr.rtve.es/ztnr/5473142.m3u8",c:"news",q:"720p",src:"News",v:2010,d:"Canal 24 Horas Canarias - En vivo 24/7",clr:"#1565C0",logo:""},
{id:132,n:"Canal 24 Horas Catalunya",s:"https://ztnr.rtve.es/ztnr/4952053.m3u8",c:"news",q:"720p",src:"News",v:2000,d:"Canal 24 Horas Catalunya - En vivo 24/7",clr:"#1565C0",logo:""},
{id:133,n:"Canal PyC",s:"https://live20.bozztv.com/akamaissh101/ssh101/pyctelevision/playlist.m3u8",c:"news",q:"720p",src:"News",v:1990,d:"Canal PyC - En vivo 24/7",clr:"#1565C0",logo:""},
{id:134,n:"Canal Sur Noticias",s:"https://cdnlive.codev8.net/rtvalive/smil:channel42.smil/playlist.m3u8",c:"news",q:"720p",src:"News",v:1980,d:"Canal Sur Noticias - En vivo 24/7",clr:"#1565C0",logo:""},
{id:135,n:"Chinola TV",s:"https://tv.wracanal10.com:3300/live/chinolatvlive.m3u8",c:"kids",q:"576p",src:"Kids",v:1970,d:"Chinola TV - En vivo 24/7",clr:"#F57C00",logo:""},
{id:136,n:"Cine adrenalina",s:"https://jmp2.uk/plu-5d8d164d92e97a5e107638d2.m3u8",c:"movies",q:"720p",src:"Movies",v:1960,d:"Cine adrenalina - En vivo 24/7",clr:"#6A1B9A",logo:""},
{id:137,n:"Cine Clásico",s:"https://jmp2.uk/plu-64b9671cdac71b0008f371df.m3u8",c:"movies",q:"720p",src:"Movies",v:1950,d:"Cine Clásico - En vivo 24/7",clr:"#6A1B9A",logo:""},
{id:138,n:"Cine comedia",s:"https://jmp2.uk/plu-5f513564e4622a0007c578c0.m3u8",c:"movies",q:"720p",src:"Movies",v:1940,d:"Cine comedia - En vivo 24/7",clr:"#6A1B9A",logo:""},
{id:139,n:"Cine Premiere",s:"https://jmp2.uk/plu-5cf968040ab7d8f181e6a68b.m3u8",c:"movies",q:"720p",src:"Movies",v:1930,d:"Cine Premiere - En vivo 24/7",clr:"#6A1B9A",logo:""},
{id:140,n:"Cine Sony",s:"https://a-cdn.klowdtv.com/live1/cine_720p/playlist.m3u8",c:"movies",q:"720p",src:"Movies",v:1920,d:"Cine Sony - En vivo 24/7",clr:"#6A1B9A",logo:""},
{id:141,n:"Cine terror",s:"https://jmp2.uk/plu-5d8d180092e97a5e107638d3.m3u8",c:"movies",q:"720p",src:"Movies",v:1910,d:"Cine terror - En vivo 24/7",clr:"#6A1B9A",logo:""},
{id:142,n:"ColimdoT TV",s:"https://cnn.livestreaminggroup.info:3132/live/colimdotvlive.m3u8",c:"sports",q:"720p",src:"Sports",v:1900,d:"ColimdoT TV - En vivo 24/7",clr:"#2E7D32",logo:""},
{id:143,n:"Contivision",s:"https://unlimited6-cl.dps.live/cm/cm.smil/playlist.m3u8",c:"news",q:"720p",src:"News",v:1880,d:"Contivision - En vivo 24/7",clr:"#1565C0",logo:""},
{id:144,n:"De Ultimo Minuto TV",s:"https://soportedvb.click:3620/live/deultimominutomedialive.m3u8",c:"news",q:"720p",src:"News",v:1870,d:"De Ultimo Minuto TV - En vivo 24/7",clr:"#1565C0",logo:""},
{id:145,n:"Dios Te Ve Kids",s:"https://s.emisoras.tv:8081/diostevekids/index.m3u8",c:"kids",q:"720p",src:"Kids",v:1860,d:"Dios Te Ve Kids - En vivo 24/7",clr:"#F57C00",logo:""},
{id:146,n:"Ecotel TV",s:"https://ecoteltv.streamseguro.com:5443/LiveApp/streams/streaming.m3u8",c:"news",q:"720p",src:"News",v:1850,d:"Ecotel TV - En vivo 24/7",clr:"#1565C0",logo:""},
{id:147,n:"El Chavo TV",s:"https://live20.bozztv.com/giatvplayout7/giatv-211465/playlist.m3u8",c:"kids",q:"720p",src:"Kids",v:1840,d:"El Chavo TV - En vivo 24/7",clr:"#F57C00",logo:""},
{id:148,n:"FIFA+ Hispanic America",s:"https://6c849fb3.wurl.com/master/f36d25e7e52f1ba8d7e56eb859c636563214f541/TEctbXhfRklGQVBsdXNTcGFuaXNoLTFfSExT/playlist.m3u8",c:"sports",q:"720p",src:"Sports",v:1830,d:"FIFA+ Hispanic America - En vivo 24/7",clr:"#2E7D32",logo:""},
{id:149,n:"FIFA+ Spain",s:"https://d63fabad.wurl.com/master/f36d25e7e52f1ba8d7e56eb859c636563214f541/UmFrdXRlblRWLWVzX0ZJRkFQbHVzU3BhbmlzaF9ITFM/playlist.m3u8",c:"sports",q:"720p",src:"Sports",v:1820,d:"FIFA+ Spain - En vivo 24/7",clr:"#2E7D32",logo:""},
{id:150,n:"FTV",s:"https://master.tucableip.com/ftvhd/index.m3u8",c:"sports",q:"720p",src:"Sports",v:1810,d:"FTV - En vivo 24/7",clr:"#2E7D32",logo:""},
{id:151,n:"HCH",s:"https://live.streamhch.com/live/streams/hch1.m3u8",c:"news",q:"720p",src:"News",v:1800,d:"HCH - En vivo 24/7",clr:"#1565C0",logo:""},
{id:152,n:"Lucha Libre AAA",s:"https://jmp2.uk/plu-5c01df1759ee03633e7b272c.m3u8",c:"sports",q:"720p",src:"Sports",v:1790,d:"Lucha Libre AAA - En vivo 24/7",clr:"#2E7D32",logo:""},
{id:153,n:"MyTime Movie Network Mexico",s:"https://appletree-mytime-samsungmexico.amagi.tv/playlist.m3u8",c:"movies",q:"720p",src:"Movies",v:1780,d:"MyTime Movie Network Mexico - En vivo 24/7",clr:"#6A1B9A",logo:""},
{id:154,n:"Nanduti",s:"https://zn1tf.desdeparaguay.net/nandutitv/nandutitv_alta/playlist.m3u8",c:"news",q:"720p",src:"News",v:1770,d:"Nanduti - En vivo 24/7",clr:"#1565C0",logo:""},
{id:155,n:"Next HD",s:"https://live.enhdtv.com:19360/nexthd/nexthd.m3u8",c:"movies",q:"576p",src:"Movies",v:1760,d:"Next HD - En vivo 24/7",clr:"#6A1B9A",logo:""},
{id:156,n:"Nickelodeon en español",s:"https://jmp2.uk/plu-5d8d08395f39465da6fb3ec4.m3u8",c:"kids",q:"720p",src:"Kids",v:1750,d:"Nickelodeon en español - En vivo 24/7",clr:"#F57C00",logo:""},
{id:157,n:"Norte Informativo TV",s:"https://videohd.live:19360/8076/8076.m3u8",c:"news",q:"576p",src:"News",v:1740,d:"Norte Informativo TV - En vivo 24/7",clr:"#1565C0",logo:""},
{id:158,n:"Realmadrid TV",s:"https://jmp2.uk/plu-63dac28760bc8f0008a7654b.m3u8",c:"sports",q:"720p",src:"Sports",v:1720,d:"Realmadrid TV - En vivo 24/7",clr:"#2E7D32",logo:""},
{id:159,n:"Teletrak",s:"https://unlimited6-cl.dps.live/sportinghd/sportinghd.smil/playlist.m3u8",c:"sports",q:"720p",src:"Sports",v:1700,d:"Teletrak - En vivo 24/7",clr:"#2E7D32",logo:""},
{id:160,n:"Turf Movil",s:"https://tvturf4.janus.cl/playlist/stream.m3u8?d=w&id=",c:"sports",q:"720p",src:"Sports",v:1690,d:"Turf Movil - En vivo 24/7",clr:"#2E7D32",logo:""},
{id:161,n:"Canal 15 ILCE Summa Sabres",s:"https://live-ilce.ovp-vivaro.digital/ovp-origin-abr/ngrp:6359ef999f3fb_all/playlist.m3u8",c:"documentary",q:"720p",src:"Education",v:1480,d:"Canal 15 ILCE Summa Sabres - En vivo 24/7",clr:"#37474F",logo:""},
{id:162,n:"Canal 17 RTVD",s:"https://protvradiostream.com:1936/rtvd17/ngrp:rtvd17_all/playlist.m3u8",c:"documentary",q:"720p",src:"Culture",v:1470,d:"Canal 17 RTVD - En vivo 24/7",clr:"#37474F",logo:""},
{id:163,n:"Catamarca TV",s:"https://stream.arcast.com.ar/canal7catamarca/ngrp:canal7catamarca_all/playlist.m3u8?DVR=",c:"documentary",q:"720p",src:"Culture",v:1450,d:"Catamarca TV - En vivo 24/7",clr:"#37474F",logo:""},
{id:164,n:"Click TV (Coronel)",s:"https://v2.tustreaming.cl/clicktv/playlist.m3u8",c:"documentary",q:"720p",src:"Documentary",v:1420,d:"Click TV (Coronel) - En vivo 24/7",clr:"#37474F",logo:""},
{id:165,n:"Crimen & Historia",s:"https://jmp2.uk/plu-64ddcbb14c5ed80008fad416.m3u8",c:"documentary",q:"720p",src:"Documentary",v:1390,d:"Crimen & Historia - En vivo 24/7",clr:"#37474F",logo:""},
{id:166,n:"Ecovisión",s:"https://streaming.grupomediosdelnorte.com:19360/ecovision/ecovision.m3u8",c:"documentary",q:"720p",src:"Documentary",v:1360,d:"Ecovisión - En vivo 24/7",clr:"#37474F",logo:""},
{id:167,n:"En Lengua de Senas TV",s:"https://cloudtv.streaming.com.py/lenguasdesenas/lenguasdesenas/chunklist.m3u8",c:"documentary",q:"720p",src:"Education",v:1330,d:"En Lengua de Senas TV - En vivo 24/7",clr:"#37474F",logo:""},
{id:168,n:"Naruto",s:"https://jmp2.uk/plu-5ee92e72fb286e0007285fec.m3u8",c:"kids",q:"720p",src:"Animation",v:1240,d:"Naruto - En vivo 24/7",clr:"#F57C00",logo:""}
];
var CATS=[{id:"all",label:"Todos",icon:"fa-globe"},{id:"news",label:"Noticias",icon:"fa-newspaper"},{id:"sports",label:"Deportes",icon:"fa-futbol"},{id:"movies",label:"Peliculas",icon:"fa-film"},{id:"entertainment",label:"Entretenimiento",icon:"fa-star"},{id:"music",label:"Musica",icon:"fa-music"},{id:"kids",label:"Ninos",icon:"fa-child"},{id:"documentary",label:"Documentales",icon:"fa-book"},{id:"religious",label:"Religion",icon:"fa-pray"},{id:"general",label:"General",icon:"fa-tv"}];
var CAT_GRAD={news:'linear-gradient(135deg,#1a237e 0%,#0d47a1 50%,#01579b 100%)',sports:'linear-gradient(135deg,#1b5e20 0%,#2e7d32 50%,#388e3c 100%)',movies:'linear-gradient(135deg,#311b92 0%,#4a148c 50%,#6a1b9a 100%)',entertainment:'linear-gradient(135deg,#bf360c 0%,#d84315 50%,#e65100 100%)',music:'linear-gradient(135deg,#880e4f 0%,#ad1457 50%,#c2185b 100%)',kids:'linear-gradient(135deg,#e65100 0%,#f57c00 50%,#ff9800 100%)',documentary:'linear-gradient(135deg,#263238 0%,#37474f 50%,#455a64 100%)',religious:'linear-gradient(135deg,#4a148c 0%,#6a1b9a 50%,#7b1fa2 100%)',general:'linear-gradient(135deg,#004d40 0%,#00695c 50%,#00796b 100%)'};
var CAT_ICON={news:'fa-newspaper',sports:'fa-futbol',movies:'fa-film',entertainment:'fa-star',music:'fa-music',kids:'fa-child',documentary:'fa-book-open',religious:'fa-pray',general:'fa-tv'};

var curFilter='all',curCh=null,hlsInst=null,heroIdx=0,heroIv=null;
var retryCount=0,MAX_RETRIES=3,playerRetryTimer=null;
var audioCtx=null,soundEnabled=true;
try{soundEnabled=localStorage.getItem('edge-sound')!=='off';}catch(e){}

function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function fmtV(v){return v>=1000?(v/1000).toFixed(1)+'K':v.toString();}
function catLabel(c){for(var i=0;i<CATS.length;i++){if(CATS[i].id===c)return CATS[i].label;}return c;}
function ini(n){return n.replace(/[^A-Za-z0-9]/g,'').substring(0,2).toUpperCase();}

// Logo: img with data attrs, fix broken ones via JS after render (NO inline onerror)
function logoImg(ch,cls){return ch.logo?'<img class="'+cls+'" src="'+ch.logo+'" alt="'+esc(ch.n)+'" data-clr="'+ch.clr+'" data-ini="'+ini(ch.n)+'">':'';}
function logoFB(ch,cls,sz){var s=sz||56,fs=Math.round(s*0.39),br=Math.round(s*0.25);return '<div class="'+cls+'" style="width:'+s+'px;height:'+s+'px;border-radius:'+br+'px;background:'+ch.clr+';color:#fff;font-size:'+fs+'px;font-weight:900;display:none;align-items:center;justify-content:center;font-family:var(--font-display);letter-spacing:1px">'+ini(ch.n)+'</div>';}

function fixLogos(){
  var imgs=document.querySelectorAll('img[data-clr]');
  for(var i=0;i<imgs.length;i++){(function(img){
    if(img.naturalWidth===0&&img.complete){swapFB(img);}
    else{img.addEventListener('error',function(){swapFB(img);},{once:true});}
  })(imgs[i]);}
}
function swapFB(img){
  var p=img.parentNode;if(!p)return;
  var fb=p.querySelector('.ch-logo-fb,.oa-logo-fb,.tr-logo-fb,.slide-logo-fb');
  if(fb){fb.style.display='flex';}
  img.style.display='none';
}

function initAudio(){try{audioCtx=new(window.AudioContext||window.webkitAudioContext)();}catch(e){}}
function playBlip(){if(!audioCtx||!soundEnabled)return;try{var o=audioCtx.createOscillator(),g=audioCtx.createGain();o.connect(g);g.connect(audioCtx.destination);o.type='sine';o.frequency.setValueAtTime(880,audioCtx.currentTime);o.frequency.exponentialRampToValueAtTime(440,audioCtx.currentTime+0.1);g.gain.setValueAtTime(0.08,audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(0.001,audioCtx.currentTime+0.1);o.start(audioCtx.currentTime);o.stop(audioCtx.currentTime+0.1);}catch(e){}}
function playClick(){if(!audioCtx||!soundEnabled)return;try{var o=audioCtx.createOscillator(),g=audioCtx.createGain();o.connect(g);g.connect(audioCtx.destination);o.type='sine';o.frequency.setValueAtTime(1200,audioCtx.currentTime);o.frequency.exponentialRampToValueAtTime(600,audioCtx.currentTime+0.05);g.gain.setValueAtTime(0.03,audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(0.001,audioCtx.currentTime+0.05);o.start(audioCtx.currentTime);o.stop(audioCtx.currentTime+0.05);}catch(e){}}
document.addEventListener('click',function fc(){if(!audioCtx)initAudio();document.removeEventListener('click',fc);},{once:true});
function killSplash(){var s=document.getElementById('splash');if(s)s.classList.add('hide');}

function renderCats(){var el=document.getElementById('cat-filter');if(!el)return;var h='';for(var i=0;i<CATS.length;i++){var c=CATS[i];var cnt=c.id==='all'?CHANNELS.length:CHANNELS.filter(function(ch){return ch.c===c.id;}).length;h+='<button data-cat="'+c.id+'" class="'+(c.id===curFilter?'active':'')+'"><i class="fas '+c.icon+'"></i> '+c.label+' ('+cnt+')</button>';}el.innerHTML=h;}

function renderSkeletons(){var g=document.getElementById('channels-grid');if(!g)return;var h='';for(var i=0;i<12;i++)h+='<div class="skeleton-card"><div class="skeleton-thumb"></div><div class="skeleton-body"><div class="skeleton-line"></div><div class="skeleton-line short"></div></div></div>';g.innerHTML=h;}

function renderGrid(){
  var grid=document.getElementById('channels-grid');if(!grid)return;
  var list=curFilter==='all'?CHANNELS:CHANNELS.filter(function(ch){return ch.c===curFilter;});
  var ce=document.getElementById('ch-count');if(ce)ce.textContent=list.length+' channels';
  if(!list.length){grid.innerHTML='<div style="text-align:center;padding:40px;color:var(--muted)">No se encontraron canales</div>';return;}
  var h='';
  for(var i=0;i<list.length;i++){var ch=list[i],cg=CAT_GRAD[ch.c]||CAT_GRAD.news,ci=CAT_ICON[ch.c]||'fa-tv';
    h+='<div class="ch-card" data-id="'+ch.id+'"><div class="ch-thumb"><div class="ch-thumb-img" style="background:'+cg+'"></div><div class="ch-thumb-overlay"></div>'+logoImg(ch,'ch-logo')+logoFB(ch,'ch-logo-fb')+(ch.logo?'':'<i class="fas '+ci+' ch-thumb-icon"></i>')+'<div class="ch-thumb-label">'+esc(ch.n)+'</div><div class="ch-thumb-src">'+esc(ch.src)+'</div><span class="live-badge">LIVE</span><span class="ch-quality">'+ch.q+'</span><span class="ch-viewers"><i class="fas fa-eye"></i> '+fmtV(ch.v)+'</span><span class="ch-cat-tag">'+catLabel(ch.c)+'</span><div class="ch-play"><i class="fas fa-play"></i></div></div><div class="ch-body"><div class="ch-name">'+esc(ch.n)+'</div><div class="ch-desc">'+esc(ch.d)+'</div></div></div>';}
  grid.innerHTML=h;setTimeout(fixLogos,100);
}

function setupLazyLoad(){
  if(!('IntersectionObserver' in window)){var cards=document.querySelectorAll('.ch-card');for(var i=0;i<cards.length;i++)cards[i].classList.add('visible');return;}
  var obs=new IntersectionObserver(function(e){for(var i=0;i<e.length;i++){if(e[i].isIntersecting){e[i].target.classList.add('visible');obs.unobserve(e[i].target);}}},{threshold:0.1,rootMargin:'50px'});
  var cards=document.querySelectorAll('.ch-card');for(var i=0;i<cards.length;i++)obs.observe(cards[i]);
}

function renderHero(){
  var feat=CHANNELS.slice().sort(function(a,b){return b.v-a.v;}).slice(0,5),se=document.getElementById('hero-slides'),de=document.getElementById('hero-dots');
  if(!se||!de)return;var sh='',dh='';
  for(var i=0;i<feat.length;i++){var ch=feat[i],ia=i===0?'active':'';
    sh+='<div class="hero-slide '+ia+'" data-idx="'+i+'"><div class="slide-bg" style="background:'+(CAT_GRAD[ch.c]||CAT_GRAD.news)+'"></div><div class="slide-grad"></div><div class="slide-content"><div class="slide-label">NOW STREAMING</div>'+logoImg(ch,'slide-logo')+logoFB(ch,'slide-logo-fb',50)+'<h2 class="slide-title">'+esc(ch.n)+'</h2><p class="slide-desc">'+esc(ch.d)+'</p><div class="slide-meta"><span class="meta-badge dur"><i class="fas fa-clock" style="margin-right:3px"></i>24/7</span><span class="meta-badge qual">'+ch.q+'</span><span class="meta-badge cat">'+catLabel(ch.c)+'</span><span class="meta-badge src">'+esc(ch.src)+'</span></div><button class="btn-watch" data-id="'+ch.id+'"><i class="fas fa-play"></i> Watch Now</button></div></div>';
    dh+='<span data-idx="'+i+'" class="'+(i===0?'active':'')+'"></span>';}
  se.innerHTML=sh;de.innerHTML=dh;setTimeout(fixLogos,100);
}
function startHero(){heroIv=setInterval(function(){var sl=document.querySelectorAll('.hero-slide'),dt=document.querySelectorAll('.hero-dots span');if(!sl.length)return;sl[heroIdx].classList.remove('active');dt[heroIdx].classList.remove('active');heroIdx=(heroIdx+1)%sl.length;sl[heroIdx].classList.add('active');dt[heroIdx].classList.add('active');},6000);}
function goHero(idx){var sl=document.querySelectorAll('.hero-slide'),dt=document.querySelectorAll('.hero-dots span');if(!sl.length)return;sl[heroIdx].classList.remove('active');dt[heroIdx].classList.remove('active');heroIdx=idx%sl.length;sl[heroIdx].classList.add('active');dt[heroIdx].classList.add('active');}

function renderSidebar(){
  var ob=document.getElementById('on-air-body'),tb=document.getElementById('trending-body');
  var top=CHANNELS.slice().sort(function(a,b){return b.v-a.v;}).slice(0,6);
  if(ob){var oh='';for(var i=0;i<top.length;i++){var ch=top[i];oh+='<div class="on-air-ch" data-id="'+ch.id+'"><div class="oa-dot"></div>'+logoImg(ch,'oa-logo')+logoFB(ch,'oa-logo-fb',20)+'<span class="oa-name">'+esc(ch.n)+'</span><span class="oa-viewers">'+fmtV(ch.v)+'</span></div>';}ob.innerHTML=oh;}
  if(tb){var th='';for(var j=0;j<top.length;j++){var tc=top[j];th+='<div class="trending-item" data-id="'+tc.id+'"><span class="tr-rank">'+(j+1)+'</span>'+logoImg(tc,'tr-logo')+logoFB(tc,'tr-logo-fb',20)+'<span class="tr-name">'+esc(tc.n)+'</span><span class="tr-viewers">'+fmtV(tc.v)+'</span></div>';}tb.innerHTML=th;}
  setTimeout(fixLogos,100);
}

function renderUpcoming(){
  var el=document.getElementById('upcoming-scroll');if(!el)return;
  var cats=['news','sports','movies','entertainment','music','kids','documentary','international'],h='';
  for(var i=0;i<cats.length;i++){var chs=CHANNELS.filter(function(c){return c.c===cats[i];});if(!chs.length)continue;var pick=chs[Math.floor(Math.random()*chs.length)];var hrs=[18,19,20,21,22,23,0,1,2],hr=hrs[Math.floor(Math.random()*hrs.length)],ap=hr>=12?'PM':'AM',dp=hr===0?12:hr>12?hr-12:hr;
    h+='<div class="upcoming-card" data-id="'+pick.id+'"><div class="uc-cat">'+catLabel(pick.c)+'</div><div class="uc-name">'+esc(pick.n)+'</div><div class="uc-time">'+dp+':00 '+ap+'</div></div>';}
  el.innerHTML=h;
}

function openPlayer(ch){curCh=ch;retryCount=0;if(playerRetryTimer){clearTimeout(playerRetryTimer);playerRetryTimer=null;}var m=document.getElementById('player-modal'),v=document.getElementById('hls-video'),t=document.getElementById('player-title'),st=document.getElementById('player-status');if(t)t.textContent=ch.n;if(st){st.className='p-status connecting';st.textContent='CONNECTING';}if(m)m.classList.add('open');hideOffline();showSpinner();startStream(ch.s);document.body.style.overflow='hidden';var ms=document.getElementById('mistral-msg');if(ms)ms.textContent='Now playing: '+ch.n+'. Ask me for similar channels!';}

function startStream(url){
  if(hlsInst){hlsInst.destroy();hlsInst=null;}
  var v=document.getElementById('hls-video');if(!v)return;v.removeAttribute('src');v.load();hideOffline();showSpinner();
  if(typeof Hls!=='undefined'&&Hls.isSupported()){
    hlsInst=new Hls({enableWorker:true,lowLatencyMode:true,maxBufferLength:30,maxMaxBufferLength:60});
    hlsInst.loadSource(url);hlsInst.attachMedia(v);
    hlsInst.on(Hls.Events.MANIFEST_PARSED,function(){v.play().catch(function(){});hideSpinner();setStatus('live');updateQuality();});
    hlsInst.on(Hls.Events.ERROR,function(ev,d){if(d.fatal){if(d.type===Hls.ErrorTypes.MEDIA_ERROR)hlsInst.recoverMediaError();else fatalErr(url);}});
  }else if(v.canPlayType('application/vnd.apple.mpegurl')){
    v.src=url;v.addEventListener('loadedmetadata',function om(){v.play().catch(function(){});hideSpinner();setStatus('live');updateQuality();v.removeEventListener('loadedmetadata',om);});
  }
  v.onerror=function(){fatalErr(url);};v.onwaiting=function(){showBuffer();};v.onplaying=function(){hideBuffer();hideSpinner();setStatus('live');};v.onloadedmetadata=function(){updateQuality();};
}
function fatalErr(url){if(retryCount<MAX_RETRIES){retryCount++;var d=Math.pow(2,retryCount)*1000;showToast('Retrying in '+(d/1000)+'s');if(playerRetryTimer)clearTimeout(playerRetryTimer);playerRetryTimer=setTimeout(function(){startStream(url);},d);}else tryNext();}
function tryNext(){if(!curCh){showOffline();return;}var same=CHANNELS.filter(function(ch){return ch.c===curCh.c&&ch.id!==curCh.id;});if(!same.length){showOffline();return;}var nx=same[0];showToast('Switching to: '+nx.n);retryCount=0;curCh=nx;var t=document.getElementById('player-title');if(t)t.textContent=nx.n;setStatus('connecting');hideOffline();showSpinner();startStream(nx.s);}
function closePlayer(){var m=document.getElementById('player-modal'),v=document.getElementById('hls-video');if(hlsInst){hlsInst.destroy();hlsInst=null;}if(v){v.pause();v.removeAttribute('src');v.load();}if(m)m.classList.remove('open');if(playerRetryTimer){clearTimeout(playerRetryTimer);playerRetryTimer=null;}document.body.style.overflow='';hideOffline();hideSpinner();hideBuffer();}
function setStatus(s){var e=document.getElementById('player-status');if(!e)return;e.className='p-status '+s;e.textContent=s==='live'?'LIVE':s==='connecting'?'CONNECTING':'OFFLINE';}
function showSpinner(){var e=document.getElementById('player-spinner');if(e)e.classList.add('show');}
function hideSpinner(){var e=document.getElementById('player-spinner');if(e)e.classList.remove('show');}
function showBuffer(){var e=document.getElementById('buffering-overlay');if(e)e.classList.add('show');}
function hideBuffer(){var e=document.getElementById('buffering-overlay');if(e)e.classList.remove('show');}
function showOffline(){var e=document.getElementById('offline-overlay');if(e)e.classList.add('show');setStatus('offline');hideSpinner();hideBuffer();}
function hideOffline(){var e=document.getElementById('offline-overlay');if(e)e.classList.remove('show');}
function updateQuality(){var v=document.getElementById('hls-video'),qi=document.getElementById('quality-indicator');if(!v||!qi)return;var w=v.videoWidth;qi.textContent=w>=2160?'4K':w>=1280?'HD':w>=720?'720p':'SD';qi.style.display='inline-block';}

var toastT=null;
function showToast(msg){var e=document.getElementById('toast');if(!e)return;e.textContent=msg;e.className='toast show';if(toastT)clearTimeout(toastT);toastT=setTimeout(function(){e.classList.remove('show');},3000);}

function toggleSound(){soundEnabled=!soundEnabled;try{localStorage.setItem('edge-sound',soundEnabled?'on':'off');}catch(e){}var b=document.getElementById('sound-toggle');if(b)b.innerHTML=soundEnabled?'<i class="fas fa-volume-up"></i>':'<i class="fas fa-volume-mute"></i>';if(soundEnabled&&!audioCtx)initAudio();showToast(soundEnabled?'Sound on':'Sound off');}

function doSearch(q){q=q.toLowerCase().trim();if(!q){curFilter='all';renderGrid();setupLazyLoad();renderCats();return;}var r=CHANNELS.filter(function(ch){return ch.n.toLowerCase().indexOf(q)>=0||ch.c.indexOf(q)>=0||ch.src.toLowerCase().indexOf(q)>=0||ch.d.toLowerCase().indexOf(q)>=0;});var g=document.getElementById('channels-grid'),ce=document.getElementById('ch-count');if(ce)ce.textContent=r.length+' results';if(!r.length){if(g)g.innerHTML='<div style="text-align:center;padding:40px;color:var(--muted)">No results</div>';return;}var h='';for(var i=0;i<r.length;i++){var ch=r[i],cg=CAT_GRAD[ch.c]||CAT_GRAD.news,ci=CAT_ICON[ch.c]||'fa-tv';h+='<div class="ch-card visible" data-id="'+ch.id+'"><div class="ch-thumb"><div class="ch-thumb-img" style="background:'+cg+'"></div><div class="ch-thumb-overlay"></div>'+logoImg(ch,'ch-logo')+logoFB(ch,'ch-logo-fb')+'<div class="ch-thumb-label">'+esc(ch.n)+'</div><div class="ch-thumb-src">'+esc(ch.src)+'</div><span class="live-badge">LIVE</span><span class="ch-quality">'+ch.q+'</span><span class="ch-viewers"><i class="fas fa-eye"></i> '+fmtV(ch.v)+'</span><span class="ch-cat-tag">'+catLabel(ch.c)+'</span><div class="ch-play"><i class="fas fa-play"></i></div></div><div class="ch-body"><div class="ch-name">'+esc(ch.n)+'</div><div class="ch-desc">'+esc(ch.d)+'</div></div></div>';}if(g)g.innerHTML=h;setTimeout(fixLogos,100);}

function updateStats(){var c=document.getElementById('stat-ch'),h=document.getElementById('stat-hd');if(c)c.textContent=CHANNELS.length;if(h)h.textContent=CHANNELS.filter(function(ch){return ch.q==='1080p';}).length;}

function askMistral(q,ctx){var m=document.getElementById('mistral-msg');if(!m)return;m.textContent='Thinking...';var sp='You are EDGE IPTV assistant. '+CHANNELS.length+' free HD channels. ';var cats={};for(var i=0;i<CHANNELS.length;i++){var ch=CHANNELS[i];if(!cats[ch.c])cats[ch.c]=[];cats[ch.c].push(ch.n);}for(var k in cats)sp+=k+': '+cats[k].join(', ')+'. ';if(ctx)sp+='Watching: '+ctx+'. ';sp+='Be brief. Recommend by name.';
fetch('/api/ai',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:[{role:'system',content:sp},{role:'user',content:q}],max_tokens:200})}).then(function(r){return r.json();}).then(function(d){if(d.choices&&d.choices[0])m.textContent=d.choices[0].message.content;else if(d.error)m.textContent=typeof d.error==='string'?d.error:JSON.stringify(d.error);else m.textContent='No response.';}).catch(function(){var ql=q.toLowerCase(),mt=CHANNELS.filter(function(ch){return ch.n.toLowerCase().indexOf(ql)>=0||ch.c.indexOf(ql)>=0;}).slice(0,5);m.textContent=mt.length?'Try: '+mt.map(function(c){return c.n+' ('+catLabel(c.c)+')';}).join(', '):'No matches. Try "news" or "sports".';});}

function initApp(){try{renderCats();renderSkeletons();setTimeout(function(){renderGrid();setupLazyLoad();},150);renderHero();startHero();renderSidebar();renderUpcoming();bindAll();updateStats();}catch(e){console.error('initApp:',e);}killSplash();}

function bindAll(){
  var catEl=document.getElementById('cat-filter');if(catEl)catEl.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;curFilter=b.getAttribute('data-cat');playClick();renderCats();renderGrid();setupLazyLoad();});
  var gridEl=document.getElementById('channels-grid');if(gridEl)gridEl.addEventListener('click',function(e){var c=e.target.closest('.ch-card');if(!c)return;var id=parseInt(c.getAttribute('data-id')),ch=CHANNELS.find(function(x){return x.id===id;});if(ch){playClick();openPlayer(ch);}});
  var hn=document.getElementById('hero-next'),hp=document.getElementById('hero-prev'),hd=document.getElementById('hero-dots'),hs=document.getElementById('hero-slides');
  if(hn)hn.addEventListener('click',function(){goHero(heroIdx+1);});if(hp)hp.addEventListener('click',function(){goHero(heroIdx-1<0?4:heroIdx-1);});
  if(hd)hd.addEventListener('click',function(e){var d=e.target.closest('span');if(!d)return;goHero(parseInt(d.getAttribute('data-idx')));});
  if(hs)hs.addEventListener('click',function(e){var b=e.target.closest('.btn-watch');if(!b)return;var id=parseInt(b.getAttribute('data-id')),ch=CHANNELS.find(function(x){return x.id===id;});if(ch)openPlayer(ch);});
  var pc=document.getElementById('player-close'),pm=document.getElementById('player-modal');if(pc)pc.addEventListener('click',closePlayer);if(pm)pm.addEventListener('click',function(e){if(e.target===this)closePlayer();});
  var pp=document.getElementById('play-pause');if(pp)pp.addEventListener('click',function(){var v=document.getElementById('hls-video'),ic=this.querySelector('i');if(!v)return;if(v.paused){v.play().catch(function(){});ic.className='fas fa-pause';}else{v.pause();ic.className='fas fa-play';}});
  var vb=document.getElementById('vol-btn'),vs=document.getElementById('vol-slider');
  if(vb)vb.addEventListener('click',function(){var v=document.getElementById('hls-video'),ic=vb.querySelector('i');if(!v)return;if(v.muted){v.muted=false;vs.value=v.volume*100;ic.className='fas fa-volume-up';}else{v.muted=true;vs.value=0;ic.className='fas fa-volume-mute';}});
  if(vs)vs.addEventListener('input',function(){var v=document.getElementById('hls-video');if(!v)return;var val=parseInt(this.value);v.volume=val/100;v.muted=val===0;var ic=vb?vb.querySelector('i'):null;if(ic){if(val===0)ic.className='fas fa-volume-mute';else if(val<50)ic.className='fas fa-volume-down';else ic.className='fas fa-volume-up';}});
  var fsb=document.getElementById('fullscreen-btn');if(fsb)fsb.addEventListener('click',function(){var w=document.querySelector('.player-wrap');if(!w)return;if(document.fullscreenElement)document.exitFullscreen();else w.requestFullscreen().catch(function(){});});
  var ab=document.getElementById('audio-btn');if(ab)ab.addEventListener('click',function(){showToast('Audio selection coming soon');});
  var br=document.getElementById('btn-retry'),bs=document.getElementById('btn-switch');
  if(br)br.addEventListener('click',function(){if(!curCh)return;retryCount=0;hideOffline();showSpinner();setStatus('connecting');startStream(curCh.s);});
  if(bs)bs.addEventListener('click',function(){tryNext();});
  var stb=document.getElementById('search-toggle'),sb=document.getElementById('search-box'),si=document.getElementById('search-input');
  if(stb)stb.addEventListener('click',function(){if(sb){sb.classList.toggle('open');if(sb.classList.contains('open')&&si)si.focus();}});
  if(si)si.addEventListener('input',function(){doSearch(this.value);});
  var sdb=document.getElementById('sound-toggle');if(sdb)sdb.addEventListener('click',toggleSound);if(sdb&&soundEnabled)sdb.innerHTML='<i class="fas fa-volume-up"></i>';
  var tids=['on-air-toggle','trending-toggle','mistral-toggle'];for(var t=0;t<tids.length;t++){(function(tid){var el=document.getElementById(tid);if(el)el.addEventListener('click',function(){this.classList.toggle('collapsed');var bd=this.nextElementSibling;if(bd)bd.classList.toggle('collapsed');});})(tids[t]);}
  var oab=document.getElementById('on-air-body');if(oab)oab.addEventListener('click',function(e){var it=e.target.closest('.on-air-ch');if(!it)return;var id=parseInt(it.getAttribute('data-id')),ch=CHANNELS.find(function(x){return x.id===id;});if(ch)openPlayer(ch);});
  var trb=document.getElementById('trending-body');if(trb)trb.addEventListener('click',function(e){var it=e.target.closest('.trending-item');if(!it)return;var id=parseInt(it.getAttribute('data-id')),ch=CHANNELS.find(function(x){return x.id===id;});if(ch)openPlayer(ch);});
  var ucs=document.getElementById('upcoming-scroll');if(ucs)ucs.addEventListener('click',function(e){var c=e.target.closest('.upcoming-card');if(!c)return;var id=parseInt(c.getAttribute('data-id')),ch=CHANNELS.find(function(x){return x.id===id;});if(ch)openPlayer(ch);});
  var nls=document.querySelectorAll('header nav a');for(var n=0;n<nls.length;n++){nls[n].addEventListener('click',function(e){e.preventDefault();for(var j=0;j<nls.length;j++)nls[j].classList.remove('active');this.classList.add('active');var nv=this.getAttribute('data-nav');curFilter=nv==='sports'?'sports':nv==='news'?'news':'all';renderCats();renderGrid();setupLazyLoad();var cs=document.getElementById('channels-section');if(cs)window.scrollTo({top:cs.offsetTop-80,behavior:'smooth'});});}
  var msd=document.getElementById('mistral-send'),msi=document.getElementById('mistral-input');
  if(msd)msd.addEventListener('click',function(){if(msi&&msi.value.trim())askMistral(msi.value.trim(),curCh?curCh.n+' ('+catLabel(curCh.c)+')':'');if(msi)msi.value='';});
  if(msi)msi.addEventListener('keydown',function(e){if(e.key==='Enter'){if(this.value.trim())askMistral(this.value.trim(),curCh?curCh.n+' ('+catLabel(curCh.c)+')':'');this.value='';}});
  document.addEventListener('keydown',function(e){if(e.key==='Escape')closePlayer();});
}

try{initApp();}catch(e){console.error('BOOT:',e);killSplash();}
})();
<\/script>
</body>
</html>`;

    return new Response(html, {
      headers: { 'Content-Type': 'text/html;charset=UTF-8', 'Cache-Control': 'no-cache' }
    });
  }
};
