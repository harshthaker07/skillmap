import os
from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
QDRANT_PATH = os.path.abspath(os.path.join(BASE_DIR, "../../vectordb"))
COLLECTION_NAME = "skillmap_knowledge"

model = SentenceTransformer("BAAI/bge-base-en-v1.5")
client = QdrantClient(path=QDRANT_PATH)

def retrieve_context(question, top_k=3):
    query_vector = model.encode(question, normalize_embeddings=True)

    results = client.query_points(
        collection_name=COLLECTION_NAME,
        query=query_vector,
        limit=top_k
    )

    contexts = []
    sources = set()

    for point in results.points:
        contexts.append(point.payload["text"])
        sources.add(point.payload["source"])

    return "\n\n".join(contexts), list(sources)
