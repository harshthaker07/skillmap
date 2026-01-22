from django.contrib import admin
from .models import Course, Topic, CourseAssignment, TopicProgress

admin.site.register(Course)
admin.site.register(Topic)
admin.site.register(CourseAssignment)
admin.site.register(TopicProgress)
