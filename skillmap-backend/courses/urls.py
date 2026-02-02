from django.urls import path
from .views import (
    MyCoursesAPIView,
    CourseListAPIView,
    StudentProgressAPIView,
    CompleteTopicAPIView,
    AdminCourseAPIView,
    AdminSectionAPIView,
    AdminLessonAPIView,
    CourseContentAPIView,
    CompleteLessonAPIView,
    EnrollCourseAPIView,
)

urlpatterns = [
    path("", CourseListAPIView.as_view()),
    path("my-courses/", MyCoursesAPIView.as_view()),
    path("progress/", StudentProgressAPIView.as_view()),
    path("complete-topic/<int:topic_id>/", CompleteTopicAPIView.as_view()),
    path("lessons/<int:lesson_id>/complete/", CompleteLessonAPIView.as_view()),
    path("admin/course/", AdminCourseAPIView.as_view()),
    path("admin/section/", AdminSectionAPIView.as_view()),  
    path("admin/lesson/", AdminLessonAPIView.as_view()),
    path("<int:course_id>/content/", CourseContentAPIView.as_view()),
    path("enroll/<int:course_id>/", EnrollCourseAPIView.as_view()),
]
