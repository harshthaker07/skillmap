import os
import json
from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, Distance, PointStruct

# ---------------- CONFIG ----------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

CHUNKS_FILE = os.path.join(BASE_DIR, "chunks", "chunks.json")
QDRANT_PATH = os.path.abspath(os.path.join(BASE_DIR, "../vectordb"))
COLLECTION_NAME = "skillmap_knowledge"
MODEL_NAME = "BAAI/bge-base-en-v1.5"
# ----------------------------------------

# 1️⃣ Load chunks
with open(CHUNKS_FILE, "r", encoding="utf-8") as f:
    chunks = json.load(f)

texts = [c["text"] for c in chunks]

print(f"✅ Loaded {len(texts)} chunks")

# 2️⃣ Load embedding model
model = SentenceTransformer(MODEL_NAME)

embeddings = model.encode(
    texts,
    normalize_embeddings=True,
    show_progress_bar=True
)

VECTOR_SIZE = embeddings.shape[1]

# 3️⃣ Initialize Qdrant (local persistent)
client = QdrantClient(path=QDRANT_PATH)

# 4️⃣ Create collection if not exists
existing = [c.name for c in client.get_collections().collections]

if COLLECTION_NAME not in existing:
    client.create_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=VectorParams(
            size=VECTOR_SIZE,
            distance=Distance.COSINE
        )
    )

# 5️⃣ Prepare points
points = []

for idx, chunk in enumerate(chunks):
    points.append(
        PointStruct(
            id=idx,
            vector=embeddings[idx],
            payload={
                "text": chunk["text"],
                "source": chunk["source"],
                "chunk_id": chunk["id"]
            }
        )
    )

# 6️⃣ Store embeddings
client.upsert(
    collection_name=COLLECTION_NAME,
    points=points
)

print("✅ BAAI embeddings stored in Qdrant successfully")

# 7️⃣ Close client (Windows safe)
client.close()
