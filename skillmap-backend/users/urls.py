from django.urls import path
from .views import SignupAPIView, LoginAPIView, LogoutAPIView, UsernameSuggestionAPIView,ProfileAPIView,UpdateProfileAPIView,UpdateAvatarAPIView

urlpatterns = [
     # FUNCTION-BASED VIEWS
    path("signup/", SignupAPIView),
    path("logout/", LogoutAPIView),
    path("profile/", ProfileAPIView),
    path("profile/update/", UpdateProfileAPIView),
    path("profile/avatar/", UpdateAvatarAPIView),

    # CLASS-BASED VIEWS
    path("login/", LoginAPIView.as_view()),
    path("username-suggestions/", UsernameSuggestionAPIView.as_view()),

]
