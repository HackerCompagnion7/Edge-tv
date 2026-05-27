"""EDGE Vision Engine Configuration.

Single source of truth for all engine parameters.
No magic numbers. No scattered config.
"""

from dataclasses import dataclass, field
from typing import Dict, List
import os


@dataclass(frozen=True)
class EngineConfig:
    """Immutable engine configuration."""

    # ── FFmpeg Sampler ──────────────────────────────────────────
    ffmpeg_timeout: int = 12                # seconds per frame extraction
    ffmpeg_quality: int = 2                 # JPEG quality (1-31, lower=better)
    ffmpeg_scale: float = 0.5               # downscale factor for extraction
    sample_interval_base: int = 30          # default seconds between samples

    # ── Scene Change (pHash) ───────────────────────────────────
    phash_hash_size: int = 8                # hash size in bits
    phash_threshold: int = 10               # hamming distance threshold
    phash_high_threshold: int = 18          # force re-analyze above this

    # ── OCR (PaddleOCR) ────────────────────────────────────────
    ocr_lang: str = "es"                    # primary OCR language
    ocr_confidence_min: float = 0.45        # minimum OCR confidence
    ocr_use_angle_cls: bool = True          # detect rotated text

    # ── Visual Embeddings (OpenCLIP) ───────────────────────────
    clip_model: str = "ViT-B-32"            # model name
    clip_pretrained: str = "laion2b_s34b_b79k"  # pretrained weights
    clip_similarity_threshold: float = 0.82  # cosine similarity for match
    clip_candidate_threshold: float = 0.70   # lower threshold for candidates

    # ── TMDB ───────────────────────────────────────────────────
    tmdb_api_key: str = ""
    tmdb_access_token: str = ""
    tmdb_base_url: str = "https://api.themoviedb.org/3"
    tmdb_image_base: str = "https://image.tmdb.org/t/p"
    tmdb_timeout: int = 8                   # seconds
    tmdb_poster_size: str = "w500"
    tmdb_backdrop_size: str = "w780"

    # ── Cache ──────────────────────────────────────────────────
    cache_poster_ttl: int = 86400           # 24h
    cache_detection_ttl: int = 3600         # 1h
    cache_embedding_ttl: int = 1800         # 30min
    cache_ocr_ttl: int = 600               # 10min
    cache_genre_ttl: int = 1800             # 30min
    cache_max_size: int = 2000              # max entries per cache

    # ── Channel Scan Intervals (seconds) ───────────────────────
    scan_intervals: Dict[str, int] = field(default_factory=lambda: {
        "sports": 15,
        "movies": 30,
        "series": 45,
        "news": 120,
        "music": 90,
        "kids": 60,
        "francais": 60,
        "default": 60,
    })

    # ── Confidence Thresholds ──────────────────────────────────
    confidence_metadata: float = 0.90
    confidence_ocr: float = 0.65
    confidence_clip: float = 0.80
    confidence_vision: float = 0.70
    confidence_epg: float = 0.50
    confidence_accept: float = 0.55         # minimum to update UI
    confidence_poster: float = 0.60         # minimum to fetch poster

    # ── Cost Governor ──────────────────────────────────────────
    daily_budget: float = 5.0               # USD
    cost_vision_call: float = 0.0025        # per vision API call
    cost_ocr_call: float = 0.0005           # estimated OCR cost

    # ── Pipeline Control ───────────────────────────────────────
    max_concurrent_frames: int = 3          # parallel frame processing
    vision_queue_max: int = 20              # max queued vision calls
    analysis_timeout: int = 25              # total analysis timeout

    # ── Mistral Vision (optional, for high-confidence ID) ──────
    mistral_api_key: str = ""
    mistral_model: str = "pixtral-12b-2409"
    mistral_timeout: int = 20

    # ── Server ─────────────────────────────────────────────────
    host: str = "0.0.0.0"
    port: int = 8900
    cors_origins: List[str] = field(default_factory=lambda: ["*"])

    @classmethod
    def from_env(cls) -> "EngineConfig":
        """Load configuration from environment variables."""
        return cls(
            tmdb_api_key=os.getenv("TMDB_API_KEY", ""),
            tmdb_access_token=os.getenv("TMDB_ACCESS_TOKEN", ""),
            mistral_api_key=os.getenv("MISTRAL_API_KEY", os.getenv("MISTRAL_API", "")),
            host=os.getenv("ENGINE_HOST", "0.0.0.0"),
            port=int(os.getenv("ENGINE_PORT", "8900")),
        )
