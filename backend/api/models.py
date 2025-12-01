from django.db import models
from django.contrib.auth.models import User
import json

class StudentProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    # Store the 128-dimensional face encoding as a JSON string
    face_encoding = models.TextField(blank=True, null=True)
    interest = models.CharField(max_length=50, blank=True, null=True)
    
    def set_encoding(self, encoding_list):
        # Save numpy array/list as JSON string
        self.face_encoding = json.dumps(encoding_list)

    def get_encoding(self):
        # Convert JSON string back to list
        if self.face_encoding:
            return json.loads(self.face_encoding)
        return None

    def __str__(self):
        return self.user.username

class ExamResult(models.Model):
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE)
    module_name = models.CharField(max_length=100)
    score = models.IntegerField()
    timestamp = models.DateTimeField(auto_now_add=True)