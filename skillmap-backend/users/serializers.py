from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from django.contrib.auth import get_user_model

from .models import Profile

User = get_user_model()


class SignupSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        required=True,
        validators=[
            UniqueValidator(
                queryset=User.objects.all(),
                message="This email is already registered."
            )
        ]
    )


    role = serializers.ChoiceField(choices=User.ROLE_CHOICES, default="student")

    class Meta:
        model = User
        fields = ["username", "email", "password", "role"]
        extra_kwargs = {
            "password": {"write_only": True}
        }

    def create(self, validated_data):
        role = validated_data.get("role", "student")
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
            role=role,
        )
        return user



class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username")
    email = serializers.EmailField(source="user.email")
    role = serializers.CharField(source="user.role")

    class Meta:
        model = Profile
        fields = [
            "username",
            "email",
            "role",
            "designation",
            "skills",
            "avatar",
        ]
