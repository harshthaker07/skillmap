from django.urls import path
from .views import AdminCourseListCreateAPIView, AdminAssignCourseAPIView, AdminUserListAPIView, AdminCourseCreateAPIView, AdminCourseDeactivateAPIView, AdminUsersProgressAPIView,AdminCourseUpdateAPIView

urlpatterns = [
    path("users/", AdminUserListAPIView.as_view()),
    path("courses/", AdminCourseListCreateAPIView.as_view()),
    path("assign-course/", AdminAssignCourseAPIView.as_view()),
    path("courses/create/", AdminCourseCreateAPIView.as_view()),
    path("users-progress/",AdminUsersProgressAPIView.as_view()),
    path("courses/update/<int:course_id>/", AdminCourseUpdateAPIView.as_view()),
    path("courses/remove/<int:course_id>/", AdminCourseDeactivateAPIView.as_view()),
]
