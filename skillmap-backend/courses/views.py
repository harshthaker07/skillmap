from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework import status
from django.db.models import Count, Q, Sum
from .models import Course, CourseAssignment, Topic, TopicProgress
from .serializers import CourseSerializer, SectionSerializer, LessonSerializer
from django.utils import timezone
from django.db.models.functions import TruncMonth


# ============================
# STUDENT: MY COURSES
# ============================
class MyCoursesAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        assignments = CourseAssignment.objects.filter(
            user=request.user,
            is_active=True
        ).select_related("course")

        completed_topic_ids = set(
            TopicProgress.objects.filter(
                user=request.user,
                completed=True
            ).values_list("topic__course_id", flat=True)
        )

        data = []
        for a in assignments:
            data.append({
                "id": a.course.id,
                "title": a.course.title,
                "completed": a.course.id in completed_topic_ids,
            })

        return Response(data)

# ============================
# ADMIN: LIST ALL COURSES
# ============================
class CourseListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        courses = Course.objects.all()
        serializer = CourseSerializer(courses, many=True)
        return Response(serializer.data)


       
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from courses.models import CourseAssignment, TopicProgress

class StudentProgressAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        active_assignments = CourseAssignment.objects.filter(
            user=request.user,
            is_active=True,
            course__is_active=True
        )

        total_assigned = active_assignments.count()

        if total_assigned == 0:
            return Response({
                "total_courses": 0,
                "completed_courses": 0,
                "progress": 0,
                "xp": 0,
            })

        completed_courses = TopicProgress.objects.filter(
            user=request.user,
            completed=True,
            topic__course__in=active_assignments.values("course")
        ).values("topic__course").distinct().count()

        progress = min(
            int((completed_courses / total_assigned) * 100),
            100
        )

        xp = completed_courses * 50

        return Response({
            "total_courses": total_assigned,
            "completed_courses": completed_courses,
            "progress": progress,
            "xp": xp,
        })

from django.utils import timezone

class CompleteTopicAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, topic_id):
        try:
            course = Course.objects.get(id=topic_id)

            topic, _ = Topic.objects.get_or_create(
                course=course,
                title=course.title,
                order=1
            )

            progress, _ = TopicProgress.objects.get_or_create(
                user=request.user,
                topic=topic
            )

            progress.completed = True
            progress.completed_at = timezone.now()
            progress.save()

            return Response({"message": "Course completed"})

        except Course.DoesNotExist:
            return Response(
                {"error": "Course not found"},
                status=400
            )

class AdminCourseAPIView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        serializer = CourseSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(created_by=request.user)
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

class AdminSectionAPIView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        serializer = SectionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

class AdminLessonAPIView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        serializer = LessonSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
