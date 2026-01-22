from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .services.retriever import retrieve_context
from .services.generator import generate_answer


class ChatAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        Expected request body:
        {
            "message": "What is Java?"
        }

        Response:
        {
            "reply": "Java is a programming language...",
            "sources": [...]
        }
        """

        # ✅ Frontend-safe key
        message = request.data.get("message")

        if not message or not isinstance(message, str):
            return Response(
                {"error": "Message is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            # 🔹 Retrieve relevant chunks from vector DB
            context, sources = retrieve_context(message)

            # 🔹 Generate answer using LLM
            answer = generate_answer(
                context=context,
                question=message,
            )

            return Response(
                {
                    "reply": answer,
                    "sources": sources,
                },
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            # ❌ Never crash frontend
            return Response(
                {
                    "error": "AI Tutor failed",
                    "details": str(e),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
