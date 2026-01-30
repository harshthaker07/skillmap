from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework import status
from django.db.models import Count, Q, Sum
from .models import Course, CourseAssignment, Topic, TopicProgress, Lesson, LessonProgress, XPLog
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

from users.permissions import IsAdmin

class AdminCourseAPIView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request):
        serializer = CourseSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

class AdminSectionAPIView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request):
        serializer = SectionSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

class AdminLessonAPIView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request):
        serializer = LessonSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

class CompleteLessonAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, lesson_id):
        try:
            lesson = Lesson.objects.select_related("section__course").get(id=lesson_id)

            # 🔐 CHECK COURSE ASSIGNMENT
            if not CourseAssignment.objects.filter(
                user=request.user,
                course=lesson.section.course,
                is_active=True
            ).exists():
                return Response(
                    {"error": "You are not enrolled in this course"},
                    status=status.HTTP_403_FORBIDDEN
                )

            progress, _ = LessonProgress.objects.get_or_create(
                user=request.user,
                lesson=lesson
            )

            if not progress.completed:
                progress.completed = True
                progress.completed_at = timezone.now()
                progress.save()

                XPLog.objects.create(
                    user=request.user,
                    xp=lesson.xp,
                    reason=f"Completed lesson: {lesson.title}"
                )

            return Response(
                {"message": "Lesson completed", "xp_earned": lesson.xp}
            )

        except Lesson.DoesNotExist:
            return Response(
                {"error": "Lesson not found"},
                status=status.HTTP_404_NOT_FOUND
            )

class StudentProgressAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        active_assignments = CourseAssignment.objects.filter(
            user=request.user,
            is_active=True,
            course__is_active=True
        )

        course_ids = active_assignments.values_list('course_id', flat=True)
        
        # Calculate totals based on Lessons, not Topics
        total_lessons = Lesson.objects.filter(
            section__course__in=course_ids
        ).count()

        completed_lessons = LessonProgress.objects.filter(
            user=request.user,
            completed=True,
            lesson__section__course__in=course_ids
        ).count()

        progress = min(
            int((completed_lessons / total_lessons) * 100),
            100
        ) if total_lessons > 0 else 0

        # Calculate XP from logs
        total_xp = XPLog.objects.filter(user=request.user).aggregate(Sum('xp'))['xp__sum'] or 0

        # XP history by month (for XP graph)
        xp_logs = (
            XPLog.objects.filter(user=request.user)
            .annotate(month=TruncMonth('created_at'))
            .values('month')
            .annotate(xp=Sum('xp'))
            .order_by('month')
        )
        xp_history = [
            {"month": x['month'].strftime('%Y-%m'), "xp": x['xp']} for x in xp_logs if x['month']
        ]

        return Response({
            "total_courses": total_lessons,
            "completed_courses": completed_lessons,
            "progress": progress,
            "xp": total_xp,
            "xp_history": xp_history,
        })


class CourseContentAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, course_id):
        try:
            # Optimize query to fetch nested relations
            course = Course.objects.prefetch_related("sections__lessons").get(id=course_id)
            # Pass context for get_completed method in LessonSerializer
            serializer = CourseSerializer(course, context={"request": request})
            return Response(serializer.data)
        except Course.DoesNotExist:
            return Response({"error": "Course not found"}, status=404)
