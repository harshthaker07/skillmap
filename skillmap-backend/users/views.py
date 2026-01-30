import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from rest_framework.permissions import IsAuthenticated
from .serializers import SignupSerializer
from rest_framework.decorators import api_view, permission_classes
from .serializers import ProfileSerializer
from .models import Profile
from django.db import IntegrityError
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate

from django.contrib.auth import get_user_model
User = get_user_model()

logger = logging.getLogger(__name__)


class LoginAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        user = authenticate(username=username, password=password)

        if not user:
            return Response(
                {"detail": "Invalid credentials"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        refresh = RefreshToken.for_user(user)

        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "role": user.role
        })

# class LoginAPIView(APIView):
#     def post(self, request):
#         try:
#             username = request.data.get("username")
#             password = request.data.get("password")

#             if not username or not password:
#                 return Response(
#                     {"detail": "Username and password are required"},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )

#             user = authenticate(username=username, password=password)

#             if not user:
#                 return Response(
#                     {"detail": "Invalid credentials"},
#                     status=status.HTTP_401_UNAUTHORIZED
#                 )

#             # ✅ Inactive user check
#             if not user.is_active:
#                 return Response(
#                     {"detail": "User account is disabled"},
#                     status=status.HTTP_403_FORBIDDEN
#                 )

#             token, _ = Token.objects.get_or_create(user=user)
#             return Response({"token": token.key}, status=status.HTTP_200_OK)

#         except Exception as e:
#             logger.error(f"Login error: {str(e)}")
#             return Response(
#                 {"detail": "Internal server error"},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )

@api_view(["POST"])
@permission_classes([AllowAny])
def SignupAPIView(request):
    username = request.data.get("username")
    email = request.data.get("email")
    password = request.data.get("password")

    role = request.data.get("role", "student")
    first_name = request.data.get("first_name", "")
    last_name = request.data.get("last_name", "")

    if not username or not email or not password:
        return Response(
            {"error": "All fields are required"},
            status=400
        )

    if User.objects.filter(username=username).exists():
        return Response(
            {"error": "Username already exists"},
            status=400
        )

    if User.objects.filter(email=email).exists():
        return Response(
            {"error": "Email already exists"},
            status=400
        )


    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        role=role
    )
    user.first_name = first_name
    user.last_name = last_name
    user.save()

    return Response(
        {"message": "User created successfully"},
        status=201
    )

# user name geneartion for same username if existed 

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def LogoutAPIView(request):
    return Response(
        {"message": "Logout successful. "},
        status=200
    )

class UsernameSuggestionAPIView(APIView):
    def post(self, request):
        base_username = request.data.get("username")

        if not base_username:
            return Response(
                {"detail": "Username is required"},
                status=400
            )

        if not User.objects.filter(username=base_username).exists():
            return Response(
                {"available": True, "username": base_username}
            )

        # Generate suggestions
        suggestions = []
        counter = 1
        while len(suggestions) < 5:
            suggestion = f"{base_username}_{counter}"
            if not User.objects.filter(username=suggestion).exists():
                suggestions.append(suggestion)
            counter += 1

        return Response(
            {
                "available": False,
                "suggestions": suggestions
            }
        )
        

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def ProfileAPIView(request):
    profile, _ = Profile.objects.get_or_create(user=request.user)
    serializer = ProfileSerializer(profile)
    return Response(serializer.data)

@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def UpdateProfileAPIView(request):
    profile, _ = Profile.objects.get_or_create(user=request.user)

    profile.designation = request.data.get(
        "designation", profile.designation
    )
    profile.skills = request.data.get(
        "skills", profile.skills
    )

    profile.save()

    serializer = ProfileSerializer(profile)
    return Response(serializer.data)

@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def UpdateAvatarAPIView(request):
    profile, _ = Profile.objects.get_or_create(user=request.user)

    if "avatar" in request.FILES:
        profile.avatar = request.FILES["avatar"]
        profile.save()

    serializer = ProfileSerializer(profile)
    return Response(serializer.data)
