from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings


class User(AbstractUser):

    ROLE_CHOICES = (
        ("admin", "Admin"),
        ("instructor", "Instructor"),
        ("student", "Student"),
    )

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default="student",
    )

    def __str__(self):
        return self.username


class Profile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profile",
    )
    designation = models.CharField(max_length=100, blank=True)
    skills = models.JSONField(default=list, blank=True)  # ✅ FIX
    avatar = models.ImageField(upload_to="avatars/", blank=True, null=True)

    def __str__(self):
        return self.user.username
