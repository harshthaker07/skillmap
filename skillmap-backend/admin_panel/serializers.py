from rest_framework import serializers
from courses.models import Course, CourseAssignment
from django.contrib.auth import get_user_model

User = get_user_model()

class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ["id", "title", "description", "is_active"]

    def validate_title(self, value):
        if len(value.strip()) < 3:
            raise serializers.ValidationError(
                "Course title must be at least 3 characters long."
            )
        return value


class CourseAssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseAssignment
        fields = ["user", "course"]

    def validate(self, data):
        user = data["user"]
        course = data["course"]

        # 1️⃣ Prevent duplicate assignment
        if CourseAssignment.objects.filter(
            user=user, course=course
        ).exists():
            raise serializers.ValidationError(
                "This course is already assigned to this user."
            )

        # 2️⃣ Prevent assigning inactive course
        if not course.is_active:
            raise serializers.ValidationError(
                "Cannot assign an inactive course."
            )

        # 3️⃣ Optional: Prevent assigning course to admin
        if user.role == "admin":
            raise serializers.ValidationError(
                "Courses cannot be assigned to admin users."
            )

        return data
