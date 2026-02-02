from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
# from ai_tutor.permissions import IsAdmin
from users.permissions import IsAdmin
from .serializers import CourseSerializer, CourseAssignmentSerializer
from courses.models import Course, CourseAssignment, TopicProgress, Lesson, LessonProgress

User = get_user_model()


class AdminCourseListCreateAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        courses = Course.objects.filter(is_active=True)
        # courses = Course.objects.all()
        serializer = CourseSerializer(courses, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = CourseSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class AdminAssignCourseAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request):
        serializer = CourseAssignmentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"message": "Course assigned successfully"},
            status=status.HTTP_201_CREATED
        )

class AdminUserListAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        users = User.objects.filter(role="student")
        data = [
            {
                "id": u.id,
                "username": u.username,
                "email": u.email,
            }
            for u in users
        ]
        return Response(data)
    
    
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from users.permissions import IsAdmin
from courses.models import Course

class AdminCourseCreateAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request):
        title = request.data.get("title")
        description = request.data.get("description", "")

        if not title:
            return Response(
                {"error": "Title is required"},
                status=400
            )

        course = Course.objects.create(
            title=title,
            description=description
        )

        return Response(
            {
                "id": course.id,
                "title": course.title
            },
            status=201
        )


class AdminCourseDeactivateAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, course_id):
        try:
            course = Course.objects.get(id=course_id)

            # 🔥 Soft delete course globally
            course.is_active = False
            course.save()

            # 🔥 Deactivate all assignments
            CourseAssignment.objects.filter(
                course=course
            ).update(is_active=False)

            return Response({
                "message": "Course removed globally"
            })

        except Course.DoesNotExist:
            return Response(
                {"error": "Course not found"},
                status=404
            )
            
            
class AdminUsersProgressAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        users_data = []

        users = User.objects.all()

        for user in users:
            assignments = CourseAssignment.objects.filter(
                user=user,
                is_active=True,
                course__is_active=True
            )

            # Retrieve list of course IDs for this user
            course_ids = assignments.values_list('course_id', flat=True)

            # Total lessons in these courses
            total_lessons = Lesson.objects.filter(
                section__course__in=course_ids
            ).count()

            # Completed lessons by this user in these courses
            completed_lessons = LessonProgress.objects.filter(
                user=user,
                completed=True,
                lesson__section__course__in=course_ids
            ).count()

            # Progress calculation
            progress = int(
                (completed_lessons / total_lessons) * 100
            ) if total_lessons > 0 else 0

            courses = []
            for a in assignments:
                # Check if course is fully completed (simplistic check: user completed all lessons in it)
                # Or we can stick to previous logic if needed. Let's check lesson completion for this specific course.
                
                c_total = Lesson.objects.filter(section__course=a.course).count()
                c_done = LessonProgress.objects.filter(
                    user=user, 
                    completed=True, 
                    lesson__section__course=a.course
                ).count()
                
                is_completed = (c_total > 0 and c_total == c_done)

                courses.append({
                    "id": a.course.id,
                    "title": a.course.title,
                    "completed": is_completed,
                })

            users_data.append({
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "progress": min(progress, 100),
                "courses": courses,  
            })

        return Response(users_data)
    
    
class AdminCourseUpdateAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def put(self, request, course_id):
        try:
            course = Course.objects.get(id=course_id, is_active=True)
        except Course.DoesNotExist:
            return Response(
                {"error": "Course not found"},
                status=404
            )

        title = request.data.get("title")
        description = request.data.get("description", "")

        if not title:
            return Response(
                {"error": "Title is required"},
                status=400
            )

        course.title = title
        course.description = description
        course.save()

        return Response({
            "id": course.id,
            "title": course.title,
            "description": course.description,
        })