from django.db import models

class Course(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Section(models.Model):
    course = models.ForeignKey(
        Course,
        related_name="sections",
        on_delete=models.CASCADE
    )
    title = models.CharField(max_length=200)
    order = models.PositiveIntegerField()

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"{self.course.title} → {self.title}"

class Lesson(models.Model):
    section = models.ForeignKey(
        Section,
        related_name="lessons",
        on_delete=models.CASCADE
    )
    title = models.CharField(max_length=200)
    content = models.TextField()
    xp = models.PositiveIntegerField(default=10)
    order = models.PositiveIntegerField()

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return self.title

from django.conf import settings

class LessonProgress(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE)
    completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ("user", "lesson")

from django.conf import settings

User = settings.AUTH_USER_MODEL

class CourseAssignment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    assigned_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ("user", "course")

    def __str__(self):
        return f"{self.user} → {self.course}"
    
class Topic(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="topics")
    title = models.CharField(max_length=255)
    order = models.PositiveIntegerField()

    def __str__(self):
        return f"{self.course.title} - {self.title}"

class TopicProgress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE)
    completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ("user", "topic")

    def __str__(self):
        return f"{self.user} - {self.topic} - {self.completed}"


class XPLog(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )
    xp = models.IntegerField()
    reason = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} +{self.xp}"