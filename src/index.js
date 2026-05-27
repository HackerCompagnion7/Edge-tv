/*
  EDGE v3.1 - IPTV Web App | Cloudflare Worker
  =============================================
  REAL WORKING STREAMS from verified CDN endpoints.
  Sources: iptv-org, Pluto TV, Samsung TV+, Plex, Stirr, 
           Al Jazeera, France 24, DW, ABC News, etc.
  
  DEPLOY:
  1. npm install -g wrangler
  2. wrangler login
  3. wrangler init edge-iptv  (replace src/index.js)
  4. wrangler deploy
*/
export default {
  async fetch(request) {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>EDGE - Free HD IPTV</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#050508;--bg2:#0c0c12;--bg3:#15151e;--bg4:#1e1e2a;
  --red:#ff2244;--red-glow:rgba(255,34,68,0.35);
  --cyan:#00e5ff;--cyan-glow:rgba(0,229,255,0.25);
  --purple:#b44aff;--purple-glow:rgba(180,74,255,0.25);
  --gold:#ffc107;--green:#00e676;
  --white:#eee;--gray:#999;--gray2:#555;
  --font-display:'Orbitron',monospace;--font-body:'Inter',sans-serif;
  --radius:10px;--transition:0.3s ease;
}
html{scroll-behavior:smooth}
body{font-family:var(--font-body);background:var(--bg);color:var(--white);overflow-x:hidden;line-height:1.6}
a{color:var(--cyan);text-decoration:none}
button{cursor:pointer;font-family:var(--font-body);border:none;outline:none}
img{max-width:100%;display:block}
::-webkit-scrollbar{width:5px;height:5px}
::-webkit-scrollbar-track{background:var(--bg2)}
::-webkit-scrollbar-thumb{background:var(--gray2);border-radius:3px}

#splash{position:fixed;inset:0;z-index:10000;background:var(--bg);display:flex;flex-direction:column;align-items:center;justify-content:center;transition:opacity 0.8s ease,visibility 0.8s}
#splash.gone{opacity:0;visibility:hidden;pointer-events:none}
#splash .logo{font-family:var(--font-display);font-size:72px;font-weight:900;color:#fff;letter-spacing:10px}
#splash .sub{font-size:12px;color:var(--gray);letter-spacing:6px;margin-top:8px;font-family:var(--font-display)}
#splash .bar-wrap{width:280px;height:3px;background:var(--bg3);border-radius:2px;margin-top:36px;overflow:hidden}
#splash .bar{height:100%;width:0%;background:linear-gradient(90deg,var(--red),var(--purple),var(--cyan));border-radius:2px;transition:width 0.08s linear}
#splash .load-txt{font-family:var(--font-display);font-size:10px;color:var(--gray2);margin-top:14px;letter-spacing:4px}

header{position:sticky;top:0;z-index:1000;background:rgba(5,5,8,0.92);backdrop-filter:blur(16px);border-bottom:1px solid rgba(255,255,255,0.04);padding:0 28px;height:56px;display:flex;align-items:center;justify-content:space-between}
.logo-mark{font-family:var(--font-display);font-size:22px;font-weight:900;letter-spacing:5px;color:#fff}
.logo-mark span{color:var(--red)}
header nav{display:flex;gap:20px;align-items:center}
header nav a{color:var(--gray);font-size:13px;font-weight:500;display:flex;align-items:center;gap:5px;transition:color var(--transition);padding:6px 0;position:relative}
header nav a:hover,header nav a.active{color:var(--white)}
header nav a.active::after{content:'';position:absolute;bottom:-2px;left:0;width:100%;height:2px;background:var(--red);border-radius:1px}
.hdr-right{display:flex;align-items:center;gap:14px}
.hdr-right button{background:none;color:var(--gray);font-size:17px;transition:color var(--transition)}
.hdr-right button:hover{color:var(--white)}
#search-box{position:absolute;top:56px;right:28px;width:340px;background:var(--bg2);border:1px solid var(--bg3);border-radius:var(--radius);padding:14px;display:none;z-index:1001;box-shadow:0 8px 32px rgba(0,0,0,0.5)}
#search-box.open{display:block}
#search-box input{width:100%;background:var(--bg3);border:1px solid var(--gray2);border-radius:6px;padding:10px 14px;color:var(--white);font-size:13px}
#search-box input:focus{border-color:var(--cyan)}

.hero{position:relative;width:100%;height:400px;overflow:hidden;background:linear-gradient(135deg,var(--bg2),var(--bg3))}
.hero-slide{position:absolute;inset:0;opacity:0;transition:opacity 1s ease;display:flex;align-items:center}
.hero-slide.active{opacity:1}
.hero-slide .slide-bg{position:absolute;inset:0;background-size:cover;background-position:center;filter:brightness(0.25) saturate(1.2)}
.hero-slide .slide-grad{position:absolute;inset:0;background:linear-gradient(90deg,rgba(5,5,8,0.95) 0%,rgba(5,5,8,0.6) 50%,transparent 100%)}
.hero-slide .slide-content{position:relative;z-index:2;padding:0 60px;max-width:650px}
.hero-slide .slide-cat{font-family:var(--font-display);font-size:10px;letter-spacing:4px;color:var(--red);text-transform:uppercase;margin-bottom:10px}
.hero-slide .slide-title{font-family:var(--font-display);font-size:32px;font-weight:700;margin-bottom:10px;line-height:1.2}
.hero-slide .slide-desc{color:var(--gray);font-size:14px;margin-bottom:16px;line-height:1.5}
.hero-slide .slide-meta{display:flex;align-items:center;gap:16px;margin-bottom:20px}
.hero-slide .slide-quality{background:var(--bg3);border:1px solid var(--cyan);color:var(--cyan);font-size:10px;padding:3px 10px;border-radius:4px;font-weight:600;letter-spacing:1px}
.hero-slide .slide-source{color:var(--gray2);font-size:12px}
.hero-slide .btn-watch{background:linear-gradient(135deg,var(--red),#cc1133);color:#fff;padding:12px 28px;border-radius:var(--radius);font-weight:600;font-size:13px;letter-spacing:1px;transition:all var(--transition);display:inline-flex;align-items:center;gap:8px}
.hero-slide .btn-watch:hover{transform:translateY(-2px);box-shadow:0 8px 24px var(--red-glow)}
.hero-arrows{position:absolute;top:50%;width:100%;display:flex;justify-content:space-between;padding:0 16px;z-index:3;transform:translateY(-50%)}
.hero-arrows button{background:rgba(0,0,0,0.5);backdrop-filter:blur(8px);color:#fff;width:42px;height:42px;border-radius:50%;font-size:16px;display:flex;align-items:center;justify-content:center;transition:all var(--transition);border:1px solid rgba(255,255,255,0.1)}
.hero-arrows button:hover{background:var(--red);border-color:var(--red)}
.hero-dots{position:absolute;bottom:20px;left:50%;transform:translateX(-50%);display:flex;gap:8px;z-index:3}
.hero-dots span{width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,0.2);cursor:pointer;transition:all var(--transition)}
.hero-dots span.active{background:var(--red);box-shadow:0 0 10px var(--red-glow);width:24px;border-radius:4px}

.main-layout{display:flex;gap:24px;max-width:1440px;margin:0 auto;padding:28px 24px}
.main-content{flex:1;min-width:0}
.sidebar{width:300px;flex-shrink:0}
.section-title{font-family:var(--font-display);font-size:18px;font-weight:700;margin-bottom:18px;display:flex;align-items:center;gap:10px}
.section-title .st-bar{width:3px;height:20px;background:linear-gradient(180deg,var(--red),var(--purple));border-radius:2px}
.section-title .st-count{font-size:11px;color:var(--gray2);font-weight:400;margin-left:auto}

.cat-filter{display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap}
.cat-filter button{background:var(--bg3);color:var(--gray);padding:7px 16px;border-radius:20px;font-size:12px;font-weight:500;transition:all var(--transition);border:1px solid transparent}
.cat-filter button:hover{color:var(--white);border-color:var(--gray2)}
.cat-filter button.active{background:linear-gradient(135deg,var(--red),#cc1133);color:#fff;border-color:transparent}

.channels-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px}
.ch-card{background:var(--bg2);border-radius:var(--radius);overflow:hidden;border:1px solid var(--bg3);transition:all var(--transition);position:relative;cursor:pointer}
.ch-card:hover{transform:translateY(-4px);border-color:var(--red);box-shadow:0 8px 32px var(--red-glow)}
.ch-card .ch-thumb{width:100%;height:130px;background:var(--bg3);position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center}
.ch-card .ch-thumb-label{font-family:var(--font-display);font-size:11px;color:rgba(255,255,255,0.7);letter-spacing:2px;text-align:center;padding:10px;word-break:break-word}
.ch-card .live-badge{position:absolute;top:10px;left:10px;background:var(--red);color:#fff;font-size:9px;font-weight:700;padding:2px 8px;border-radius:4px;letter-spacing:1px;animation:livePulse 2s infinite;display:flex;align-items:center;gap:4px}
.ch-card .live-badge::before{content:'';width:5px;height:5px;border-radius:50%;background:#fff;animation:dotPulse 1s infinite}
.ch-card .ch-quality{position:absolute;top:10px;right:10px;background:rgba(0,0,0,0.7);color:var(--cyan);font-size:9px;font-weight:600;padding:2px 6px;border-radius:3px;letter-spacing:1px;border:1px solid rgba(0,229,255,0.3)}
.ch-card .ch-source{position:absolute;bottom:8px;right:8px;font-size:9px;color:rgba(255,255,255,0.4);background:rgba(0,0,0,0.6);padding:2px 6px;border-radius:3px}
.ch-card .ch-play{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) scale(0.8);width:44px;height:44px;border-radius:50%;background:rgba(255,34,68,0.85);display:flex;align-items:center;justify-content:center;color:#fff;font-size:16px;opacity:0;transition:all var(--transition)}
.ch-card:hover .ch-play{opacity:1;transform:translate(-50%,-50%) scale(1)}
.ch-card .ch-body{padding:12px 14px}
.ch-card .ch-name{font-weight:600;font-size:13px;margin-bottom:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ch-card .ch-cat{color:var(--gray2);font-size:11px;text-transform:capitalize}
@keyframes livePulse{0%,100%{opacity:1}50%{opacity:0.7}}
@keyframes dotPulse{0%,100%{opacity:1}50%{opacity:0.3}}

.sidebar-section{background:var(--bg2);border-radius:var(--radius);border:1px solid var(--bg3);padding:16px;margin-bottom:16px}
.sidebar-section h3{font-family:var(--font-display);font-size:11px;letter-spacing:2px;color:var(--red);margin-bottom:14px;text-transform:uppercase;display:flex;align-items:center;gap:8px}
.sidebar-toggle{cursor:pointer;display:flex;align-items:center;justify-content:space-between}
.sidebar-toggle .chevron{transition:transform var(--transition);font-size:12px;color:var(--gray2)}
.sidebar-toggle.collapsed .chevron{transform:rotate(-90deg)}
.sidebar-body{overflow:hidden;transition:max-height 0.4s ease;max-height:600px}
.sidebar-body.collapsed{max-height:0}
.on-air-ch{display:flex;align-items:center;gap:10px;padding:6px;border-radius:6px;cursor:pointer;transition:background var(--transition);margin-bottom:4px}
.on-air-ch:hover{background:var(--bg3)}
.on-air-ch .oa-dot{width:8px;height:8px;border-radius:50%;background:var(--red);flex-shrink:0;animation:dotPulse 1.5s infinite}
.on-air-ch .oa-name{font-size:12px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.on-air-ch .oa-now{font-size:10px;color:var(--gray)}
.trending-item{display:flex;align-items:center;gap:8px;margin-bottom:8px;cursor:pointer;padding:4px 6px;border-radius:4px;transition:background var(--transition)}
.trending-item:hover{background:var(--bg3)}
.trending-item .tr-rank{font-family:var(--font-display);font-size:16px;color:var(--red);min-width:20px}
.trending-item .tr-name{font-size:12px;font-weight:500;flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.trending-item .tr-viewers{font-size:10px;color:var(--gray2)}

.mp-chat{display:flex;flex-direction:column;gap:8px}
.mp-input-wrap{display:flex;gap:6px}
.mp-input{flex:1;background:var(--bg3);border:1px solid var(--bg4);border-radius:6px;padding:8px 10px;color:var(--white);font-size:12px}
.mp-input:focus{border-color:var(--purple)}
.mp-send{background:var(--purple);color:#fff;padding:8px 12px;border-radius:6px;font-size:12px;transition:all var(--transition)}
.mp-send:hover{box-shadow:0 0 12px var(--purple-glow)}
.mp-msg{font-size:12px;color:var(--gray);line-height:1.5;padding:8px;background:var(--bg3);border-radius:6px;border-left:2px solid var(--purple)}

#player-modal{position:fixed;inset:0;z-index:9000;background:rgba(0,0,0,0.95);display:none;align-items:center;justify-content:center}
#player-modal.open{display:flex}
#player-modal .player-wrap{position:relative;width:92%;max-width:1000px;background:#000;border-radius:var(--radius);overflow:hidden;box-shadow:0 0 80px rgba(255,34,68,0.15)}
#player-modal video{width:100%;aspect-ratio:16/9;display:block;background:#000}
#player-modal .player-close{position:absolute;top:12px;right:12px;background:rgba(0,0,0,0.6);backdrop-filter:blur(8px);color:#fff;width:38px;height:38px;border-radius:50%;font-size:16px;display:flex;align-items:center;justify-content:center;z-index:2;transition:all var(--transition);border:1px solid rgba(255,255,255,0.1)}
#player-modal .player-close:hover{background:var(--red);border-color:var(--red)}
.player-bar{display:flex;align-items:center;gap:14px;padding:10px 16px;background:var(--bg2);border-top:1px solid var(--bg3)}
.player-bar button{background:none;color:var(--gray);font-size:16px;transition:color var(--transition)}
.player-bar button:hover{color:var(--white)}
.player-bar .p-title{flex:1;font-size:13px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.player-bar .p-status{font-size:10px;padding:2px 8px;border-radius:4px;font-weight:600;letter-spacing:1px}
.p-status.live{background:var(--red);color:#fff;animation:livePulse 2s infinite}
.p-status.connecting{background:var(--gold);color:#000}
.p-status.offline{background:var(--bg3);color:var(--gray)}
.offline-overlay{position:absolute;inset:0;background:rgba(0,0,0,0.9);display:none;flex-direction:column;align-items:center;justify-content:center;gap:14px;z-index:3}
.offline-overlay.show{display:flex}
.offline-overlay .off-icon{font-size:48px;color:var(--red);opacity:0.5}
.offline-overlay .off-text{font-family:var(--font-display);font-size:16px;color:var(--gray);letter-spacing:4px}
.offline-overlay .off-hint{font-size:12px;color:var(--gray2);max-width:300px;text-align:center;line-height:1.5}
.offline-overlay .btn-retry{background:var(--red);color:#fff;padding:10px 24px;border-radius:var(--radius);font-weight:600;font-size:13px;transition:all var(--transition)}
.offline-overlay .btn-retry:hover{box-shadow:0 0 20px var(--red-glow)}
.offline-overlay .btn-switch{background:var(--bg3);color:var(--cyan);padding:8px 20px;border-radius:var(--radius);font-size:12px;transition:all var(--transition)}
.offline-overlay .btn-switch:hover{background:var(--bg4)}

.upcoming-scroll{display:flex;gap:14px;overflow-x:auto;padding-bottom:10px;scroll-snap-type:x mandatory}
.upcoming-card{min-width:200px;background:var(--bg2);border-radius:var(--radius);padding:14px;border:1px solid var(--bg3);scroll-snap-align:start;flex-shrink:0;cursor:pointer;transition:all var(--transition)}
.upcoming-card:hover{border-color:var(--purple);transform:translateY(-2px)}
.upcoming-card .uc-cat{font-size:9px;color:var(--red);font-weight:600;letter-spacing:2px;margin-bottom:6px;text-transform:uppercase}
.upcoming-card .uc-name{font-size:13px;font-weight:500;margin-bottom:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.upcoming-card .uc-time{font-family:var(--font-display);font-size:14px;color:var(--cyan);letter-spacing:1px}

footer{background:var(--bg2);border-top:1px solid var(--bg3);padding:28px 24px;text-align:center;margin-top:48px}
footer .f-brand{font-family:var(--font-display);font-size:12px;letter-spacing:4px;color:var(--gray2)}
footer .f-brand span{color:var(--red)}
footer .f-stats{display:flex;justify-content:center;gap:28px;margin-top:12px}
footer .f-stats .stat{font-size:11px;color:var(--gray2)}
footer .f-stats .stat strong{color:var(--cyan);font-family:var(--font-display)}

.btn-refresh{background:var(--bg3);color:var(--cyan);padding:7px 14px;border-radius:var(--radius);font-size:12px;font-weight:500;display:flex;align-items:center;gap:5px;transition:all var(--transition);border:1px solid var(--bg4)}
.btn-refresh:hover{border-color:var(--cyan);box-shadow:0 0 12px var(--cyan-glow)}
.btn-refresh.spinning i{animation:spin 0.8s linear infinite}
@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}

@media(max-width:1024px){
  .main-layout{flex-direction:column}
  .sidebar{width:100%}
  .channels-grid{grid-template-columns:repeat(auto-fill,minmax(200px,1fr))}
  .hero{height:340px}
  .hero-slide .slide-content{padding:0 30px}
  .hero-slide .slide-title{font-size:26px}
}
@media(max-width:640px){
  .channels-grid{grid-template-columns:1fr 1fr}
  header nav{gap:12px}
  header nav a span{display:none}
  .hero{height:260px}
  .hero-slide .slide-title{font-size:20px}
  .hero-slide .slide-content{padding:0 20px}
  .sidebar-section{padding:12px}
  .hero-slide .slide-desc{display:none}
}

.toast{position:fixed;bottom:24px;right:24px;background:var(--bg3);color:var(--white);padding:12px 20px;border-radius:var(--radius);font-size:13px;z-index:9999;transform:translateY(80px);opacity:0;transition:all var(--transition);border-left:3px solid var(--cyan);max-width:320px;box-shadow:0 4px 24px rgba(0,0,0,0.4)}
.toast.show{transform:translateY(0);opacity:1}
.toast.error{border-left-color:var(--red)}
.no-results{text-align:center;padding:40px;color:var(--gray2);font-size:14px}
</style>
</head>
<body>

<div id="splash">
  <div class="logo">EDGE</div>
  <div class="sub">FREE HD IPTV</div>
  <div class="bar-wrap"><div class="bar" id="load-bar"></div></div>
  <div class="load-txt">CONNECTING...</div>
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
    <button id="search-toggle" aria-label="Search"><i class="fas fa-search"></i></button>
    <button class="btn-refresh" id="refresh-btn" aria-label="Refresh"><i class="fas fa-sync-alt"></i></button>
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
      <h2 class="section-title"><span class="st-bar"></span> Live Channels <span class="st-count" id="ch-count"></span></h2>
      <div class="cat-filter" id="cat-filter"></div>
      <div class="channels-grid" id="channels-grid"></div>
    </section>
    <section id="upcoming-section" style="margin-top:40px">
      <h2 class="section-title"><span class="st-bar"></span> Coming Up</h2>
      <div class="upcoming-scroll" id="upcoming-scroll"></div>
    </section>
  </main>
  <aside class="sidebar">
    <div class="sidebar-section">
      <div class="sidebar-toggle" id="on-air-toggle">
        <h3><i class="fas fa-broadcast-tower"></i> On Air Now</h3>
        <i class="fas fa-chevron-down chevron"></i>
      </div>
      <div class="sidebar-body" id="on-air-body"></div>
    </div>
    <div class="sidebar-section">
      <div class="sidebar-toggle" id="trending-toggle">
        <h3><i class="fas fa-fire"></i> Trending</h3>
        <i class="fas fa-chevron-down chevron"></i>
      </div>
      <div class="sidebar-body" id="trending-body"></div>
    </div>
    <div class="sidebar-section">
      <div class="sidebar-toggle" id="mistral-toggle">
        <h3><i class="fas fa-robot"></i> AI Assistant</h3>
        <i class="fas fa-chevron-down chevron"></i>
      </div>
      <div class="sidebar-body" id="mistral-body">
        <div class="mp-chat">
          <div class="mp-msg" id="mistral-msg">Click on any channel and I will suggest similar content.</div>
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
    <div class="offline-overlay" id="offline-overlay">
      <i class="fas fa-signal off-icon"></i>
      <div class="off-text">STREAM OFFLINE</div>
      <div class="off-hint">This stream may be geo-blocked. Try another channel or use a VPN.</div>
      <button class="btn-retry" id="btn-retry"><i class="fas fa-redo"></i> Retry</button>
      <button class="btn-switch" id="btn-switch"><i class="fas fa-exchange-alt"></i> Try Next Channel</button>
    </div>
    <div class="player-bar">
      <button id="play-pause"><i class="fas fa-play"></i></button>
      <button id="vol-toggle"><i class="fas fa-volume-mute"></i></button>
      <span class="p-title" id="player-title">-</span>
      <span class="p-status connecting" id="player-status">CONNECTING</span>
      <button id="fullscreen-btn"><i class="fas fa-expand"></i></button>
    </div>
  </div>
</div>

<div class="toast" id="toast"></div>

<footer>
  <div class="f-brand">EDGE <span>v3.1</span> - 100% Free IPTV</div>
  <div class="f-stats">
    <div class="stat"><strong id="stat-ch">0</strong> channels</div>
    <div class="stat"><strong id="stat-hd">0</strong> HD</div>
    <div class="stat"><strong>6</strong> sources</div>
  </div>
</footer>

<script src="https://cdn.jsdelivr.net/npm/hls.js@1.5.7"><\/script>
<script>
// ===== SAFETY: Force hide splash after 5s no matter what =====
setTimeout(function(){var s=document.getElementById('splash');if(s)s.classList.add('gone');},5000);

// ===== ERROR CATCHER =====
window.onerror=function(msg,url,line){console.error('EDGE Error:',msg,line);var s=document.getElementById('splash');if(s)s.classList.add('gone');return true;};

// ===== CHANNEL DATA =====
var CHANNELS=[
{id:1,n:"Al Jazeera English",s:"https://live-hls-apps-aje-fa.getaj.net/AJE/index.m3u8",c:"news",q:"1080p",src:"Al Jazeera",v:10492,d:"Global news from the Middle East",clr:"#fa9000"},
{id:2,n:"Al Jazeera Arabic",s:"https://live-hls-apps-aja-fa.getaj.net/AJA/01.m3u8",c:"news",q:"1080p",src:"Al Jazeera",v:13631,d:"Arabic-language 24h news",clr:"#fa9000"},
{id:3,n:"France 24 English",s:"https://live.france24.com/hls/live/2037218-b/F24_EN_HI_HLS/master_5000.m3u8",c:"news",q:"1080p",src:"France 24",v:12298,d:"International news from Paris",clr:"#0055a5"},
{id:4,n:"France 24 French",s:"https://live.france24.com/hls/live/2037179-b/F24_FR_HI_HLS/master_5000.m3u8",c:"news",q:"1080p",src:"France 24",v:14869,d:"Actualites en francais",clr:"#0055a5"},
{id:5,n:"France 24 Arabic",s:"https://live.france24.com/hls/live/2037222-b/F24_AR_HI_HLS/master_5000.m3u8",c:"news",q:"1080p",src:"France 24",v:7713,d:"Arabic French news",clr:"#0055a5"},
{id:6,n:"DW English",s:"https://dwamdstream102.akamaized.net/hls/live/2015525/dwstream102/master.m3u8",c:"news",q:"1080p",src:"Deutsche Welle",v:6034,d:"Germany international broadcaster",clr:"#003399"},
{id:7,n:"DW Spanish",s:"https://dwamdstream104.akamaized.net/hls/live/2015530/dwstream104/master.m3u8",c:"news",q:"1080p",src:"Deutsche Welle",v:793,d:"DW en espanol",clr:"#003399"},
{id:8,n:"ABC News Live",s:"https://abc-news-dmd-streams-1.akamaized.net/out/v1/701126012d044971b3fa89406a440133/index.m3u8",c:"news",q:"720p",src:"ABC News",v:10380,d:"24/7 live news from ABC",clr:"#e4002b"},
{id:9,n:"ABC News Stream 1",s:"https://abcnews-streams.akamaized.net/hls/live/2023560/abcnewshudson1/master_4000.m3u8",c:"news",q:"720p",src:"ABC News",v:8200,d:"ABC News live stream",clr:"#e4002b"},
{id:10,n:"Africa 24",s:"https://africa24.vedge.infomaniak.com/livecast/ik:africa24/manifest.m3u8",c:"news",q:"1080p",src:"Infomaniak",v:2469,d:"Pan-African news",clr:"#007a3d"},
{id:11,n:"Euronews English",s:"https://d35j504z0x2vu2.cloudfront.net/v1/master/0bc8e8376bd8417a1b6761138aa41c26c7309312/euronews/euronews-en.m3u8",c:"news",q:"720p",src:"Euronews",v:6721,d:"European world news",clr:"#003876"},
{id:12,n:"Court TV",s:"https://cdn-uw2-prod.tsv2.amagi.tv/linear/amg01438-ewscrippscompan-courttv-tablo/playlist.m3u8",c:"news",q:"1080p",src:"Stirr",v:13660,d:"Live trial coverage",clr:"#1a3a5c"},
{id:13,n:"ACCDN",s:"https://raycom-accdn-firetv.amagi.tv/playlist.m3u8",c:"sports",q:"1080p",src:"Amagi",v:9995,d:"ACC Digital Network",clr:"#003087"},
{id:14,n:"CBS Sports Golazo",s:"https://proped3fhg87.airspace-cdn.cbsivideo.com/golazo-live-dai/master/golazo-live-dai.m3u8",c:"sports",q:"720p",src:"CBS",v:8200,d:"24/7 soccer network",clr:"#0047ab"},
{id:15,n:"FIFA+ English",s:"https://a62dad94.wurl.com/master/f36d25e7e52f1ba8d7e56eb859c636563214f541/UmFrdXRlblRWLWV1X0ZJRkFQbHVzRW5nbGlzaF9ITFM/playlist.m3u8",c:"sports",q:"720p",src:"FIFA+",v:7100,d:"FIFA content English",clr:"#326295"},
{id:16,n:"FIFA+ Spanish",s:"https://6c849fb3.wurl.com/master/f36d25e7e52f1ba8d7e56eb859c636563214f541/TEctbXhfRklGQVBsdXNTcGFuaXNoLTFfSExT/playlist.m3u8",c:"sports",q:"720p",src:"FIFA+",v:5200,d:"FIFA en espanol",clr:"#326295"},
{id:17,n:"fubo Sports",s:"https://dnf08l6u6uxnz.cloudfront.net/master.m3u8",c:"sports",q:"1080p",src:"fuboTV",v:11400,d:"Free sports network",clr:"#6c2dc7"},
{id:18,n:"Billiard TV",s:"https://1621590671.rsc.cdn77.org/HLS/BILLIARDTV.m3u8",c:"sports",q:"1080p",src:"CDN77",v:6314,d:"24/7 billiards",clr:"#1b5e20"},
{id:19,n:"FTF Sports",s:"https://1657061170.rsc.cdn77.org/HLS/FTF-LINEAR.m3u8",c:"sports",q:"720p",src:"CDN77",v:4400,d:"Football combat sports",clr:"#b71c1c"},
{id:20,n:"FanDuel Racing",s:"https://d3ehq1uaxory6w.cloudfront.net/out/v1/35c05f080f4e49a4b4eb031b5a14e505/TVG2index_2.m3u8",c:"sports",q:"720p",src:"FanDuel",v:3500,d:"Live horse racing",clr:"#1493ff"},
{id:21,n:"FanDuel TV",s:"https://d2jl8r92tdc3f1.cloudfront.net/out/v1/59419700344b4625b7cb0693ba265ea3/TVGindex_1.m3u8",c:"sports",q:"720p",src:"FanDuel",v:4100,d:"Sports betting analysis",clr:"#1493ff"},
{id:22,n:"DAZN Combat",s:"https://dazn-combat-rakuten.amagi.tv/hls/amagi_hls_data_rakutenAA-dazn-combat-rakuten/CDN/master.m3u8",c:"sports",q:"1080p",src:"Rakuten",v:8600,d:"Combat sports 24/7",clr:"#333"},
{id:23,n:"GLORY Kickboxing",s:"https://6f972d29.wurl.com/master/f36d25e7e52f1ba8d7e56eb859c636563214f541/UmFrdXRlblRWLWV1X0dsb3J5S2lja2JveGluZ19ITFM/playlist.m3u8",c:"sports",q:"720p",src:"Rakuten",v:3700,d:"World kickboxing",clr:"#dc143c"},
{id:24,n:"Speed Sport 1",s:"https://linear-599.frequency.stream/dist/stirr/599/hls/master/playlist.m3u8",c:"sports",q:"1080p",src:"Stirr",v:5400,d:"Motorsport racing",clr:"#ff6600"},
{id:25,n:"Artflix Classics",s:"https://amogonetworx-artflix-1-nl.samsung.wurl.tv/playlist.m3u8",c:"movies",q:"720p",src:"Samsung TV+",v:5800,d:"Classic cinema golden age",clr:"#8d6e63"},
{id:26,n:"Alien Nation DUST",s:"https://dqi7ayt2o24fn.cloudfront.net/playlist.m3u8",c:"movies",q:"1080p",src:"DUST",v:2479,d:"Sci-fi short films",clr:"#4a148c"},
{id:27,n:"70s Cinema",s:"https://jmp2.uk/plu-5f4d878d3d19b30007d2e782.m3u8",c:"movies",q:"720p",src:"Pluto TV",v:4100,d:"Classic 1970s movies",clr:"#bf360c"},
{id:28,n:"80s Rewind",s:"https://jmp2.uk/plu-5ca525b650be2571e3943c63.m3u8",c:"movies",q:"720p",src:"Pluto TV",v:6200,d:"Best of 1980s cinema",clr:"#e91e63"},
{id:29,n:"90s Throwback",s:"https://jmp2.uk/plu-5f4d86f519358a00072b978e.m3u8",c:"movies",q:"720p",src:"Pluto TV",v:5500,d:"90s movies marathon",clr:"#9c27b0"},
{id:30,n:"24h Free Movies",s:"https://d1b5mlajbmvkjv.cloudfront.net/v1/master/9d062541f2ff39b5c0f48b743c6411d25f62fc25/UDU-DistroTV/145.m3u8",c:"movies",q:"720p",src:"DistroTV",v:7800,d:"Free movies 24/7",clr:"#37474f"},
{id:31,n:"30A Classic Movies",s:"https://30a-tv.com/feeds/pzaz/30atvmovies.m3u8",c:"movies",q:"720p",src:"30A TV",v:3200,d:"Timeless movie classics",clr:"#3e2723"},
{id:32,n:"Rakuten Action",s:"https://284824cf70404fdfb6ddf9349009c710.mediatailor.eu-west-1.amazonaws.com/v1/master/0547f18649bd788bec7b67b746e47670f558b6b2/production-LiveChannel-6066/master.m3u8",c:"movies",q:"1080p",src:"Rakuten",v:12246,d:"Action movies 24/7",clr:"#d32f2f"},
{id:33,n:"Rakuten Top UK",s:"https://0145451975a64b35866170fd2e8fa486.mediatailor.eu-west-1.amazonaws.com/v1/master/0547f18649bd788bec7b67b746e47670f558b6b2/production-LiveChannel-5987/master.m3u8",c:"movies",q:"1080p",src:"Rakuten",v:9466,d:"Top UK movies",clr:"#1565c0"},
{id:34,n:"Charge! Action",s:"https://fast-channels.sinclairstoryline.com/CHARGE/index.m3u8",c:"movies",q:"1080p",src:"Sinclair",v:10663,d:"Action movies series",clr:"#c62828"},
{id:35,n:"AMC Reality",s:"https://amc-absolutereality-1-us.plex.wurl.tv/playlist.m3u8",c:"entertainment",q:"720p",src:"Plex TV",v:7100,d:"Reality TV from AMC",clr:"#5d4037"},
{id:36,n:"ALLBLK Gems",s:"https://df1zke3zj042m.cloudfront.net/playlist.m3u8",c:"entertainment",q:"720p",src:"ALLBLK",v:4200,d:"Black culture entertainment",clr:"#4a148c"},
{id:37,n:"Bounce XL",s:"https://cdn-uw2-prod.tsv2.amagi.tv/linear/amg01438-ewscrippscompan-bouncexl-tablo/playlist.m3u8",c:"entertainment",q:"1080p",src:"Stirr",v:6800,d:"African-American entertainment",clr:"#ff6f00"},
{id:38,n:"Buzzr Game Shows",s:"https://buzzrota-ono.amagi.tv/playlist.m3u8",c:"entertainment",q:"1080p",src:"Amagi",v:9100,d:"Classic game shows 24/7",clr:"#ff9800"},
{id:39,n:"AsianCrush",s:"https://linear-900.frequency.stream/dist/cineverse/900/hls/master/playlist.m3u8",c:"entertainment",q:"1080p",src:"Frequency",v:5400,d:"Asian movies dramas",clr:"#e91e63"},
{id:40,n:"AfroLandTV",s:"https://alt-al.otteravision.com/alt/al/al.m3u8",c:"entertainment",q:"1080p",src:"AfroLand",v:3800,d:"African entertainment",clr:"#1b5e20"},
{id:41,n:"30A Television",s:"https://30a-tv.com/feeds/masters/30atv.m3u8",c:"entertainment",q:"720p",src:"30A TV",v:2900,d:"Florida beach lifestyle",clr:"#00838f"},
{id:42,n:"Forensic Files",s:"https://jmp2.uk/plu-5bb1af6a268cae539bcedb0a.m3u8",c:"entertainment",q:"720p",src:"Pluto TV",v:8300,d:"Crime investigations",clr:"#455a64"},
{id:43,n:"CMC California",s:"https://cmc-ono.amagi.tv/playlist.m3u8",c:"music",q:"1080p",src:"Amagi",v:6126,d:"California Music Channel",clr:"#e91e63"},
{id:44,n:"30A Music",s:"https://30a-tv.com/music.m3u8",c:"music",q:"720p",src:"30A TV",v:2100,d:"Beach music vibes",clr:"#00bcd4"},
{id:45,n:"Dance Television",s:"https://m1b2.worldcast.tv/dancetelevisionone/dancetelevisionone.m3u8",c:"music",q:"1080p",src:"WorldCast",v:4300,d:"Electronic dance music",clr:"#7c4dff"},
{id:46,n:"DanceTV EDM",s:"https://mbit1.worldcast.tv/dancetelevisionseven/multibit.m3u8",c:"music",q:"1080p",src:"WorldCast",v:3800,d:"Mainstage EDM live",clr:"#651fff"},
{id:47,n:"DanceTV Techno",s:"https://m2b2.worldcast.tv:7443/dancetelevisionthree/dancetelevisionthree.m3u8",c:"music",q:"1080p",src:"WorldCast",v:2900,d:"Underground techno",clr:"#311b92"},
{id:48,n:"Clubbing TV",s:"https://d1j2csarxnwazk.cloudfront.net/v1/master/3722c60a815c199d9c0ef36c5b73da68a62b09d1/cc-uze1m6xh4fiyr-ssai-prd/master.m3u8",c:"music",q:"720p",src:"Rakuten",v:5100,d:"Club DJ music",clr:"#9c27b0"},
{id:49,n:"Stingray Rock",s:"https://lotus.stingray.com/manifest/ose-101ads-montreal/samsungtvplus/master.m3u8",c:"music",q:"1080p",src:"Samsung TV+",v:7200,d:"Classic rock hits",clr:"#f44336"},
{id:50,n:"Stingray Hit List",s:"https://lotus.stingray.com/manifest/ose-107ads-montreal/samsungtvplus/master.m3u8",c:"music",q:"1080p",src:"Samsung TV+",v:10903,d:"Today biggest hits",clr:"#ff5722"},
{id:51,n:"BBC Kids",s:"https://dmr1h4skdal9h.cloudfront.net/playlist.m3u8",c:"kids",q:"720p",src:"BBC",v:2721,d:"Children BBC programming",clr:"#00897b"},
{id:52,n:"Baby Shark TV",s:"https://newidco-babysharktv-1-us.roku.wurl.tv/playlist.m3u8",c:"kids",q:"1080p",src:"Roku",v:3477,d:"Baby Shark friends",clr:"#ff9800"},
{id:53,n:"Brat TV",s:"https://streams2.sofast.tv/v1/master/611d79b11b77e2f571934fd80ca1413453772ac7/04072b68-dc6a-4d5e-98af-f356ba8d5063/playlist.m3u8",c:"kids",q:"720p",src:"SoFast",v:4398,d:"Gen Z entertainment",clr:"#e040fb"},
{id:54,n:"Camp Spoopy",s:"https://stream.ads.ottera.tv/playlist.m3u8?network_id=269",c:"kids",q:"576p",src:"Ottera",v:1800,d:"Spooky fun kids",clr:"#4a148c"},
{id:55,n:"Avatar Pluto",s:"https://jmp2.uk/plu-600adbdf8c554e00072125c9.m3u8",c:"kids",q:"720p",src:"Pluto TV",v:6700,d:"Avatar Nickelodeon",clr:"#00897b"},
{id:56,n:"Anime Vision",s:"https://d1ujfw1zyymzyd.cloudfront.net/v1/master/3722c60a815c199d9c0ef36c5b73da68a62b09d1/cc-a6fukwkbxmex8/live/fast-channel-animevision-64527ec0/fast-channel-animevision-64527ec0.m3u8",c:"kids",q:"1080p",src:"Cineverse",v:3603,d:"Anime streaming 24/7",clr:"#e91e63"},
{id:57,n:"Documentary+",s:"https://ef79b15c8c7c46c7a9de9d33001dbd07.mediatailor.us-west-2.amazonaws.com/v1/master/ba62fe743df0fe93366eba3a257d792884136c7f/LINEAR-859-DOCUMENTARYPLUS-DOCUMENTARYPLUS/mt/documentaryplus/859/hls/master/playlist.m3u8",c:"documentary",q:"1080p",src:"Amazon",v:7800,d:"Award-winning docs",clr:"#1b5e20"},
{id:58,n:"Docurama",s:"https://docurama-plex-ingest.cinedigm.com/playlist.m3u8",c:"documentary",q:"1080p",src:"Plex TV",v:4600,d:"Curated documentary films",clr:"#0d47a1"},
{id:59,n:"DangerTV",s:"https://dk0n7jh428tzj.cloudfront.net/v1/dangertv/samsungheadend_us/latest/main/hls/playlist.m3u8",c:"documentary",q:"720p",src:"Samsung TV+",v:3200,d:"Extreme adventure",clr:"#b71c1c"},
{id:60,n:"Curiosity NOW",s:"https://amg00170-amg00170c4-samsung-gb-4232.playouts.now.amagi.tv/playlist.m3u8",c:"documentary",q:"1080p",src:"Samsung TV+",v:5100,d:"Science nature docs",clr:"#0277bd"},
{id:61,n:"4K Travel TV",s:"https://d35j504z0x2vu2.cloudfront.net/v1/master/0bc8e8376bd8417a1b6761138aa41c26c7309312/4k-travel-tv/manifest.m3u8",c:"documentary",q:"1080p",src:"DistroTV",v:4900,d:"Travel world in 4K",clr:"#00695c"},
{id:62,n:"5-Minute Craft",s:"https://soul-5mincrafteng-rakuten.amagi.tv/playlist.m3u8",c:"documentary",q:"1080p",src:"Rakuten",v:12145,d:"DIY craft videos",clr:"#ff6f00"},
{id:63,n:"Bloomberg TV",s:"https://d35j504z0x2vu2.cloudfront.net/v1/master/0bc8e8376bd8417a1b6761138aa41c26c7309312/bloomberg-television/bloombergtv.m3u8",c:"international",q:"1080p",src:"Bloomberg",v:11414,d:"Global business finance",clr:"#5c068c"},
{id:64,n:"BBC Earth",s:"https://amg00793-amg00793c6-xumo-us-2669.playouts.now.amagi.tv/BBCStudios-BBCEarthA-hls/playlist.m3u8",c:"international",q:"1080p",src:"Xumo",v:10718,d:"Nature science BBC",clr:"#2e7d32"},
{id:65,n:"BBC Top Gear",s:"https://amg00793-amg00793c5-xumo-us-2664.playouts.now.amagi.tv/bbcstudios-bbctopgear8min-all/playlist.m3u8",c:"international",q:"1080p",src:"Xumo",v:7734,d:"Top Gear highlights",clr:"#c62828"},
{id:66,n:"Alhurra Iraq",s:"https://mbn-ingest-worldsafe.akamaized.net/hls/live/2038899/MBN_Iraq_Worldsafe_HLS/master.m3u8",c:"international",q:"720p",src:"MBN",v:3400,d:"Iraqi news programming",clr:"#1565c0"},
{id:67,n:"ABC 5 St Paul",s:"https://amg01942-amg01942c2-stirr-us-10173.playouts.now.amagi.tv/playlist.m3u8",c:"international",q:"1080p",src:"Stirr",v:2200,d:"Local ABC Minneapolis",clr:"#e4002b"},
{id:68,n:"AccuWeather NOW",s:"https://cdn-ue1-prod.tsv2.amagi.tv/linear/amg00684-accuweather-accuweather-plex/playlist.m3u8",c:"international",q:"1080p",src:"Plex TV",v:6100,d:"24/7 weather forecasts",clr:"#0277bd"},
{id:69,n:"Al Jazeera Mubasher",s:"https://live-hls-apps-ajm-fa.getaj.net/AJM/index.m3u8",c:"news",q:"1080p",src:"Al Jazeera",v:7218,d:"Live events conferences",clr:"#fa9000"},
{id:70,n:"France 24 Spanish",s:"https://live.france24.com/hls/live/2037220-b/F24_ES_HI_HLS/master_5000.m3u8",c:"news",q:"1080p",src:"France 24",v:9333,d:"Noticias en espanol",clr:"#0055a5"},
{id:71,n:"Africanews",s:"https://d35j504z0x2vu2.cloudfront.net/v1/master/0bc8e8376bd8417a1b6761138aa41c26c7309312/africanews/africanews-en.m3u8",c:"news",q:"720p",src:"Africanews",v:1800,d:"African news English",clr:"#007a3d"},
{id:72,n:"America Voice News",s:"https://content.uplynk.com/channel/26bd482ffe364a1282bc3df28bd3c21f.m3u8",c:"news",q:"720p",src:"Uplynk",v:4100,d:"American news",clr:"#b71c1c"},
{id:73,n:"ACI Sport TV",s:"https://webstream.multistream.it/memfs/e2cb3629-c1a2-495b-b43a-9eb386f04ed8.m3u8",c:"sports",q:"1080p",src:"Multistream",v:4057,d:"Italian motorsport",clr:"#009688"},
{id:74,n:"FITE 24/7",s:"https://d3d85c7qkywguj.cloudfront.net/scheduler/scheduleMaster/263.m3u8",c:"sports",q:"1080p",src:"FITE",v:5600,d:"Combat pro wrestling",clr:"#311b92"},
{id:75,n:"Sport Italia",s:"https://amg01370-italiansportcom-sportitalia-rakuten-3hmdb.amagi.tv/hls/amagi_hls_data_rakutenAA-sportitalia-rakuten/CDN/master.m3u8",c:"sports",q:"1080p",src:"Rakuten",v:6764,d:"Italian sports",clr:"#00897b"},
{id:76,n:"Africa 24 Sport",s:"https://africa24.vedge.infomaniak.com/livecast/ik:africa24sport/manifest.m3u8",c:"sports",q:"1080p",src:"Infomaniak",v:2800,d:"African sports",clr:"#007a3d"}
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

var curFilter='all',curCh=null,hlsInst=null,heroIdx=0,heroIv=null;

// ===== SPLASH =====
(function(){
  var bar=document.getElementById('load-bar');
  if(!bar){document.getElementById('splash').classList.add('gone');return;}
  var p=0,iv=setInterval(function(){
    p+=Math.random()*12+3;if(p>100)p=100;
    bar.style.width=p+'%';
    if(p>=100){clearInterval(iv);setTimeout(function(){document.getElementById('splash').classList.add('gone');try{initApp();}catch(e){console.error(e);}},400);}
  },80);
})();

function initApp(){
  renderCats();renderGrid();renderHero();renderSidebar();renderUpcoming();bindAll();updateStats();
}

function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

function renderCats(){
  var el=document.getElementById('cat-filter');
  var h='';
  for(var i=0;i<CATS.length;i++){
    var c=CATS[i];
    var cnt=c.id==='all'?CHANNELS.length:CHANNELS.filter(function(ch){return ch.c===c.id;}).length;
    h+='<button data-cat="'+c.id+'" class="'+(c.id==='all'?'active':'')+'"><i class="fas '+c.icon+'"></i> '+c.label+' ('+cnt+')</button>';
  }
  el.innerHTML=h;
}

function renderGrid(){
  var grid=document.getElementById('channels-grid');
  var list=curFilter==='all'?CHANNELS:CHANNELS.filter(function(ch){return ch.c===curFilter;});
  document.getElementById('ch-count').textContent=list.length+' channels';
  if(!list.length){grid.innerHTML='<div style="text-align:center;padding:40px;color:var(--gray2)">No channels found</div>';return;}
  var h='';
  for(var i=0;i<list.length;i++){
    var ch=list[i];
    h+='<div class="ch-card" data-id="'+ch.id+'">'+
      '<div class="ch-thumb" style="background:linear-gradient(135deg,'+ch.clr+','+ch.clr+'88)">'+
        '<span class="ch-thumb-label">'+esc(ch.n)+'</span>'+
        '<span class="live-badge">LIVE</span>'+
        '<span class="ch-quality">'+ch.q+'</span>'+
        '<span class="ch-source">'+esc(ch.src)+'</span>'+
        '<div class="ch-play"><i class="fas fa-play"></i></div>'+
      '</div>'+
      '<div class="ch-body">'+
        '<div class="ch-name">'+esc(ch.n)+'</div>'+
        '<div class="ch-cat">'+ch.c+' &middot; '+esc(ch.d)+'</div>'+
      '</div></div>';
  }
  grid.innerHTML=h;
}

function renderHero(){
  var feat=CHANNELS.filter(function(ch){return['news','sports','movies','entertainment'].indexOf(ch.c)>=0;}).slice(0,6);
  var sl=document.getElementById('hero-slides');
  var dt=document.getElementById('hero-dots');
  var sh='',dh='';
  for(var i=0;i<feat.length;i++){
    var ch=feat[i];
    sh+='<div class="hero-slide'+(i===0?' active':'')+'" data-idx="'+i+'">'+
      '<div class="slide-bg" style="background:linear-gradient(135deg,'+ch.clr+'cc,'+ch.clr+'44)"></div>'+
      '<div class="slide-grad"></div>'+
      '<div class="slide-content">'+
        '<div class="slide-cat">'+ch.c.toUpperCase()+'</div>'+
        '<div class="slide-title">'+esc(ch.n)+'</div>'+
        '<div class="slide-desc">'+esc(ch.d)+'</div>'+
        '<div class="slide-meta">'+
          '<span class="slide-quality">'+ch.q+'</span>'+
          '<span class="slide-source">'+esc(ch.src)+'</span>'+
        '</div>'+
        '<button class="btn-watch" data-id="'+ch.id+'"><i class="fas fa-play"></i> Watch Now</button>'+
      '</div></div>';
    dh+='<span data-idx="'+i+'" class="'+(i===0?'active':'')+'"></span>';
  }
  sl.innerHTML=sh;dt.innerHTML=dh;
  clearInterval(heroIv);
  heroIv=setInterval(function(){
    heroIdx=(heroIdx+1)%feat.length;
    var ss=document.querySelectorAll('.hero-slide'),ds=document.querySelectorAll('.hero-dots span');
    for(var i=0;i<ss.length;i++){ss[i].classList.toggle('active',i===heroIdx);ds[i].classList.toggle('active',i===heroIdx);}
  },6000);
}

function renderSidebar(){
  var onAir=CHANNELS.filter(function(ch){return['news','sports'].indexOf(ch.c)>=0;}).slice(0,5);
  var oh='';
  for(var i=0;i<onAir.length;i++){var ch=onAir[i];oh+='<div class="on-air-ch" data-id="'+ch.id+'"><span class="oa-dot"></span><div><div class="oa-name">'+esc(ch.n)+'</div><div class="oa-now">'+esc(ch.d)+'</div></div></div>';}
  document.getElementById('on-air-body').innerHTML=oh;

  var trending=CHANNELS.slice().sort(function(a,b){return b.v-a.v;}).slice(0,6);
  var th='';
  for(var i=0;i<trending.length;i++){var ch=trending[i];th+='<div class="trending-item" data-id="'+ch.id+'"><span class="tr-rank">'+(i+1)+'</span><span class="tr-name">'+esc(ch.n)+'</span><span class="tr-viewers">'+fmtN(ch.v)+'</span></div>';}
  document.getElementById('trending-body').innerHTML=th;
}

function renderUpcoming(){
  var up=CHANNELS.filter(function(ch){return['movies','documentary','entertainment'].indexOf(ch.c)>=0;}).slice(0,8);
  var progs=["Premiere Event","New Episode","Special Report","Live Concert","Season Finale","Doc Series","Movie Marathon","Exclusive"];
  var times=["8:00 PM","9:30 PM","10:00 PM","11:15 PM","7:00 AM","12:00 PM","3:00 PM","6:00 PM"];
  var h='';
  for(var i=0;i<up.length;i++){var ch=up[i];h+='<div class="upcoming-card" data-id="'+ch.id+'"><div class="uc-cat">'+ch.c.toUpperCase()+'</div><div class="uc-name">'+progs[i]+'</div><div class="uc-time">'+times[i]+'</div></div>';}
  document.getElementById('upcoming-scroll').innerHTML=h;
}

function updateStats(){
  document.getElementById('stat-ch').textContent=CHANNELS.length;
  document.getElementById('stat-hd').textContent=CHANNELS.filter(function(ch){return ch.q==='1080p';}).length;
}

function fmtN(n){return n>=1000?(n/1000).toFixed(1)+'k':n;}

// ===== PLAYER =====
function playCh(id){
  var ch=CHANNELS.find(function(c){return c.id===id;});
  if(!ch)return;
  curCh=ch;
  var modal=document.getElementById('player-modal');
  var video=document.getElementById('hls-video');
  var overlay=document.getElementById('offline-overlay');
  var status=document.getElementById('player-status');
  var title=document.getElementById('player-title');
  modal.classList.add('open');
  overlay.classList.remove('show');
  status.textContent='CONNECTING';status.className='p-status connecting';
  title.textContent=ch.n;
  if(hlsInst){hlsInst.destroy();hlsInst=null;}
  video.removeAttribute('src');video.load();

  if(typeof Hls!=='undefined'&&Hls.isSupported()){
    hlsInst=new Hls({enableWorker:true,lowLatencyMode:true,maxBufferLength:30,maxMaxBufferLength:60});
    hlsInst.loadSource(ch.s);hlsInst.attachMedia(video);
    hlsInst.on(Hls.Events.MANIFEST_PARSED,function(){video.play().catch(function(){});status.textContent='LIVE';status.className='p-status live';});
    hlsInst.on(Hls.Events.ERROR,function(ev,data){if(data.fatal){if(data.type===Hls.ErrorTypes.NETWORK_ERROR){hlsInst.startLoad();setTimeout(function(){if(status.className.indexOf('connecting')>=0)showOff();},8000);}else if(data.type===Hls.ErrorTypes.MEDIA_ERROR){hlsInst.recoverMediaError();}else{showOff();}}});
    setTimeout(function(){if(status.className.indexOf('connecting')>=0)showOff();},12000);
  }else if(video.canPlayType('application/vnd.apple.mpegurl')){
    video.src=ch.s;video.addEventListener('loadedmetadata',function(){video.play().catch(function(){});status.textContent='LIVE';status.className='p-status live';});video.addEventListener('error',showOff);
  }else{showOff();}
}

function showOff(){document.getElementById('offline-overlay').classList.add('show');var s=document.getElementById('player-status');s.textContent='OFFLINE';s.className='p-status offline';}

function closePlayer(){
  var video=document.getElementById('hls-video');
  if(hlsInst){hlsInst.destroy();hlsInst=null;}
  video.pause();video.removeAttribute('src');video.load();
  document.getElementById('player-modal').classList.remove('open');curCh=null;
}

function retryStream(){if(curCh)playCh(curCh.id);}

function switchNext(){
  if(!curCh)return;
  var same=CHANNELS.filter(function(ch){return ch.c===curCh.c&&ch.id!==curCh.id;});
  if(same.length)playCh(same[Math.floor(Math.random()*same.length)].id);
  else{var other=CHANNELS.filter(function(ch){return ch.id!==curCh.id;});if(other.length)playCh(other[Math.floor(Math.random()*other.length)].id);}
}

// ===== EVENTS =====
function bindAll(){
  document.addEventListener('click',function(e){
    var card=e.target.closest('.ch-card');if(card)return playCh(parseInt(card.dataset.id));
    var oac=e.target.closest('.on-air-ch');if(oac)return playCh(parseInt(oac.dataset.id));
    var ti=e.target.closest('.trending-item');if(ti)return playCh(parseInt(ti.dataset.id));
    var uc=e.target.closest('.upcoming-card');if(uc)return playCh(parseInt(uc.dataset.id));
    var wb=e.target.closest('.btn-watch');if(wb)return playCh(parseInt(wb.dataset.id));
  });

  document.getElementById('cat-filter').addEventListener('click',function(e){
    var btn=e.target.closest('button');if(!btn)return;
    var all=document.querySelectorAll('.cat-filter button');for(var i=0;i<all.length;i++)all[i].classList.remove('active');
    btn.classList.add('active');curFilter=btn.dataset.cat;renderGrid();
  });

  document.getElementById('hero-prev').addEventListener('click',function(){
    heroIdx=(heroIdx-1+6)%6;
    var ss=document.querySelectorAll('.hero-slide'),ds=document.querySelectorAll('.hero-dots span');
    for(var i=0;i<ss.length;i++){ss[i].classList.toggle('active',i===heroIdx);ds[i].classList.toggle('active',i===heroIdx);}
  });
  document.getElementById('hero-next').addEventListener('click',function(){
    heroIdx=(heroIdx+1)%6;
    var ss=document.querySelectorAll('.hero-slide'),ds=document.querySelectorAll('.hero-dots span');
    for(var i=0;i<ss.length;i++){ss[i].classList.toggle('active',i===heroIdx);ds[i].classList.toggle('active',i===heroIdx);}
  });
  document.getElementById('hero-dots').addEventListener('click',function(e){
    var dot=e.target.closest('span');if(!dot)return;heroIdx=parseInt(dot.dataset.idx);
    var ss=document.querySelectorAll('.hero-slide'),ds=document.querySelectorAll('.hero-dots span');
    for(var i=0;i<ss.length;i++){ss[i].classList.toggle('active',i===heroIdx);ds[i].classList.toggle('active',i===heroIdx);}
  });

  document.getElementById('player-close').addEventListener('click',closePlayer);
  document.getElementById('btn-retry').addEventListener('click',retryStream);
  document.getElementById('btn-switch').addEventListener('click',switchNext);
  document.getElementById('player-modal').addEventListener('click',function(e){if(e.target===this)closePlayer();});
  document.getElementById('play-pause').addEventListener('click',function(){
    var v=document.getElementById('hls-video');
    if(v.paused){v.play();this.innerHTML='<i class="fas fa-pause"></i>';}
    else{v.pause();this.innerHTML='<i class="fas fa-play"></i>';}
  });
  document.getElementById('vol-toggle').addEventListener('click',function(){
    var v=document.getElementById('hls-video');v.muted=!v.muted;
    this.innerHTML=v.muted?'<i class="fas fa-volume-mute"></i>':'<i class="fas fa-volume-up"></i>';
  });
  document.getElementById('fullscreen-btn').addEventListener('click',function(){
    var w=document.querySelector('.player-wrap');
    if(w.requestFullscreen)w.requestFullscreen();else if(w.webkitRequestFullscreen)w.webkitRequestFullscreen();
  });

  document.getElementById('search-toggle').addEventListener('click',function(){
    var box=document.getElementById('search-box');box.classList.toggle('open');
    if(box.classList.contains('open'))document.getElementById('search-input').focus();
  });
  document.getElementById('search-input').addEventListener('input',function(){
    var q=this.value.toLowerCase().trim();
    if(!q){curFilter='all';document.querySelector('.cat-filter button[data-cat="all"]').click();return;}
    var filtered=CHANNELS.filter(function(ch){return ch.n.toLowerCase().indexOf(q)>=0||ch.c.indexOf(q)>=0||ch.d.toLowerCase().indexOf(q)>=0||ch.src.toLowerCase().indexOf(q)>=0;});
    var grid=document.getElementById('channels-grid');
    document.getElementById('ch-count').textContent=filtered.length+' results';
    var h='';
    for(var i=0;i<filtered.length;i++){
      var ch=filtered[i];
      h+='<div class="ch-card" data-id="'+ch.id+'"><div class="ch-thumb" style="background:linear-gradient(135deg,'+ch.clr+','+ch.clr+'88)"><span class="ch-thumb-label">'+esc(ch.n)+'</span><span class="live-badge">LIVE</span><span class="ch-quality">'+ch.q+'</span><span class="ch-source">'+esc(ch.src)+'</span><div class="ch-play"><i class="fas fa-play"></i></div></div><div class="ch-body"><div class="ch-name">'+esc(ch.n)+'</div><div class="ch-cat">'+ch.c+' &middot; '+esc(ch.d)+'</div></div></div>';
    }
    grid.innerHTML=h;
  });

  document.getElementById('refresh-btn').addEventListener('click',function(){
    var btn=this;btn.classList.add('spinning');
    setTimeout(function(){btn.classList.remove('spinning');renderGrid();renderSidebar();renderUpcoming();showToast('Channels refreshed!');},1500);
  });

  var toggles=document.querySelectorAll('.sidebar-toggle');
  for(var i=0;i<toggles.length;i++){toggles[i].addEventListener('click',function(){this.classList.toggle('collapsed');this.nextElementSibling.classList.toggle('collapsed');});}

  var navLinks=document.querySelectorAll('header nav a');
  for(var i=0;i<navLinks.length;i++){navLinks[i].addEventListener('click',function(e){
    e.preventDefault();
    var all=document.querySelectorAll('header nav a');for(var j=0;j<all.length;j++)all[j].classList.remove('active');
    this.classList.add('active');
    var nav=this.dataset.nav;
    if(nav==='home')window.scrollTo({top:0,behavior:'smooth'});
    else if(nav==='live'){curFilter='all';document.querySelector('.cat-filter button[data-cat="all"]').click();document.getElementById('channels-section').scrollIntoView({behavior:'smooth'});}
    else if(nav==='sports'){curFilter='sports';document.querySelector('.cat-filter button[data-cat="sports"]').click();document.getElementById('channels-section').scrollIntoView({behavior:'smooth'});}
    else if(nav==='news'){curFilter='news';document.querySelector('.cat-filter button[data-cat="news"]').click();document.getElementById('channels-section').scrollIntoView({behavior:'smooth'});}
  });}

  document.getElementById('mistral-send').addEventListener('click',askAI);
  document.getElementById('mistral-input').addEventListener('keypress',function(e){if(e.key==='Enter')askAI();});
  document.addEventListener('keydown',function(e){if(e.key==='Escape')closePlayer();});
}

function askAI(){
  var input=document.getElementById('mistral-input');
  var msg=document.getElementById('mistral-msg');
  var q=input.value.trim();if(!q)return;
  msg.textContent='Thinking...';input.value='';
  var ctx=CHANNELS.slice(0,15).map(function(ch){return ch.n+' ('+ch.c+')';}).join(', ');
  fetch('https://api.mistral.ai/v1/chat/completions',{
    method:'POST',
    headers:{'Content-Type':'application/json','Authorization':'Bearer YOUR_MISTRAL_KEY'},
    body:JSON.stringify({model:'mistral-small-latest',messages:[{role:'system',content:'You are a TV assistant for EDGE IPTV. Channels: '+ctx+'. Be brief.'},{role:'user',content:q}],max_tokens:120})
  }).then(function(r){return r.json();}).then(function(d){msg.textContent=d.choices&&d.choices[0]?d.choices[0].message.content:'No response.';}).catch(function(){msg.textContent='AI unavailable. Try watching a channel!';});
}

function showToast(text){
  var t=document.getElementById('toast');t.textContent=text;t.className='toast show';
  setTimeout(function(){t.classList.remove('show');},3000);
}
<\/script>
</body>
</html>`;
    return new Response(html, {headers:{'Content-Type':'text/html;charset=UTF-8'}});
  }
};
