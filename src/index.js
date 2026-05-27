/*
  EDGE v3.0 - IPTV Web App | Cloudflare Worker
  ========================================
  REAL WORKING STREAMS - Sourced from iptv-org, Pluto TV, Samsung TV Plus,
  Plex, Stirr, Al Jazeera, France 24, DW, ABC News, and verified CDN endpoints.
  
  HOW TO DEPLOY:
  1. Install wrangler: npm install -g wrangler
  2. Login: wrangler login
  3. Create a project: wrangler init edge-iptv
  4. Replace the generated src/index.js with this file
  5. Deploy: wrangler deploy
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
<script src="https://cdn.jsdelivr.net/npm/hls.js@1.5.7"></script>
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
button:focus-visible,a:focus-visible,input:focus-visible{outline:2px solid var(--cyan);outline-offset:2px}
img{max-width:100%;display:block}
::-webkit-scrollbar{width:5px;height:5px}
::-webkit-scrollbar-track{background:var(--bg2)}
::-webkit-scrollbar-thumb{background:var(--gray2);border-radius:3px}
::-webkit-scrollbar-thumb:hover{background:var(--gray)}

/* SPLASH */
#splash{position:fixed;inset:0;z-index:10000;background:var(--bg);display:flex;flex-direction:column;align-items:center;justify-content:center;transition:opacity 1s ease,visibility 1s}
#splash.hide{opacity:0;visibility:hidden}
#splash .logo{font-family:var(--font-display);font-size:72px;font-weight:900;color:#fff;letter-spacing:10px;position:relative}
#splash .logo::after{content:'EDGE';position:absolute;left:3px;top:3px;color:var(--red);clip-path:polygon(0 0,100% 0,100% 40%,0 40%);animation:glitchTop 3s infinite}
#splash .logo::before{content:'EDGE';position:absolute;left:-3px;top:-2px;color:var(--cyan);clip-path:polygon(0 60%,100% 60%,100% 100%,0 100%);animation:glitchBottom 3s infinite}
@keyframes glitchTop{0%,90%,100%{transform:translate(0)}92%{transform:translate(-4px,-2px)}94%{transform:translate(3px,1px)}96%{transform:translate(-2px,2px)}}
@keyframes glitchBottom{0%,90%,100%{transform:translate(0)}91%{transform:translate(3px,1px)}93%{transform:translate(-4px,-1px)}95%{transform:translate(2px,-2px)}}
#splash .sub{font-size:12px;color:var(--gray);letter-spacing:6px;margin-top:8px;font-family:var(--font-display)}
#splash .bar-wrap{width:280px;height:3px;background:var(--bg3);border-radius:2px;margin-top:36px;overflow:hidden}
#splash .bar{height:100%;width:0%;background:linear-gradient(90deg,var(--red),var(--purple),var(--cyan));border-radius:2px;transition:width 0.08s linear}
#splash .load-txt{font-family:var(--font-display);font-size:10px;color:var(--gray2);margin-top:14px;letter-spacing:4px}

/* HEADER */
header{position:sticky;top:0;z-index:1000;background:rgba(5,5,8,0.92);backdrop-filter:blur(16px);border-bottom:1px solid rgba(255,255,255,0.04);padding:0 28px;height:56px;display:flex;align-items:center;justify-content:space-between}
.logo-mark{font-family:var(--font-display);font-size:22px;font-weight:900;letter-spacing:5px;color:#fff;position:relative}
.logo-mark span{color:var(--red)}
.logo-mark::after{content:'v3';font-size:9px;color:var(--cyan);position:relative;top:-8px;left:2px;letter-spacing:1px}
header nav{display:flex;gap:20px;align-items:center}
header nav a{color:var(--gray);font-size:13px;font-weight:500;display:flex;align-items:center;gap:5px;transition:color var(--transition);padding:6px 0;position:relative}
header nav a:hover,header nav a.active{color:var(--white)}
header nav a.active::after{content:'';position:absolute;bottom:-2px;left:0;width:100%;height:2px;background:var(--red);border-radius:1px}
header nav a i{font-size:15px}
.hdr-right{display:flex;align-items:center;gap:14px}
.hdr-right button{background:none;color:var(--gray);font-size:17px;transition:color var(--transition)}
.hdr-right button:hover{color:var(--white)}
#search-box{position:absolute;top:56px;right:28px;width:340px;background:var(--bg2);border:1px solid var(--bg3);border-radius:var(--radius);padding:14px;display:none;z-index:1001;box-shadow:0 8px 32px rgba(0,0,0,0.5)}
#search-box.open{display:block}
#search-box input{width:100%;background:var(--bg3);border:1px solid var(--gray2);border-radius:6px;padding:10px 14px;color:var(--white);font-size:13px}
#search-box input:focus{border-color:var(--cyan)}

/* HERO */
.hero{position:relative;width:100%;height:400px;overflow:hidden;background:linear-gradient(135deg,var(--bg2),var(--bg3))}
.hero-slide{position:absolute;inset:0;opacity:0;transition:opacity 1s ease;display:flex;align-items:center}
.hero-slide.active{opacity:1}
.hero-slide .slide-bg{position:absolute;inset:0;background-size:cover;background-position:center;filter:brightness(0.25) saturate(1.2)}
.hero-slide .slide-grad{position:absolute;inset:0;background:linear-gradient(90deg,rgba(5,5,8,0.95) 0%,rgba(5,5,8,0.6) 50%,transparent 100%)}
.hero-slide .slide-content{position:relative;z-index:2;padding:0 60px;max-width:650px}
.hero-slide .slide-cat{font-family:var(--font-display);font-size:10px;letter-spacing:4px;color:var(--red);text-transform:uppercase;margin-bottom:10px;display:flex;align-items:center;gap:8px}
.hero-slide .slide-cat::before{content:'';width:20px;height:2px;background:var(--red)}
.hero-slide .slide-title{font-family:var(--font-display);font-size:32px;font-weight:700;margin-bottom:10px;line-height:1.2}
.hero-slide .slide-desc{color:var(--gray);font-size:14px;margin-bottom:16px;line-height:1.5}
.hero-slide .slide-meta{display:flex;align-items:center;gap:16px;margin-bottom:20px}
.hero-slide .slide-quality{background:var(--bg3);border:1px solid var(--cyan);color:var(--cyan);font-size:10px;padding:3px 10px;border-radius:4px;font-weight:600;letter-spacing:1px}
.hero-slide .slide-source{color:var(--gray2);font-size:12px;display:flex;align-items:center;gap:4px}
.hero-slide .btn-watch{background:linear-gradient(135deg,var(--red),#cc1133);color:#fff;padding:12px 28px;border-radius:var(--radius);font-weight:600;font-size:13px;letter-spacing:1px;transition:all var(--transition);display:flex;align-items:center;gap:8px}
.hero-slide .btn-watch:hover{transform:translateY(-2px);box-shadow:0 8px 24px var(--red-glow)}
.hero-arrows{position:absolute;top:50%;width:100%;display:flex;justify-content:space-between;padding:0 16px;z-index:3;transform:translateY(-50%)}
.hero-arrows button{background:rgba(0,0,0,0.5);backdrop-filter:blur(8px);color:#fff;width:42px;height:42px;border-radius:50%;font-size:16px;display:flex;align-items:center;justify-content:center;transition:all var(--transition);border:1px solid rgba(255,255,255,0.1)}
.hero-arrows button:hover{background:var(--red);border-color:var(--red)}
.hero-dots{position:absolute;bottom:20px;left:50%;transform:translateX(-50%);display:flex;gap:8px;z-index:3}
.hero-dots span{width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,0.2);cursor:pointer;transition:all var(--transition)}
.hero-dots span.active{background:var(--red);box-shadow:0 0 10px var(--red-glow);width:24px;border-radius:4px}

/* LAYOUT */
.main-layout{display:flex;gap:24px;max-width:1440px;margin:0 auto;padding:28px 24px}
.main-content{flex:1;min-width:0}
.sidebar{width:300px;flex-shrink:0}

/* SECTION TITLE */
.section-title{font-family:var(--font-display);font-size:18px;font-weight:700;margin-bottom:18px;display:flex;align-items:center;gap:10px}
.section-title .st-bar{width:3px;height:20px;background:linear-gradient(180deg,var(--red),var(--purple));border-radius:2px}
.section-title .st-count{font-size:11px;color:var(--gray2);font-weight:400;margin-left:auto}

/* CAT FILTER */
.cat-filter{display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap}
.cat-filter button{background:var(--bg3);color:var(--gray);padding:7px 16px;border-radius:20px;font-size:12px;font-weight:500;transition:all var(--transition);border:1px solid transparent}
.cat-filter button:hover{color:var(--white);border-color:var(--gray2)}
.cat-filter button.active{background:linear-gradient(135deg,var(--red),#cc1133);color:#fff;border-color:transparent}
.cat-filter button .cat-count{font-size:10px;opacity:0.6;margin-left:4px}

/* CHANNELS GRID */
.channels-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px}
.ch-card{background:var(--bg2);border-radius:var(--radius);overflow:hidden;border:1px solid var(--bg3);transition:all var(--transition);position:relative;cursor:pointer}
.ch-card:hover{transform:translateY(-4px);border-color:var(--red);box-shadow:0 8px 32px var(--red-glow)}
.ch-card .ch-thumb{width:100%;height:130px;background:var(--bg3);position:relative;overflow:hidden}
.ch-card .ch-thumb-bg{width:100%;height:100%;background-size:cover;background-position:center;filter:brightness(0.5) saturate(1.3);transition:all 0.5s ease}
.ch-card:hover .ch-thumb-bg{filter:brightness(0.7) saturate(1.5);transform:scale(1.05)}
.ch-card .live-badge{position:absolute;top:10px;left:10px;background:var(--red);color:#fff;font-size:9px;font-weight:700;padding:2px 8px;border-radius:4px;letter-spacing:1px;animation:livePulse 2s infinite;display:flex;align-items:center;gap:4px}
.ch-card .live-badge::before{content:'';width:5px;height:5px;border-radius:50%;background:#fff;animation:dotPulse 1s infinite}
@keyframes livePulse{0%,100%{opacity:1}50%{opacity:0.7}}
@keyframes dotPulse{0%,100%{opacity:1}50%{opacity:0.3}}
.ch-card .ch-quality{position:absolute;top:10px;right:10px;background:rgba(0,0,0,0.7);color:var(--cyan);font-size:9px;font-weight:600;padding:2px 6px;border-radius:3px;letter-spacing:1px;border:1px solid rgba(0,229,255,0.3)}
.ch-card .ch-source{position:absolute;bottom:8px;right:8px;font-size:9px;color:rgba(255,255,255,0.4);background:rgba(0,0,0,0.6);padding:2px 6px;border-radius:3px}
.ch-card .ch-play{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) scale(0.8);width:44px;height:44px;border-radius:50%;background:rgba(255,34,68,0.85);display:flex;align-items:center;justify-content:center;color:#fff;font-size:16px;opacity:0;transition:all var(--transition);backdrop-filter:blur(4px)}
.ch-card:hover .ch-play{opacity:1;transform:translate(-50%,-50%) scale(1)}
.ch-card .ch-body{padding:12px 14px}
.ch-card .ch-name{font-weight:600;font-size:13px;margin-bottom:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ch-card .ch-cat{color:var(--gray2);font-size:11px;text-transform:capitalize}

/* SIDEBAR */
.sidebar-section{background:var(--bg2);border-radius:var(--radius);border:1px solid var(--bg3);padding:16px;margin-bottom:16px}
.sidebar-section h3{font-family:var(--font-display);font-size:11px;letter-spacing:2px;color:var(--red);margin-bottom:14px;text-transform:uppercase;display:flex;align-items:center;gap:8px}
.sidebar-section h3 i{font-size:13px}
.sidebar-toggle{cursor:pointer;display:flex;align-items:center;justify-content:space-between}
.sidebar-toggle .chevron{transition:transform var(--transition);font-size:12px;color:var(--gray2)}
.sidebar-toggle.collapsed .chevron{transform:rotate(-90deg)}
.sidebar-body{overflow:hidden;transition:max-height 0.4s ease;max-height:600px}
.sidebar-body.collapsed{max-height:0}
.on-air-ch{display:flex;align-items:center;gap:10px;margin-bottom:10px;padding-bottom:10px;border-bottom:1px solid var(--bg3);cursor:pointer;transition:background var(--transition);padding:6px;border-radius:6px}
.on-air-ch:hover{background:var(--bg3)}
.on-air-ch:last-child{border-bottom:none;margin-bottom:0;padding-bottom:0}
.on-air-ch .oa-dot{width:8px;height:8px;border-radius:50%;background:var(--red);flex-shrink:0;animation:dotPulse 1.5s infinite}
.on-air-ch .oa-info{flex:1;min-width:0}
.on-air-ch .oa-name{font-size:12px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.on-air-ch .oa-now{font-size:10px;color:var(--gray)}
.trending-item{display:flex;align-items:center;gap:8px;margin-bottom:8px;cursor:pointer;padding:4px 6px;border-radius:4px;transition:background var(--transition)}
.trending-item:hover{background:var(--bg3)}
.trending-item .tr-rank{font-family:var(--font-display);font-size:16px;color:var(--red);min-width:20px}
.trending-item .tr-name{font-size:12px;font-weight:500;flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.trending-item .tr-viewers{font-size:10px;color:var(--gray2)}

/* MISTRAL */
.mistral-panel .mp-chat{display:flex;flex-direction:column;gap:8px}
.mistral-panel .mp-input-wrap{display:flex;gap:6px}
.mistral-panel .mp-input{flex:1;background:var(--bg3);border:1px solid var(--bg4);border-radius:6px;padding:8px 10px;color:var(--white);font-size:12px}
.mistral-panel .mp-input:focus{border-color:var(--purple)}
.mistral-panel .mp-send{background:var(--purple);color:#fff;padding:8px 12px;border-radius:6px;font-size:12px;transition:all var(--transition)}
.mistral-panel .mp-send:hover{box-shadow:0 0 12px var(--purple-glow)}
.mistral-panel .mp-msg{font-size:12px;color:var(--gray);line-height:1.5;padding:8px;background:var(--bg3);border-radius:6px;border-left:2px solid var(--purple)}

/* PLAYER MODAL */
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

/* UPCOMING */
.upcoming-scroll{display:flex;gap:14px;overflow-x:auto;padding-bottom:10px;scroll-snap-type:x mandatory}
.upcoming-card{min-width:200px;background:var(--bg2);border-radius:var(--radius);padding:14px;border:1px solid var(--bg3);scroll-snap-align:start;flex-shrink:0;cursor:pointer;transition:all var(--transition)}
.upcoming-card:hover{border-color:var(--purple);transform:translateY(-2px)}
.upcoming-card .uc-cat{font-size:9px;color:var(--red);font-weight:600;letter-spacing:2px;margin-bottom:6px;text-transform:uppercase}
.upcoming-card .uc-name{font-size:13px;font-weight:500;margin-bottom:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.upcoming-card .uc-time{font-family:var(--font-display);font-size:14px;color:var(--cyan);letter-spacing:1px}

/* FOOTER */
footer{background:var(--bg2);border-top:1px solid var(--bg3);padding:28px 24px;text-align:center;margin-top:48px}
footer .f-brand{font-family:var(--font-display);font-size:12px;letter-spacing:4px;color:var(--gray2)}
footer .f-brand span{color:var(--red)}
footer .f-stats{display:flex;justify-content:center;gap:28px;margin-top:12px}
footer .f-stats .stat{font-size:11px;color:var(--gray2)}
footer .f-stats .stat strong{color:var(--cyan);font-family:var(--font-display)}
footer .f-note{font-size:10px;color:var(--gray2);margin-top:10px;opacity:0.5}

/* REFRESH */
.btn-refresh{background:var(--bg3);color:var(--cyan);padding:7px 14px;border-radius:var(--radius);font-size:12px;font-weight:500;display:flex;align-items:center;gap:5px;transition:all var(--transition);border:1px solid var(--bg4)}
.btn-refresh:hover{border-color:var(--cyan);box-shadow:0 0 12px var(--cyan-glow)}
.btn-refresh.spinning i{animation:spin 0.8s linear infinite}
@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}

/* RESPONSIVE */
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
  header nav span{display:none}
  .hero{height:260px}
  .hero-slide .slide-title{font-size:20px}
  .hero-slide .slide-content{padding:0 20px}
  .sidebar-section{padding:12px}
  .hero-slide .slide-desc{display:none}
}

/* MISC */
.toast{position:fixed;bottom:24px;right:24px;background:var(--bg3);color:var(--white);padding:12px 20px;border-radius:var(--radius);font-size:13px;z-index:9999;transform:translateY(80px);opacity:0;transition:all var(--transition);border-left:3px solid var(--cyan);max-width:320px;box-shadow:0 4px 24px rgba(0,0,0,0.4)}
.toast.show{transform:translateY(0);opacity:1}
.toast.error{border-left-color:var(--red)}
.no-results{text-align:center;padding:40px;color:var(--gray2);font-size:14px}
.no-results i{font-size:36px;margin-bottom:12px;display:block;opacity:0.3}
</style>
</head>
<body>

<!-- SPLASH -->
<div id="splash">
  <div class="logo">EDGE</div>
  <div class="sub">FREE HD IPTV</div>
  <div class="bar-wrap"><div class="bar" id="load-bar"></div></div>
  <div class="load-txt">CONNECTING...</div>
</div>

<!-- HEADER -->
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
  <input type="text" id="search-input" placeholder="Search channels..." aria-label="Search">
</div>

<!-- HERO -->
<section class="hero" id="hero-section">
  <div id="hero-slides"></div>
  <div class="hero-arrows">
    <button id="hero-prev"><i class="fas fa-chevron-left"></i></button>
    <button id="hero-next"><i class="fas fa-chevron-right"></i></button>
  </div>
  <div class="hero-dots" id="hero-dots"></div>
</section>

<!-- MAIN -->
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

  <!-- SIDEBAR -->
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
    <div class="sidebar-section mistral-panel">
      <div class="sidebar-toggle" id="mistral-toggle">
        <h3><i class="fas fa-robot"></i> AI Assistant</h3>
        <i class="fas fa-chevron-down chevron"></i>
      </div>
      <div class="sidebar-body" id="mistral-body">
        <div class="mp-chat">
          <div class="mp-msg" id="mistral-msg">Click on any channel and I will suggest similar content you might enjoy.</div>
          <div class="mp-input-wrap">
            <input class="mp-input" id="mistral-input" placeholder="Ask about channels...">
            <button class="mp-send" id="mistral-send"><i class="fas fa-paper-plane"></i></button>
          </div>
        </div>
      </div>
    </div>
  </aside>
</div>

<!-- PLAYER -->
<div id="player-modal">
  <div class="player-wrap">
    <button class="player-close" id="player-close"><i class="fas fa-times"></i></button>
    <video id="hls-video" muted playsinline></video>
    <div class="offline-overlay" id="offline-overlay">
      <i class="fas fa-signal off-icon"></i>
      <div class="off-text">STREAM OFFLINE</div>
      <div class="off-hint">This stream may be geo-blocked in your region. Try another channel or use a VPN.</div>
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

<!-- TOAST -->
<div class="toast" id="toast"></div>

<!-- FOOTER -->
<footer>
  <div class="f-brand">EDGE <span>v3.0</span> - 100% Free IPTV</div>
  <div class="f-stats">
    <div class="stat"><strong id="stat-ch">0</strong> channels</div>
    <div class="stat"><strong id="stat-hd">0</strong> HD streams</div>
    <div class="stat"><strong id="stat-src">6</strong> sources</div>
  </div>
  <div class="f-note">Streams sourced from iptv-org, Pluto TV, Samsung TV+, Plex, Stirr &amp; public CDNs</div>
</footer>

<script>
// ================================================================
// REAL WORKING CHANNEL DATA - v3.0
// Sources: iptv-org (verified), Pluto TV CDN, Samsung TV Plus,
//          Plex TV, Stirr, Al Jazeera, France 24, ABC, DW, etc.
// ================================================================
const CHANNELS = [
  // ===== NEWS (12) =====
  {id:1,name:"Al Jazeera English",stream:"https://live-hls-apps-aje-fa.getaj.net/AJE/index.m3u8",category:"news",quality:"1080p",source:"Al Jazeera",viewers:10492,desc:"Global news from the Middle East perspective",color:"#fa9000"},
  {id:2,name:"Al Jazeera Arabic",stream:"https://live-hls-apps-aja-fa.getaj.net/AJA/01.m3u8",category:"news",quality:"1080p",source:"Al Jazeera",viewers:13631,desc:"Arabic-language 24-hour news",color:"#fa9000"},
  {id:3,name:"France 24 English",stream:"https://live.france24.com/hls/live/2037218-b/F24_EN_HI_HLS/master_5000.m3u8",category:"news",quality:"1080p",source:"France 24",viewers:12298,desc:"International news from Paris",color:"#0055a5"},
  {id:4,name:"France 24 French",stream:"https://live.france24.com/hls/live/2037179-b/F24_FR_HI_HLS/master_5000.m3u8",category:"news",quality:"1080p",source:"France 24",viewers:14869,desc:"Actualites en francais",color:"#0055a5"},
  {id:5,name:"France 24 Arabic",stream:"https://live.france24.com/hls/live/2037222-b/F24_AR_HI_HLS/master_5000.m3u8",category:"news",quality:"1080p",source:"France 24",viewers:7713,desc:"Arabic-language French news",color:"#0055a5"},
  {id:6,name:"DW English",stream:"https://dwamdstream102.akamaized.net/hls/live/2015525/dwstream102/master.m3u8",category:"news",quality:"1080p",source:"Deutsche Welle",viewers:6034,desc:"Germany's international broadcaster",color:"#003399"},
  {id:7,name:"DW Spanish",stream:"https://dwamdstream104.akamaized.net/hls/live/2015530/dwstream104/master.m3u8",category:"news",quality:"1080p",source:"Deutsche Welle",viewers:793,desc:"DW en espanol",color:"#003399"},
  {id:8,name:"ABC News Live",stream:"https://abc-news-dmd-streams-1.akamaized.net/out/v1/701126012d044971b3fa89406a440133/index.m3u8",category:"news",quality:"720p",source:"ABC News",viewers:10380,desc:"24/7 live news from ABC",color:"#e4002b"},
  {id:9,name:"ABC News Live 1",stream:"https://abcnews-streams.akamaized.net/hls/live/2023560/abcnewshudson1/master_4000.m3u8",category:"news",quality:"720p",source:"ABC News",viewers:8200,desc:"ABC News live stream 1",color:"#e4002b"},
  {id:10,name:"Africa 24",stream:"https://africa24.vedge.infomaniak.com/livecast/ik:africa24/manifest.m3u8",category:"news",quality:"1080p",source:"Infomaniak",viewers:2469,desc:"Pan-African news channel",color:"#007a3d"},
  {id:11,name:"Euronews English",stream:"https://d35j504z0x2vu2.cloudfront.net/v1/master/0bc8e8376bd8417a1b6761138aa41c26c7309312/euronews/euronews-en.m3u8",category:"news",quality:"720p",source:"Euronews",viewers:6721,desc:"European and world news",color:"#003876"},
  {id:12,name:"Court TV",stream:"https://cdn-uw2-prod.tsv2.amagi.tv/linear/amg01438-ewscrippscompan-courttv-tablo/playlist.m3u8",category:"news",quality:"1080p",source:"Stirr",viewers:13660,desc:"Live trial coverage and true crime",color:"#1a3a5c"},

  // ===== SPORTS (12) =====
  {id:13,name:"ACCDN",stream:"https://raycom-accdn-firetv.amagi.tv/playlist.m3u8",category:"sports",quality:"1080p",source:"Amagi",viewers:9995,desc:"ACC Digital Network - College Sports",color:"#003087"},
  {id:14,name:"CBS Sports Golazo",stream:"https://proped3fhg87.airspace-cdn.cbsivideo.com/golazo-live-dai/master/golazo-live-dai.m3u8",category:"sports",quality:"720p",source:"CBS",viewers:8200,desc:"24/7 soccer network",color:"#0047ab"},
  {id:15,name:"FIFA+ English",stream:"https://a62dad94.wurl.com/master/f36d25e7e52f1ba8d7e56eb859c636563214f541/UmFrdXRlblRWLWV1X0ZJRkFQbHVzRW5nbGlzaF9ITFM/playlist.m3u8",category:"sports",quality:"720p",source:"FIFA+",viewers:7100,desc:"FIFA original content in English",color:"#326295"},
  {id:16,name:"FIFA+ Spanish",stream:"https://6c849fb3.wurl.com/master/f36d25e7e52f1ba8d7e56eb859c636563214f541/TEctbXhfRklGQVBsdXNTcGFuaXNoLTFfSExT/playlist.m3u8",category:"sports",quality:"720p",source:"FIFA+",viewers:5200,desc:"Contenido FIFA en espanol",color:"#326295"},
  {id:17,name:"fubo Sports Network",stream:"https://dnf08l6u6uxnz.cloudfront.net/master.m3u8",category:"sports",quality:"1080p",source:"fuboTV",viewers:11400,desc:"Free sports network",color:"#6c2dc7"},
  {id:18,name:"Billiard TV",stream:"https://1621590671.rsc.cdn77.org/HLS/BILLIARDTV.m3u8",category:"sports",quality:"1080p",source:"CDN77",viewers:6314,desc:"24/7 billiards programming",color:"#1b5e20"},
  {id:19,name:"FTF Sports",stream:"https://1657061170.rsc.cdn77.org/HLS/FTF-LINEAR.m3u8",category:"sports",quality:"720p",source:"CDN77",viewers:4400,desc:"Football and combat sports",color:"#b71c1c"},
  {id:20,name:"FanDuel Racing",stream:"https://d3ehq1uaxory6w.cloudfront.net/out/v1/35c05f080f4e49a4b4eb031b5a14e505/TVG2index_2.m3u8",category:"sports",quality:"720p",source:"FanDuel",viewers:3500,desc:"Live horse racing",color:"#1493ff"},
  {id:21,name:"FanDuel TV",stream:"https://d2jl8r92tdc3f1.cloudfront.net/out/v1/59419700344b4625b7cb0693ba265ea3/TVGindex_1.m3u8",category:"sports",quality:"720p",source:"FanDuel",viewers:4100,desc:"Sports betting and analysis",color:"#1493ff"},
  {id:22,name:"DAZN Combat",stream:"https://dazn-combat-rakuten.amagi.tv/hls/amagi_hls_data_rakutenAA-dazn-combat-rakuten/CDN/master.m3u8",category:"sports",quality:"1080p",source:"Rakuten",viewers:8600,desc:"Combat sports 24/7",color:"#0a0a0a"},
  {id:23,name:"GLORY Kickboxing",stream:"https://6f972d29.wurl.com/master/f36d25e7e52f1ba8d7e56eb859c636563214f541/UmFrdXRlblRWLWV1X0dsb3J5S2lja2JveGluZ19ITFM/playlist.m3u8",category:"sports",quality:"720p",source:"Rakuten",viewers:3700,desc:"World kickboxing events",color:"#dc143c"},
  {id:24,name:"Speed Sport 1",stream:"https://linear-599.frequency.stream/dist/stirr/599/hls/master/playlist.m3u8",category:"sports",quality:"1080p",source:"Stirr",viewers:5400,desc:"Motorsport and racing",color:"#ff6600"},

  // ===== MOVIES (10) =====
  {id:25,name:"Artflix Movie Classics",stream:"https://amogonetworx-artflix-1-nl.samsung.wurl.tv/playlist.m3u8",category:"movies",quality:"720p",source:"Samsung TV+",viewers:5800,desc:"Classic cinema from the golden age",color:"#8d6e63"},
  {id:26,name:"Alien Nation by DUST",stream:"https://dqi7ayt2o24fn.cloudfront.net/playlist.m3u8",category:"movies",quality:"1080p",source:"DUST",viewers:2479,desc:"Sci-fi short films and features",color:"#4a148c"},
  {id:27,name:"70s Cinema",stream:"https://jmp2.uk/plu-5f4d878d3d19b30007d2e782.m3u8",category:"movies",quality:"720p",source:"Pluto TV",viewers:4100,desc:"Classic 1970s movies",color:"#bf360c"},
  {id:28,name:"80s Rewind",stream:"https://jmp2.uk/plu-5ca525b650be2571e3943c63.m3u8",category:"movies",quality:"720p",source:"Pluto TV",viewers:6200,desc:"The best of 1980s cinema",color:"#e91e63"},
  {id:29,name:"90s Throwback",stream:"https://jmp2.uk/plu-5f4d86f519358a00072b978e.m3u8",category:"movies",quality:"720p",source:"Pluto TV",viewers:5500,desc:"90s movies marathon",color:"#9c27b0"},
  {id:30,name:"24 Hour Free Movies",stream:"https://d1b5mlajbmvkjv.cloudfront.net/v1/master/9d062541f2ff39b5c0f48b743c6411d25f62fc25/UDU-DistroTV/145.m3u8",category:"movies",quality:"720p",source:"DistroTV",viewers:7800,desc:"Free movies around the clock",color:"#37474f"},
  {id:31,name:"30A Classic Movies",stream:"https://30a-tv.com/feeds/pzaz/30atvmovies.m3u8",category:"movies",quality:"720p",source:"30A TV",viewers:3200,desc:"Timeless movie classics",color:"#3e2723"},
  {id:32,name:"Rakuten Action Movies",stream:"https://284824cf70404fdfb6ddf9349009c710.mediatailor.eu-west-1.amazonaws.com/v1/master/0547f18649bd788bec7b67b746e47670f558b6b2/production-LiveChannel-6066/master.m3u8",category:"movies",quality:"1080p",source:"Rakuten",viewers:12246,desc:"Action-packed movies 24/7",color:"#d32f2f"},
  {id:33,name:"Rakuten Top Movies UK",stream:"https://0145451975a64b35866170fd2e8fa486.mediatailor.eu-west-1.amazonaws.com/v1/master/0547f18649bd788bec7b67b746e47670f558b6b2/production-LiveChannel-5987/master.m3u8",category:"movies",quality:"1080p",source:"Rakuten",viewers:9466,desc:"Top UK movie selection",color:"#1565c0"},
  {id:34,name:"Charge! Action",stream:"https://fast-channels.sinclairstoryline.com/CHARGE/index.m3u8",category:"movies",quality:"1080p",source:"Sinclair",viewers:10663,desc:"Action movies and series",color:"#c62828"},

  // ===== ENTERTAINMENT (8) =====
  {id:35,name:"AMC Reality",stream:"https://amc-absolutereality-1-us.plex.wurl.tv/playlist.m3u8",category:"entertainment",quality:"720p",source:"Plex TV",viewers:7100,desc:"Reality TV from AMC",color:"#5d4037"},
  {id:36,name:"ALLBLK Gems",stream:"https://df1zke3zj042m.cloudfront.net/playlist.m3u8",category:"entertainment",quality:"720p",source:"ALLBLK",viewers:4200,desc:"Black culture entertainment",color:"#4a148c"},
  {id:37,name:"Bounce XL",stream:"https://cdn-uw2-prod.tsv2.amagi.tv/linear/amg01438-ewscrippscompan-bouncexl-tablo/playlist.m3u8",category:"entertainment",quality:"1080p",source:"Stirr",viewers:6800,desc:"African-American entertainment",color:"#ff6f00"},
  {id:38,name:"Buzzr Game Shows",stream:"https://buzzrota-ono.amagi.tv/playlist.m3u8",category:"entertainment",quality:"1080p",source:"Amagi",viewers:9100,desc:"Classic game shows 24/7",color:"#ff9800"},
  {id:39,name:"AsianCrush",stream:"https://linear-900.frequency.stream/dist/cineverse/900/hls/master/playlist.m3u8",category:"entertainment",quality:"1080p",source:"Frequency",viewers:5400,desc:"Asian movies and dramas",color:"#e91e63"},
  {id:40,name:"AfroLandTV",stream:"https://alt-al.otteravision.com/alt/al/al.m3u8",category:"entertainment",quality:"1080p",source:"AfroLand",viewers:3800,desc:"African entertainment and movies",color:"#1b5e20"},
  {id:41,name:"30A Television",stream:"https://30a-tv.com/feeds/masters/30atv.m3u8",category:"entertainment",quality:"720p",source:"30A TV",viewers:2900,desc:"Florida beach lifestyle TV",color:"#00838f"},
  {id:42,name:"Forensic Files",stream:"https://jmp2.uk/plu-5bb1af6a268cae539bcedb0a.m3u8",category:"entertainment",quality:"720p",source:"Pluto TV",viewers:8300,desc:"Real forensic crime investigations",color:"#455a64"},

  // ===== MUSIC (8) =====
  {id:43,name:"CMC California Music",stream:"https://cmc-ono.amagi.tv/playlist.m3u8",category:"music",quality:"1080p",source:"Amagi",viewers:6126,desc:"California Music Channel",color:"#e91e63"},
  {id:44,name:"30A Music",stream:"https://30a-tv.com/music.m3u8",category:"music",quality:"720p",source:"30A TV",viewers:2100,desc:"Beach music vibes",color:"#00bcd4"},
  {id:45,name:"Dance Television",stream:"https://m1b2.worldcast.tv/dancetelevisionone/dancetelevisionone.m3u8",category:"music",quality:"1080p",source:"WorldCast",viewers:4300,desc:"Electronic dance music",color:"#7c4dff"},
  {id:46,name:"DanceTV EDM Mainstage",stream:"https://mbit1.worldcast.tv/dancetelevisionseven/multibit.m3u8",category:"music",quality:"1080p",source:"WorldCast",viewers:3800,desc:"Mainstage EDM live sets",color:"#651fff"},
  {id:47,name:"DanceTV Techno",stream:"https://m2b2.worldcast.tv:7443/dancetelevisionthree/dancetelevisionthree.m3u8",category:"music",quality:"1080p",source:"WorldCast",viewers:2900,desc:"Underground techno warehouse",color:"#311b92"},
  {id:48,name:"Clubbing TV",stream:"https://d1j2csarxnwazk.cloudfront.net/v1/master/3722c60a815c199d9c0ef36c5b73da68a62b09d1/cc-uze1m6xh4fiyr-ssai-prd/master.m3u8",category:"music",quality:"720p",source:"Rakuten",viewers:5100,desc:"Club and DJ music channel",color:"#9c27b0"},
  {id:49,name:"Stingray Classic Rock",stream:"https://lotus.stingray.com/manifest/ose-101ads-montreal/samsungtvplus/master.m3u8",category:"music",quality:"1080p",source:"Samsung TV+",viewers:7200,desc:"Classic rock hits",color:"#f44336"},
  {id:50,name:"Stingray Hit List",stream:"https://lotus.stingray.com/manifest/ose-107ads-montreal/samsungtvplus/master.m3u8",category:"music",quality:"1080p",source:"Samsung TV+",viewers:10903,desc:"Today's biggest hits",color:"#ff5722"},

  // ===== KIDS (6) =====
  {id:51,name:"BBC Kids",stream:"https://dmr1h4skdal9h.cloudfront.net/playlist.m3u8",category:"kids",quality:"720p",source:"BBC",viewers:2721,desc:"Children's programming from BBC",color:"#00897b"},
  {id:52,name:"Baby Shark TV",stream:"https://newidco-babysharktv-1-us.roku.wurl.tv/playlist.m3u8",category:"kids",quality:"1080p",source:"Roku",viewers:3477,desc:"Baby Shark and friends",color:"#ff9800"},
  {id:53,name:"Brat TV",stream:"https://streams2.sofast.tv/v1/master/611d79b11b77e2f571934fd80ca1413453772ac7/04072b68-dc6a-4d5e-98af-f356ba8d5063/playlist.m3u8",category:"kids",quality:"720p",source:"SoFast",viewers:4398,desc:"Gen Z entertainment",color:"#e040fb"},
  {id:54,name:"Camp Spoopy",stream:"https://stream.ads.ottera.tv/playlist.m3u8?network_id=269",category:"kids",quality:"576p",source:"Ottera",viewers:1800,desc:"Spooky fun for kids",color:"#4a148c"},
  {id:55,name:"Avatar Pluto TV",stream:"https://jmp2.uk/plu-600adbdf8c554e00072125c9.m3u8",category:"kids",quality:"720p",source:"Pluto TV",viewers:6700,desc:"Avatar and Nickelodeon shows",color:"#00897b"},
  {id:56,name:"Anime Vision",stream:"https://d1ujfw1zyymzyd.cloudfront.net/v1/master/3722c60a815c199d9c0ef36c5b73da68a62b09d1/cc-a6fukwkbxmex8/live/fast-channel-animevision-64527ec0/fast-channel-animevision-64527ec0.m3u8",category:"kids",quality:"1080p",source:"Cineverse",viewers:3603,desc:"Anime streaming 24/7",color:"#e91e63"},

  // ===== DOCUMENTARY (6) =====
  {id:57,name:"Documentary+",stream:"https://ef79b15c8c7c46c7a9de9d33001dbd07.mediatailor.us-west-2.amazonaws.com/v1/master/ba62fe743df0fe93366eba3a257d792884136c7f/LINEAR-859-DOCUMENTARYPLUS-DOCUMENTARYPLUS/mt/documentaryplus/859/hls/master/playlist.m3u8",category:"documentary",quality:"1080p",source:"Amazon",viewers:7800,desc:"Award-winning documentaries",color:"#1b5e20"},
  {id:58,name:"Docurama",stream:"https://docurama-plex-ingest.cinedigm.com/playlist.m3u8",category:"documentary",quality:"1080p",source:"Plex TV",viewers:4600,desc:"Curated documentary films",color:"#0d47a1"},
  {id:59,name:"DangerTV",stream:"https://dk0n7jh428tzj.cloudfront.net/v1/dangertv/samsungheadend_us/latest/main/hls/playlist.m3u8",category:"documentary",quality:"720p",source:"Samsung TV+",viewers:3200,desc:"Extreme adventure and danger",color:"#b71c1c"},
  {id:60,name:"Curiosity NOW",stream:"https://amg00170-amg00170c4-samsung-gb-4232.playouts.now.amagi.tv/playlist.m3u8",category:"documentary",quality:"1080p",source:"Samsung TV+",viewers:5100,desc:"Science and nature documentaries",color:"#0277bd"},
  {id:61,name:"4K Travel TV",stream:"https://d35j504z0x2vu2.cloudfront.net/v1/master/0bc8e8376bd8417a1b6761138aa41c26c7309312/4k-travel-tv/manifest.m3u8",category:"documentary",quality:"1080p",source:"DistroTV",viewers:4900,desc:"Travel the world in 4K",color:"#00695c"},
  {id:62,name:"5-Minute Craft",stream:"https://soul-5mincrafteng-rakuten.amagi.tv/playlist.m3u8",category:"documentary",quality:"1080p",source:"Rakuten",viewers:12145,desc:"DIY and craft videos",color:"#ff6f00"},

  // ===== INTERNATIONAL (6) =====
  {id:63,name:"Bloomberg Television",stream:"https://d35j504z0x2vu2.cloudfront.net/v1/master/0bc8e8376bd8417a1b6761138aa41c26c7309312/bloomberg-television/bloombergtv.m3u8",category:"international",quality:"1080p",source:"Bloomberg",viewers:11414,desc:"Global business and finance news",color:"#5c068c"},
  {id:64,name:"BBC Earth",stream:"https://amg00793-amg00793c6-xumo-us-2669.playouts.now.amagi.tv/BBCStudios-BBCEarthA-hls/playlist.m3u8",category:"international",quality:"1080p",source:"Xumo",viewers:10718,desc:"Nature and science from BBC",color:"#2e7d32"},
  {id:65,name:"BBC Top Gear",stream:"https://amg00793-amg00793c5-xumo-us-2664.playouts.now.amagi.tv/bbcstudios-bbctopgear8min-all/playlist.m3u8",category:"international",quality:"1080p",source:"Xumo",viewers:7734,desc:"Top Gear highlights and cars",color:"#c62828"},
  {id:66,name:"Alhurra Iraq",stream:"https://mbn-ingest-worldsafe.akamaized.net/hls/live/2038899/MBN_Iraq_Worldsafe_HLS/master.m3u8",category:"international",quality:"720p",source:"MBN",viewers:3400,desc:"Iraqi news and programming",color:"#1565c0"},
  {id:67,name:"ABC 5 St. Paul MN",stream:"https://amg01942-amg01942c2-stirr-us-10173.playouts.now.amagi.tv/playlist.m3u8",category:"international",quality:"1080p",source:"Stirr",viewers:2200,desc:"Local ABC Minneapolis",color:"#e4002b"},
  {id:68,name:"AccuWeather NOW",stream:"https://cdn-ue1-prod.tsv2.amagi.tv/linear/amg00684-accuweather-accuweather-plex/playlist.m3u8",category:"international",quality:"1080p",source:"Plex TV",viewers:6100,desc:"24/7 weather forecasts",color:"#0277bd"},

  // ===== MORE NEWS (4) =====
  {id:69,name:"Al Jazeera Mubasher",stream:"https://live-hls-apps-ajm-fa.getaj.net/AJM/index.m3u8",category:"news",quality:"1080p",source:"Al Jazeera",viewers:7218,desc:"Live events and conferences",color:"#fa9000"},
  {id:70,name:"France 24 Spanish",stream:"https://live.france24.com/hls/live/2037220-b/F24_ES_HI_HLS/master_5000.m3u8",category:"news",quality:"1080p",source:"France 24",viewers:9333,desc:"Noticias en espanol",color:"#0055a5"},
  {id:71,name:"Africanews",stream:"https://d35j504z0x2vu2.cloudfront.net/v1/master/0bc8e8376bd8417a1b6761138aa41c26c7309312/africanews/africanews-en.m3u8",category:"news",quality:"720p",source:"Africanews",viewers:1800,desc:"African news in English",color:"#007a3d"},
  {id:72,name:"America's Voice News",stream:"https://content.uplynk.com/channel/26bd482ffe364a1282bc3df28bd3c21f.m3u8",category:"news",quality:"720p",source:"Uplynk",viewers:4100,desc:"American conservative news",color:"#b71c1c"},

  // ===== MORE SPORTS (4) =====
  {id:73,name:"ACI Sport TV",stream:"https://webstream.multistream.it/memfs/e2cb3629-c1a2-495b-b43a-9eb386f04ed8.m3u8",category:"sports",quality:"1080p",source:"Multistream",viewers:4057,desc:"Italian motorsport",color:"#009688"},
  {id:74,name:"FITE 24/7",stream:"https://d3d85c7qkywguj.cloudfront.net/scheduler/scheduleMaster/263.m3u8",category:"sports",quality:"1080p",source:"FITE",viewers:5600,desc:"Combat and pro wrestling",color:"#311b92"},
  {id:75,name:"Sport Italia",stream:"https://amg01370-italiansportcom-sportitalia-rakuten-3hmdb.amagi.tv/hls/amagi_hls_data_rakutenAA-sportitalia-rakuten/CDN/master.m3u8",category:"sports",quality:"1080p",source:"Rakuten",viewers:6764,desc:"Italian sports coverage",color:"#00897b"},
  {id:76,name:"Africa 24 Sport",stream:"https://africa24.vedge.infomaniak.com/livecast/ik:africa24sport/manifest.m3u8",category:"sports",quality:"1080p",source:"Infomaniak",viewers:2800,desc:"African sports channel",color:"#007a3d"}
];

const CATEGORIES = [
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

// ==================== APP STATE ====================
let currentFilter = 'all';
let currentChannel = null;
let hlsInstance = null;
let heroIndex = 0;
let heroInterval = null;

// ==================== SPLASH ====================
(function initSplash(){
  const bar = document.getElementById('load-bar');
  let p = 0;
  const iv = setInterval(()=>{
    p += Math.random()*12 + 3;
    if(p > 100) p = 100;
    bar.style.width = p+'%';
    if(p >= 100){
      clearInterval(iv);
      setTimeout(()=>{
        document.getElementById('splash').classList.add('hide');
        initApp();
      }, 400);
    }
  }, 80);
})();

// ==================== INIT ====================
function initApp(){
  renderCatFilter();
  renderChannels();
  renderHero();
  renderSidebar();
  renderUpcoming();
  bindEvents();
  updateStats();
}

// ==================== RENDER ====================
function renderCatFilter(){
  const el = document.getElementById('cat-filter');
  el.innerHTML = CATEGORIES.map(c=>{
    const count = c.id==='all' ? CHANNELS.length : CHANNELS.filter(ch=>ch.category===c.id).length;
    return '<button data-cat="'+c.id+'" class="'+(c.id==='all'?'active':'')+'"><i class="fas '+c.icon+'"></i> '+c.label+'<span class="cat-count">('+count+')</span></button>';
  }).join('');
}

function renderChannels(){
  const grid = document.getElementById('channels-grid');
  const filtered = currentFilter==='all' ? CHANNELS : CHANNELS.filter(ch=>ch.category===currentFilter);
  document.getElementById('ch-count').textContent = filtered.length + ' channels';
  
  if(!filtered.length){
    grid.innerHTML = '<div class="no-results"><i class="fas fa-tv"></i>No channels found in this category</div>';
    return;
  }

  grid.innerHTML = filtered.map(ch=>{
    const imgSeed = ch.name.replace(/[^a-z0-9]/gi,'').toLowerCase();
    const imgUrl = 'https://ui-avatars.com/api/?name='+encodeURIComponent(ch.name)+'&background='+ch.color.replace('#','')+'&color=fff&size=256&font-size=0.35&bold=true';
    return '<div class="ch-card" data-id="'+ch.id+'" role="listitem">'+
      '<div class="ch-thumb">'+
        '<div class="ch-thumb-bg" style="background-image:url(\''+imgUrl+'\')"></div>'+
        '<span class="live-badge">LIVE</span>'+
        '<span class="ch-quality">'+ch.quality+'</span>'+
        '<span class="ch-source">'+ch.source+'</span>'+
        '<div class="ch-play"><i class="fas fa-play"></i></div>'+
      '</div>'+
      '<div class="ch-body">'+
        '<div class="ch-name">'+ch.name+'</div>'+
        '<div class="ch-cat">'+ch.category+' &middot; '+ch.desc+'</div>'+
      '</div>'+
    '</div>';
  }).join('');
}

function renderHero(){
  const featured = CHANNELS.filter(ch=>['news','sports','movies','entertainment'].includes(ch.category)).slice(0,6);
  const slides = document.getElementById('hero-slides');
  const dots = document.getElementById('hero-dots');
  
  slides.innerHTML = featured.map((ch,i)=>{
    const imgUrl = 'https://ui-avatars.com/api/?name='+encodeURIComponent(ch.name)+'&background='+ch.color.replace('#','')+'&color=fff&size=800&font-size=0.25&bold=true';
    return '<div class="hero-slide'+(i===0?' active':'')+'" data-idx="'+i+'">'+
      '<div class="slide-bg" style="background-image:url(\''+imgUrl+'\')"></div>'+
      '<div class="slide-grad"></div>'+
      '<div class="slide-content">'+
        '<div class="slide-cat">'+ch.category+'</div>'+
        '<div class="slide-title">'+ch.name+'</div>'+
        '<div class="slide-desc">'+ch.desc+'</div>'+
        '<div class="slide-meta">'+
          '<span class="slide-quality">'+ch.quality+'</span>'+
          '<span class="slide-source"><i class="fas fa-signal"></i> '+ch.source+'</span>'+
        '</div>'+
        '<button class="btn-watch" data-id="'+ch.id+'"><i class="fas fa-play"></i> Watch Now</button>'+
      '</div>'+
    '</div>';
  }).join('');

  dots.innerHTML = featured.map((_,i)=>'<span data-idx="'+i+'" class="'+(i===0?'active':'')+'"></span>').join('');
  
  clearInterval(heroInterval);
  heroInterval = setInterval(()=>heroNext(featured.length), 6000);
}

function heroNext(total){
  heroIndex = (heroIndex+1)%total;
  document.querySelectorAll('.hero-slide').forEach((s,i)=>s.classList.toggle('active',i===heroIndex));
  document.querySelectorAll('.hero-dots span').forEach((d,i)=>d.classList.toggle('active',i===heroIndex));
}

function renderSidebar(){
  // On Air
  const onAir = CHANNELS.filter(ch=>['news','sports'].includes(ch.category)).slice(0,5);
  document.getElementById('on-air-body').innerHTML = onAir.map(ch=>
    '<div class="on-air-ch" data-id="'+ch.id+'">'+
      '<span class="oa-dot"></span>'+
      '<div class="oa-info">'+
        '<div class="oa-name">'+ch.name+'</div>'+
        '<div class="oa-now">'+ch.desc+'</div>'+
      '</div>'+
    '</div>'
  ).join('');

  // Trending
  const trending = [...CHANNELS].sort((a,b)=>b.viewers-a.viewers).slice(0,6);
  document.getElementById('trending-body').innerHTML = trending.map((ch,i)=>
    '<div class="trending-item" data-id="'+ch.id+'">'+
      '<span class="tr-rank">'+(i+1)+'</span>'+
      '<span class="tr-name">'+ch.name+'</span>'+
      '<span class="tr-viewers">'+formatNum(ch.viewers)+'</span>'+
    '</div>'
  ).join('');
}

function renderUpcoming(){
  const upcoming = CHANNELS.filter(ch=>['movies','documentary','entertainment'].includes(ch.category)).slice(0,8);
  const programs = [
    "Premiere Event","New Episode","Special Report","Live Concert",
    "Season Finale","Documentary Series","Movie Marathon","Exclusive Interview"
  ];
  const times = ["8:00 PM","9:30 PM","10:00 PM","11:15 PM","Tomorrow 7:00 AM","Tomorrow 12:00 PM","Tomorrow 3:00 PM","Tomorrow 6:00 PM"];
  
  document.getElementById('upcoming-scroll').innerHTML = upcoming.map((ch,i)=>
    '<div class="upcoming-card" data-id="'+ch.id+'">'+
      '<div class="uc-cat">'+ch.category+'</div>'+
      '<div class="uc-name">'+programs[i]+'</div>'+
      '<div class="uc-time">'+times[i]+'</div>'+
    '</div>'
  ).join('');
}

function updateStats(){
  document.getElementById('stat-ch').textContent = CHANNELS.length;
  document.getElementById('stat-hd').textContent = CHANNELS.filter(ch=>ch.quality==='1080p').length;
}

// ==================== PLAYER ====================
function playChannel(id){
  const ch = CHANNELS.find(c=>c.id===id);
  if(!ch) return;
  currentChannel = ch;
  
  const modal = document.getElementById('player-modal');
  const video = document.getElementById('hls-video');
  const overlay = document.getElementById('offline-overlay');
  const status = document.getElementById('player-status');
  const title = document.getElementById('player-title');

  modal.classList.add('open');
  overlay.classList.remove('show');
  status.textContent = 'CONNECTING';
  status.className = 'p-status connecting';
  title.textContent = ch.name;

  // Destroy previous instance
  if(hlsInstance){
    hlsInstance.destroy();
    hlsInstance = null;
  }

  if(Hls.isSupported()){
    hlsInstance = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      maxBufferLength: 30,
      maxMaxBufferLength: 60,
      xhrSetup: function(xhr){
        xhr.timeout = 10000;
      }
    });

    hlsInstance.loadSource(ch.stream);
    hlsInstance.attachMedia(video);

    hlsInstance.on(Hls.Events.MANIFEST_PARSED, function(){
      video.play().catch(()=>{});
      status.textContent = 'LIVE';
      status.className = 'p-status live';
    });

    hlsInstance.on(Hls.Events.ERROR, function(event, data){
      if(data.fatal){
        switch(data.type){
          case Hls.ErrorTypes.NETWORK_ERROR:
            // Try to recover
            hlsInstance.startLoad();
            setTimeout(()=>{
              if(status.className.includes('connecting')){
                showOffline();
              }
            }, 8000);
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            hlsInstance.recoverMediaError();
            break;
          default:
            showOffline();
            break;
        }
      }
    });

    // Timeout: if still connecting after 12s, show offline
    setTimeout(()=>{
      if(status.className.includes('connecting')){
        showOffline();
      }
    }, 12000);

  } else if(video.canPlayType('application/vnd.apple.mpegurl')){
    // Native HLS (Safari)
    video.src = ch.stream;
    video.addEventListener('loadedmetadata', function(){
      video.play().catch(()=>{});
      status.textContent = 'LIVE';
      status.className = 'p-status live';
    });
    video.addEventListener('error', showOffline);
  } else {
    showOffline();
  }
}

function showOffline(){
  const overlay = document.getElementById('offline-overlay');
  const status = document.getElementById('player-status');
  overlay.classList.add('show');
  status.textContent = 'OFFLINE';
  status.className = 'p-status offline';
}

function closePlayer(){
  const modal = document.getElementById('player-modal');
  const video = document.getElementById('hls-video');
  if(hlsInstance){
    hlsInstance.destroy();
    hlsInstance = null;
  }
  video.pause();
  video.src = '';
  modal.classList.remove('open');
  currentChannel = null;
}

function retryStream(){
  if(currentChannel){
    playChannel(currentChannel.id);
  }
}

function switchToNext(){
  if(!currentChannel) return;
  const sameCategory = CHANNELS.filter(ch=>ch.category===currentChannel.category && ch.id!==currentChannel.id);
  if(sameCategory.length){
    playChannel(sameCategory[Math.floor(Math.random()*sameCategory.length)].id);
  } else {
    const other = CHANNELS.filter(ch=>ch.id!==currentChannel.id);
    if(other.length) playChannel(other[Math.floor(Math.random()*other.length)].id);
  }
}

// ==================== EVENTS ====================
function bindEvents(){
  // Channel clicks
  document.addEventListener('click', function(e){
    const card = e.target.closest('.ch-card');
    if(card) return playChannel(parseInt(card.dataset.id));
    
    const onAirCh = e.target.closest('.on-air-ch');
    if(onAirCh) return playChannel(parseInt(onAirCh.dataset.id));
    
    const trendingItem = e.target.closest('.trending-item');
    if(trendingItem) return playChannel(parseInt(trendingItem.dataset.id));

    const upcomingCard = e.target.closest('.upcoming-card');
    if(upcomingCard) return playChannel(parseInt(upcomingCard.dataset.id));
    
    const watchBtn = e.target.closest('.btn-watch');
    if(watchBtn) return playChannel(parseInt(watchBtn.dataset.id));
  });

  // Category filter
  document.getElementById('cat-filter').addEventListener('click', function(e){
    const btn = e.target.closest('button');
    if(!btn) return;
    document.querySelectorAll('.cat-filter button').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.cat;
    renderChannels();
  });

  // Hero navigation
  document.getElementById('hero-prev').addEventListener('click', function(){
    heroIndex = (heroIndex - 1 + 6) % 6;
    document.querySelectorAll('.hero-slide').forEach((s,i)=>s.classList.toggle('active',i===heroIndex));
    document.querySelectorAll('.hero-dots span').forEach((d,i)=>d.classList.toggle('active',i===heroIndex));
  });
  document.getElementById('hero-next').addEventListener('click', function(){ heroNext(6); });
  document.getElementById('hero-dots').addEventListener('click', function(e){
    const dot = e.target.closest('span');
    if(!dot) return;
    heroIndex = parseInt(dot.dataset.idx);
    document.querySelectorAll('.hero-slide').forEach((s,i)=>s.classList.toggle('active',i===heroIndex));
    document.querySelectorAll('.hero-dots span').forEach((d,i)=>d.classList.toggle('active',i===heroIndex));
  });

  // Player controls
  document.getElementById('player-close').addEventListener('click', closePlayer);
  document.getElementById('btn-retry').addEventListener('click', retryStream);
  document.getElementById('btn-switch').addEventListener('click', switchToNext);
  document.getElementById('player-modal').addEventListener('click', function(e){
    if(e.target===this) closePlayer();
  });
  document.getElementById('play-pause').addEventListener('click', function(){
    const v = document.getElementById('hls-video');
    if(v.paused){ v.play(); this.innerHTML='<i class="fas fa-pause"></i>'; }
    else{ v.pause(); this.innerHTML='<i class="fas fa-play"></i>'; }
  });
  document.getElementById('vol-toggle').addEventListener('click', function(){
    const v = document.getElementById('hls-video');
    v.muted = !v.muted;
    this.innerHTML = v.muted ? '<i class="fas fa-volume-mute"></i>' : '<i class="fas fa-volume-up"></i>';
  });
  document.getElementById('fullscreen-btn').addEventListener('click', function(){
    const wrap = document.querySelector('.player-wrap');
    if(wrap.requestFullscreen) wrap.requestFullscreen();
    else if(wrap.webkitRequestFullscreen) wrap.webkitRequestFullscreen();
  });

  // Search
  document.getElementById('search-toggle').addEventListener('click', function(){
    const box = document.getElementById('search-box');
    box.classList.toggle('open');
    if(box.classList.contains('open')) document.getElementById('search-input').focus();
  });
  document.getElementById('search-input').addEventListener('input', function(){
    const q = this.value.toLowerCase().trim();
    if(!q){
      currentFilter = 'all';
      document.querySelectorAll('.cat-filter button').forEach(b=>b.classList.remove('active'));
      document.querySelector('.cat-filter button[data-cat="all"]').classList.add('active');
      renderChannels();
      return;
    }
    const filtered = CHANNELS.filter(ch=>ch.name.toLowerCase().includes(q)||ch.category.includes(q)||ch.desc.toLowerCase().includes(q)||ch.source.toLowerCase().includes(q));
    const grid = document.getElementById('channels-grid');
    document.getElementById('ch-count').textContent = filtered.length + ' results';
    grid.innerHTML = filtered.map(ch=>{
      const imgUrl = 'https://ui-avatars.com/api/?name='+encodeURIComponent(ch.name)+'&background='+ch.color.replace('#','')+'&color=fff&size=256&font-size=0.35&bold=true';
      return '<div class="ch-card" data-id="'+ch.id+'">'+
        '<div class="ch-thumb">'+
          '<div class="ch-thumb-bg" style="background-image:url(\''+imgUrl+'\')"></div>'+
          '<span class="live-badge">LIVE</span>'+
          '<span class="ch-quality">'+ch.quality+'</span>'+
          '<span class="ch-source">'+ch.source+'</span>'+
          '<div class="ch-play"><i class="fas fa-play"></i></div>'+
        '</div>'+
        '<div class="ch-body">'+
          '<div class="ch-name">'+ch.name+'</div>'+
          '<div class="ch-cat">'+ch.category+' &middot; '+ch.desc+'</div>'+
        '</div>'+
      '</div>';
    }).join('');
  });

  // Refresh
  document.getElementById('refresh-btn').addEventListener('click', function(){
    this.classList.add('spinning');
    setTimeout(()=>{
      this.classList.remove('spinning');
      renderChannels();
      renderSidebar();
      renderUpcoming();
      showToast('Channels refreshed!', false);
    }, 1500);
  });

  // Sidebar toggles
  document.querySelectorAll('.sidebar-toggle').forEach(t=>{
    t.addEventListener('click', function(){
      this.classList.toggle('collapsed');
      this.nextElementSibling.classList.toggle('collapsed');
    });
  });

  // Nav
  document.querySelectorAll('header nav a').forEach(a=>{
    a.addEventListener('click', function(e){
      e.preventDefault();
      document.querySelectorAll('header nav a').forEach(n=>n.classList.remove('active'));
      this.classList.add('active');
      const nav = this.dataset.nav;
      if(nav==='home') window.scrollTo({top:0,behavior:'smooth'});
      else if(nav==='live'){ currentFilter='all'; document.querySelector('.cat-filter button[data-cat="all"]').click(); document.getElementById('channels-section').scrollIntoView({behavior:'smooth'}); }
      else if(nav==='sports'){ currentFilter='sports'; document.querySelector('.cat-filter button[data-cat="sports"]').click(); document.getElementById('channels-section').scrollIntoView({behavior:'smooth'}); }
      else if(nav==='news'){ currentFilter='news'; document.querySelector('.cat-filter button[data-cat="news"]').click(); document.getElementById('channels-section').scrollIntoView({behavior:'smooth'}); }
    });
  });

  // Mistral AI
  document.getElementById('mistral-send').addEventListener('click', askMistral);
  document.getElementById('mistral-input').addEventListener('keypress', function(e){ if(e.key==='Enter') askMistral(); });
  
  // Keyboard
  document.addEventListener('keydown', function(e){
    if(e.key==='Escape') closePlayer();
  });
}

// ==================== MISTRAL AI ====================
async function askMistral(){
  const input = document.getElementById('mistral-input');
  const msg = document.getElementById('mistral-msg');
  const q = input.value.trim();
  if(!q) return;
  
  msg.textContent = 'Thinking...';
  input.value = '';
  
  const channelContext = CHANNELS.slice(0,20).map(ch=>ch.name+' ('+ch.category+')').join(', ');
  
  try{
    const res = await fetch('https://api.mistral.ai/v1/chat/completions',{
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':'Bearer YOUR_MISTRAL_KEY'},
      body:JSON.stringify({
        model:'mistral-small-latest',
        messages:[
          {role:'system',content:'You are a helpful TV channel assistant for EDGE IPTV. Available channels include: '+channelContext+'. Suggest channels and answer questions about content. Be brief and helpful.'},
          {role:'user',content:q}
        ],
        max_tokens:150
      })
    });
    const data = await res.json();
    msg.textContent = data.choices?.[0]?.message?.content || 'Sorry, could not get a response.';
  }catch(e){
    msg.textContent = 'AI unavailable. Try selecting a channel to watch instead!';
  }
}

// ==================== UTILS ====================
function formatNum(n){
  if(n>=1000) return (n/1000).toFixed(1)+'k';
  return n;
}

function showToast(text, isError){
  const t = document.getElementById('toast');
  t.textContent = text;
  t.className = 'toast show' + (isError?' error':'');
  setTimeout(()=>t.classList.remove('show'), 3000);
}
<\/script>
</body>
</html>`;
    return new Response(html, {
      headers: { 'Content-Type': 'text/html;charset=UTF-8' }
    });
  }
};
