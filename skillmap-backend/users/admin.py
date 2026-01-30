from django.contrib import admin
from django.contrib.auth import get_user_model
from .models import Profile

User = get_user_model()

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "designation","skills")
    search_fields = ("user__username", "user__email","user__skills  ")


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("username", "email", "role", "is_active", "is_staff")
    search_fields = ("username", "email", "role")

