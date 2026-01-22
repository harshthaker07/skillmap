import os
from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient

# ---------------- CONFIG ----------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

QDRANT_PATH = os.path.abspath(os.path.join(BASE_DIR, "../vectordb"))
COLLECTION_NAME = "skillmap_knowledge"
MODEL_NAME = "BAAI/bge-base-en-v1.5"

model = SentenceTransformer(MODEL_NAME)

client = QdrantClient(path=QDRANT_PATH)

query = "Explain Django request lifecycle"

query_vector = model.encode(
    query,
    normalize_embeddings=True
)

results = client.query_points(
    collection_name=COLLECTION_NAME,
    query=query_vector,
    limit=3
)

print("\n🔍 QUERY:", query)
print("\n📌 TOP RESULTS:\n")

for idx, point in enumerate(results.points, start=1):
    print(f"Result {idx}:")
    print(point.payload["text"])
    print("SOURCE:", point.payload["source"])
    print("-" * 60)

client.close()
