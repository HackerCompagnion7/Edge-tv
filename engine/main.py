"""EDGE Vision Engine - FastAPI Server.

Production realtime visual intelligence for IPTV.
Pipeline: Stream → FFmpeg → pHash → OCR → CLIP → Fusion → TMDB → UI
"""

from __future__ import annotations

import asyncio
import base64
import io
import logging
import time
from contextlib import asynccontextmanager
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image

from .config import EngineConfig
from .models import (
    ChannelState,
    ContentType,
    DetectionResponse,
    DetectionResult,
    DetectionSource,
    DetectRequest,
    EngineStatusResponse,
    ManualIdentifyRequest,
    RegisterChannelRequest,
    VisionChatRequest,
)
from .cache import CacheLayer
from .state import StateManager
from .sampler import FrameSampler
from .scene import SceneDetector
from .ocr import OCRExtractor
from .embeddings import EmbeddingEngine
from .tmdb_client import TMDBClient
from .fusion import FusionEngine, infer_content_type

# ── Logging ────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("edge.engine")

# ── Globals ────────────────────────────────────────────────────
START_TIME = time.time()
_config: Optional[EngineConfig] = None
_cache: Optional[CacheLayer] = None
_state: Optional[StateManager] = None
_sampler: Optional[FrameSampler] = None
_scene: Optional[SceneDetector] = None
_ocr: Optional[OCRExtractor] = None
_clip: Optional[EmbeddingEngine] = None
_tmdb: Optional[TMDBClient] = None
_fusion: Optional[FusionEngine] = None
_scan_tasks: Dict[str, asyncio.Task] = {}


# ── Lifespan ───────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize and cleanup engine components."""
    global _config, _cache, _state, _sampler, _scene, _ocr, _clip, _tmdb, _fusion

    _config = EngineConfig.from_env()
    _cache = CacheLayer(_config)
    _state = StateManager()
    _sampler = FrameSampler(_config)
    _scene = SceneDetector(_config, _cache.phash)
    _ocr = OCRExtractor(_config, _cache.ocr)
    _clip = EmbeddingEngine(_config, _cache.embedding)
    _tmdb = TMDBClient(_config, _cache.genre)
    _fusion = FusionEngine(_config, _cache, _state, _scene, _ocr, _clip, _tmdb)

    logger.info(
        "EDGE Vision Engine v4 started | FFmpeg=%s | TMDB=%s | Mistral=%s",
        _sampler.check_available(),
        _tmdb.is_configured(),
        bool(_config.mistral_api_key),
    )

    yield

    # Cleanup
    for task in _scan_tasks.values():
        task.cancel()
    await _tmdb.close()
    logger.info("EDGE Vision Engine stopped")


# ── App ────────────────────────────────────────────────────────
app = FastAPI(
    title="EDGE Vision Engine",
    version="4.0.0",
    description="Production realtime visual intelligence for IPTV",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


# ── Health & Status ────────────────────────────────────────────
@app.get("/api/engine-status", response_model=EngineStatusResponse)
async def engine_status():
    """Get engine status and component availability."""
    features = ["metadata_detection", "epg_detection", "scene_change_detection"]
    tmdb_ok = _tmdb.is_configured()
    ocr_ok = _ocr.is_available()
    clip_ok = _clip.is_available()
    ffmpeg_ok = _sampler.check_available()
    mistral_ok = bool(_config.mistral_api_key)

    if tmdb_ok:
        features.extend(["tmdb_genre_detection", "tmdb_poster_lookup", "tmdb_trending"])
    if ocr_ok:
        features.append("ocr_detection")
    if clip_ok:
        features.append("clip_matching")
    if mistral_ok:
        features.extend(["vision_detection", "vision_chat"])
    features.extend(["manual_identification", "batch_detection"])

    return EngineStatusResponse(
        version="v4",
        status="running",
        tmdb=tmdb_ok,
        mistral=mistral_ok,
        paddleocr=ocr_ok,
        openclip=clip_ok,
        ffmpeg=ffmpeg_ok,
        features=features,
        channels=_state.count,
        uptime=round(time.time() - START_TIME, 1),
    )


@app.get("/api/health")
async def health():
    """Simple health check."""
    return {"status": "ok", "uptime": round(time.time() - START_TIME, 1)}


# ── Detection ──────────────────────────────────────────────────
@app.post("/api/detect")
async def detect_content(req: DetectRequest):
    """Detect content for a channel.

    Accepts optional base64 frame and metadata.
    Runs the full pipeline: Metadata → OCR → CLIP → TMDB → Vision.
    """
    frame_image = None
    if req.frame:
        try:
            img_bytes = base64.b64decode(req.frame)
            frame_image = Image.open(io.BytesIO(img_bytes)).convert("RGB")
        except Exception:
            pass

    result = await _fusion.analyze(
        channel_id=req.channelId,
        category=req.category,
        frame_image=frame_image,
        frame_base64=req.frame,
        metadata=req.metadata,
    )

    if result:
        return DetectionResponse(success=True, data=result.to_dict())
    return DetectionResponse(success=False, error="No detection result")


@app.get("/api/now-playing")
async def now_playing(channelId: str):
    """Get cached detection for a channel."""
    cached = _cache.detection.get(f"detect:{channelId}")
    if cached:
        return DetectionResponse(success=True, data=cached.to_dict())
    return DetectionResponse(success=False, error="No detection cached")


@app.post("/api/batch-detect")
async def batch_detect(channelIds: List[str]):
    """Get cached detections for multiple channels."""
    results = {}
    for cid in channelIds:
        cached = _cache.detection.get(f"detect:{cid}")
        if cached:
            results[cid] = cached.to_dict()
    return {"success": True, "data": results}


# ── Manual Identification ─────────────────────────────────────
@app.post("/api/identify")
async def manual_identify(req: ManualIdentifyRequest):
    """Manually identify content for a channel (high confidence)."""
    detection = DetectionResult(
        title=req.title,
        content_type=ContentType(req.type),
        confidence=0.95,
        source=DetectionSource.MANUAL,
        year=req.year,
        channel_id=req.channelId,
    )

    # Enrich with TMDB
    await _fusion._enrich_tmdb(detection)

    # Cache and update state
    _cache.detection.set(f"detect:{req.channelId}", detection)
    _state.set_detection(req.channelId, detection)

    return DetectionResponse(success=True, data=detection.to_dict())


# ── Vision Chat ────────────────────────────────────────────────
@app.post("/api/vision-chat")
async def vision_chat(req: VisionChatRequest):
    """AI chat with vision capability.

    Sends frame + question to Mistral Pixtral.
    Falls back to TMDB genre matching if no Mistral API key.
    """
    if not req.question:
        raise HTTPException(400, "question required")

    q_lower = req.question.lower()
    is_content_query = any(
        k in q_lower
        for k in [
            "que pelicula", "que esta", "que dan", "que ponen", "que se ve",
            "what movie", "what show", "what playing", "que serie",
            "que programa", "what is this", "que es esto", "identifica",
            "detecta", "que ves", "what do you see",
        ]
    )

    channel_name = req.channelName or ""
    category = req.category or "default"
    channel_id = req.channelId or ""

    # ── PRIORITY 1: Vision with frame ──────────────────────
    if req.frame and _config.mistral_api_key and is_content_query:
        system_prompt = (
            f"Eres EDGE Vision, asistente de EDGE TV IPTV. "
            f"Canal: {channel_name} ({category}). "
            f"NUNCA digas 'no puedo'. SIEMPRE intenta identificar. "
            f"Busca actores, texto, logos, efectos. "
            f"Si sci-fi/terror con naves: Alien, Aliens, Prometheus, The Thing, "
            f"Event Horizon, Life, Species, Predator. "
            f"Responde conciso, maximo 3 lineas."
        )
        user_prompt = (
            f"ANALIZA esta captura del canal '{channel_name}' ({category}).\n"
            f"{req.question}\n"
            f"Mira TODA la imagen. Busca rostros, escenas, texto, efectos. "
            f"Identifica el titulo EXACTO. Si no estas seguro, da alternativas. "
            f"NUNCA digas que no puedes."
        )

        try:
            import httpx

            async with httpx.AsyncClient(timeout=20) as client:
                resp = await client.post(
                    "https://api.mistral.ai/v1/chat/completions",
                    headers={
                        "Content-Type": "application/json",
                        "Authorization": f"Bearer {_config.mistral_api_key}",
                    },
                    json={
                        "model": _config.mistral_model,
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {
                                "role": "user",
                                "content": [
                                    {"type": "text", "text": user_prompt},
                                    {
                                        "type": "image_url",
                                        "image_url": f"data:image/jpeg;base64,{req.frame}",
                                    },
                                ],
                            },
                        ],
                        "temperature": 0.1,
                        "max_tokens": 400,
                    },
                )
                data = resp.json()
                content = data.get("choices", [{}])[0].get("message", {}).get("content", "")

                if content:
                    # Extract title for TMDB enrichment
                    import re
                    title_match = re.search(r'"([^"]+)"\s*\(?((?:19|20)\d{2})\)?', content)
                    detected_title = title_match.group(1) if title_match else None
                    detected_year = title_match.group(2) if title_match else None

                    # Enrich with TMDB
                    enriched = content
                    if detected_title:
                        tmdb_data = await _tmdb.search(detected_title, "movie", detected_year)
                        if tmdb_data:
                            if tmdb_data.get("overview"):
                                enriched += f"\n\nSinopsis: {tmdb_data['overview'][:150]}..."
                            if tmdb_data.get("rating"):
                                enriched += f" | Rating: {tmdb_data['rating']:.1f}/10"

                    # Cache as detection
                    if channel_id and detected_title:
                        det = DetectionResult(
                            title=detected_title,
                            content_type=infer_content_type(channel_name + " " + content),
                            confidence=0.85,
                            source=DetectionSource.VISION,
                            year=detected_year,
                            channel_id=channel_id,
                        )
                        await _fusion._enrich_tmdb(det)
                        _cache.detection.set(f"detect:{channel_id}", det)
                        _state.set_detection(channel_id, det)

                    return {
                        "response": enriched,
                        "source": "vision",
                        "title": detected_title,
                        "year": detected_year,
                    }
        except Exception as e:
            logger.warning("Vision chat error: %s", str(e)[:100])

    # ── PRIORITY 2: Text-only Mistral ──────────────────────
    if _config.mistral_api_key:
        try:
            import httpx

            async with httpx.AsyncClient(timeout=15) as client:
                resp = await client.post(
                    "https://api.mistral.ai/v1/chat/completions",
                    headers={
                        "Content-Type": "application/json",
                        "Authorization": f"Bearer {_config.mistral_api_key}",
                    },
                    json={
                        "model": "mistral-small",
                        "messages": [
                            {
                                "role": "system",
                                "content": f"Eres EDGE Vision, asistente de EDGE TV. "
                                f"Canal: {channel_name} ({category}). "
                                f"NUNCA digas 'no puedo'. Responde conciso.",
                            },
                            {"role": "user", "content": req.question},
                        ],
                        "temperature": 0.3,
                        "max_tokens": 300,
                    },
                )
                data = resp.json()
                content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
                if content:
                    return {"response": content, "source": "text_chat"}
        except Exception as e:
            logger.warning("Text chat error: %s", str(e)[:80])

    # ── PRIORITY 3: TMDB fallback ─────────────────────────
    if channel_name or category:
        genre_result = await _tmdb.detect_from_channel_name(channel_name, category)
        if genre_result and genre_result.get("candidates"):
            top5 = ", ".join(
                f"{c['title']} ({c.get('year', '?')})"
                for c in genre_result["candidates"][:5]
            )
            return {
                "response": f"Segun el canal '{channel_name}' ({category}), las peliculas mas probables son: {top5}",
                "source": "tmdb_fallback",
                "candidates": genre_result["candidates"],
            }

    return {
        "response": "Configura MISTRAL_API_KEY para activar vision AI.",
        "source": "fallback",
    }


# ── Channel Management ─────────────────────────────────────────
@app.post("/api/register-channel")
async def register_channel(req: RegisterChannelRequest):
    """Register a channel for continuous scanning."""
    _state.register(
        channel_id=req.channelId,
        channel_name=req.channelName,
        category=req.category,
        stream_url=req.streamUrl,
    )
    return {"success": True, "message": f"Channel {req.channelId} registered"}


@app.delete("/api/channel/{channel_id}")
async def remove_channel(channel_id: str):
    """Remove a channel from scanning."""
    removed = _state.remove(channel_id)
    if channel_id in _scan_tasks:
        _scan_tasks[channel_id].cancel()
        del _scan_tasks[channel_id]
    return {"success": removed}


@app.get("/api/channel-state")
async def channel_state(channelId: str):
    """Get state for a specific channel."""
    state = _state.get(channelId)
    return {
        "channelId": state.channel_id,
        "channelName": state.channel_name,
        "category": state.category,
        "lastSource": state.last_source,
        "detectionCount": state.detection_count,
        "lastFrameTime": state.last_frame_time,
        "scanning": state.scanning,
        "lastDetection": state.last_detection.to_dict() if state.last_detection else None,
    }


@app.post("/api/start-scan/{channel_id}")
async def start_scan(channel_id: str):
    """Start continuous scanning for a channel."""
    if channel_id in _scan_tasks:
        return {"success": False, "error": "Already scanning"}

    state = _state.get(channel_id)
    if not state.stream_url:
        return {"success": False, "error": "No stream URL registered"}

    task = asyncio.create_task(_scan_loop(channel_id))
    _scan_tasks[channel_id] = task
    _state.set_scanning(channel_id, True)

    return {"success": True, "message": f"Scanning started for {channel_id}"}


@app.post("/api/stop-scan/{channel_id}")
async def stop_scan(channel_id: str):
    """Stop continuous scanning for a channel."""
    if channel_id in _scan_tasks:
        _scan_tasks[channel_id].cancel()
        del _scan_tasks[channel_id]
    _state.set_scanning(channel_id, False)
    return {"success": True}


async def _scan_loop(channel_id: str):
    """Continuous scan loop for a channel."""
    state = _state.get(channel_id)
    interval = _config.scan_intervals.get(state.category, 60)

    while True:
        try:
            # Extract frame via FFmpeg
            frame = await _sampler.sample(state.stream_url)
            if frame is not None:
                # Convert to base64 for vision pipeline
                buf = io.BytesIO()
                frame.save(buf, format="JPEG", quality=70)
                frame_b64 = base64.b64encode(buf.getvalue()).decode("ascii")

                # Run analysis pipeline
                await _fusion.analyze(
                    channel_id=channel_id,
                    category=state.category,
                    frame_image=frame,
                    frame_base64=frame_b64,
                    metadata={"title": state.channel_name, "genre": [state.category]},
                )
        except asyncio.CancelledError:
            break
        except Exception as e:
            logger.warning("Scan loop error for %s: %s", channel_id, str(e)[:80])

        await asyncio.sleep(interval)


# ── TMDB Endpoints ─────────────────────────────────────────────
@app.get("/api/tmdb-genre")
async def tmdb_genre(genreIds: str, page: int = 1):
    """Get movies by TMDB genre IDs."""
    ids = [int(i.strip()) for i in genreIds.split(",") if i.strip().isdigit()]
    if not ids:
        raise HTTPException(400, "genreIds required")
    movies = await _tmdb.discover_by_genre(ids, page)
    return {"genreIds": ids, "page": page, "results": movies}


@app.get("/api/tmdb-trending")
async def tmdb_trending(type: str = "movie", window: str = "week"):
    """Get trending content from TMDB."""
    items = await _tmdb.get_trending(type, window)
    return {"type": type, "window": window, "results": items}


@app.get("/api/poster")
async def get_poster(title: str, type: str = "movie", year: Optional[str] = None):
    """Get poster and metadata for a title."""
    result = await _tmdb.search(title, type, year)
    if result:
        return {"success": True, "data": result}
    return {"success": False, "error": "Not found"}


# ── Cache & Stats ──────────────────────────────────────────────
@app.get("/api/detection-stats")
async def detection_stats():
    """Get detection statistics."""
    sources = {"metadata": 0, "ocr": 0, "clip": 0, "vision": 0, "tmdb_genre": 0, "manual": 0}
    for state in _state.get_all().values():
        if state.last_detection and state.last_source:
            sources[state.last_source] = sources.get(state.last_source, 0) + 1

    return {
        "totalChannels": _state.count,
        "activeChannels": _state.active_count(),
        "sources": sources,
        "caches": _cache.stats(),
        "scanning": len(_scan_tasks),
    }


@app.post("/api/clear-cache")
async def clear_cache():
    """Clear all caches."""
    _cache.poster.clear()
    _cache.detection.clear()
    _cache.embedding.clear()
    _cache.ocr.clear()
    _cache.genre.clear()
    _cache.phash.clear()
    return {"success": True, "message": "All caches cleared"}
