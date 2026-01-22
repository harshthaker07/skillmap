from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path("api/auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path('admin/', admin.site.urls),
    path("api/ai/", include("ai_tutor.urls")),
    path("api/admin/", include("admin_panel.urls")),
    # path("api/users/", include("users.urls")),
    # path('api/auth/', include('users.urls')),
    path("api/users/", include("users.urls")),
    path("api/courses/", include("courses.urls")),

]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)