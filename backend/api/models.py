from django.db import models
from django.contrib.auth.models import User
import json

class Module(models.Model):
    CATEGORY_CHOICES = [
        ('AI', 'Artificial Intelligence'),
        ('Cyber Security', 'Cyber Security'),
        ('IoT', 'Internet of Things'),
        ('General', 'General'),
    ]

    title = models.CharField(max_length=200)
    description = models.CharField(max_length=500)
    level = models.CharField(max_length=50, default="Beginner") # e.g., Beginner, Intermediate
    content = models.TextField(blank=True, null=True, help_text="Fill the material learning content here.")
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='General')
    order = models.IntegerField(default=1, help_text="Module sequences (1, 2, 3...)")

    class Meta:
        ordering = ['order']
    
    
    def __str__(self):
        return f"{self.title}.{self.title}"

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


class QuizQuestion(models.Model):
    #hubungin soal ke modul tertentu
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='questions', null=True) 
    
    question_text = models.CharField(max_length=255)
    option_1 = models.CharField(max_length=200)
    option_2 = models.CharField(max_length=200)
    option_3 = models.CharField(max_length=200)
    option_4 = models.CharField(max_length=200)
    correct_option_index = models.IntegerField()

    def __str__(self):
        return self.question_text

class ExamResult(models.Model):
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE)
    module = models.ForeignKey(Module, on_delete=models.CASCADE)
    score = models.IntegerField()
    status = models.CharField(max_length=20) # 'Lulus' atau 'Remedial'
    completed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student.user.username} - {self.module.title}: {self.score}"
    

class PasswordResetOTP(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    otp_code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.otp_code}"