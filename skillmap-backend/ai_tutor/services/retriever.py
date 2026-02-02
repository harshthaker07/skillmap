import os
import logging
from typing import Tuple, List

logger = logging.getLogger(__name__)

# Defer heavy imports until needed and handle failures gracefully
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
QDRANT_PATH = os.path.abspath(os.path.join(BASE_DIR, "../../vectordb"))
COLLECTION_NAME = "skillmap_knowledge"

_model = None
_client = None


def get_model():
    global _model
    if _model is not None:
        return _model
    try:
        from sentence_transformers import SentenceTransformer
        _model = SentenceTransformer("BAAI/bge-base-en-v1.5")
        return _model
    except Exception as e:
        logger.warning("Failed to initialize SentenceTransformer: %s", e)
        _model = None
        return None


def get_client():
    global _client
    if _client is not None:
        return _client
    try:
        from qdrant_client import QdrantClient
        _client = QdrantClient(path=QDRANT_PATH)
        return _client
    except Exception as e:
        logger.warning("Failed to initialize QdrantClient (local vectordb may be locked): %s", e)
        _client = None
        return None


def retrieve_context(question: str, top_k: int = 3) -> Tuple[str, List[str]]:
    """Return concatenated context strings and list of sources. If vector DB or model is unavailable,
    return an empty context and empty sources list so callers can degrade gracefully."""
    model = get_model()
    client = get_client()

    if model is None or client is None:
        logger.debug("Model or client not available; returning empty context")
        return "", []

    try:
        query_vector = model.encode(question, normalize_embeddings=True)

        results = client.query_points(
            collection_name=COLLECTION_NAME,
            query=query_vector,
            limit=top_k
        )

        contexts = []
        sources = set()

        for point in getattr(results, "points", []):
            payload = getattr(point, "payload", {})
            contexts.append(payload.get("text", ""))
            if payload.get("source"):
                sources.add(payload.get("source"))

        return "\n\n".join([c for c in contexts if c]), list(sources)
    except Exception as e:
        logger.exception("Error while querying Qdrant: %s", e)
        return "", []

