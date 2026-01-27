from rest_framework import serializers
from .models import Course, CourseAssignment,Lesson, LessonProgress, Section

class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ["id", "title", "description"]


class CourseAssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseAssignment
        fields = ["id", "user", "course"]

class LessonSerializer(serializers.ModelSerializer):
    completed = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = ["id", "title", "xp", "completed", "section", "order"]

    def get_completed(self, obj):
        user = self.context["request"].user
        return LessonProgress.objects.filter(
            user=user, lesson=obj, completed=True
        ).exists()

class SectionSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True)

    class Meta:
        model = Section
        fields = ["id", "title", "lessons", "course", "order"]

class CourseSerializer(serializers.ModelSerializer):
    sections = SectionSerializer(many=True, read_only=True)

    class Meta:
        model = Course
        fields = ["id", "title", "description", "sections"]
