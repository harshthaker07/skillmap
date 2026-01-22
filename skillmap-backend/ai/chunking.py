import os
import json
from langchain_text_splitters import RecursiveCharacterTextSplitter

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
CHUNKS_DIR = os.path.join(BASE_DIR, "chunks")

os.makedirs(CHUNKS_DIR, exist_ok=True)

splitter = RecursiveCharacterTextSplitter(
    chunk_size=320,
    chunk_overlap=40,
    separators=["\n\n\n", "\n\n", "\n", ". ", " "]
)

all_chunks = []
chunk_counter = 0

for filename in os.listdir(DATA_DIR):
    if filename.endswith(".txt"):
        with open(os.path.join(DATA_DIR, filename), "r", encoding="utf-8") as f:
            text = f.read()

        chunks = splitter.split_text(text)
        for chunk in chunks:
            all_chunks.append({
                "id": f"{filename}_{chunk_counter}",
                "text": chunk,
                "source": filename
            })
            chunk_counter += 1

# Save to JSON
with open(os.path.join(CHUNKS_DIR, "chunks.json"), "w", encoding="utf-8") as f:
    json.dump(all_chunks, f, indent=2)

print(f"✅ Saved {len(all_chunks)} chunks to chunks.json")
