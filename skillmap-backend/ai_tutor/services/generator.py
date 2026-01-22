# def generate_answer(context: str, question: str):
#     if not context.strip():
#         return "I don't have enough information to answer this question."

#     return f"""
# Answer the question using ONLY the context below.

# Context:
# {context}

# Question:
# {question}

# Provide a clear, concise explanation.
# """.strip()

from .llm import generate_completion


def generate_answer(context: str, question: str) -> str:
    if not context or not context.strip():
        return "I don't have enough information to answer this question."

    system_rules = """
You are an AI tutor.

RULES:
- Use ONLY the provided information.
- Give ONE clear, concise answer.
- Do NOT repeat information.
- Do NOT give multiple explanations.
- Do NOT mention sources or context.
- If the answer is not present, say:
  "I don't have enough information to answer this question."

STYLE:
- Single paragraph
- Maximum 6-8 sentences
- Simple, student-friendly language
"""

    prompt = f"""
{system_rules}

Information:
{context}

Question:
{question}

Answer:
"""

    return generate_completion(prompt)
