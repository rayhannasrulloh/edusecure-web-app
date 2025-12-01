from rest_framework import serializers
from .models import StudentProfile, QuizQuestion, Module, ExamResult

class ModuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Module
        fields = '__all__'

class StudentProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentProfile
        fields = '__all__'

class QuizQuestionSerializer(serializers.ModelSerializer):
    # Kita buat field custom 'options' agar sesuai dengan frontend React
    options = serializers.SerializerMethodField()
    answer = serializers.IntegerField(source='correct_option_index')
    question = serializers.CharField(source='question_text')

    class Meta:
        model = QuizQuestion
        fields = ['question', 'options', 'answer'] #Hanya kirim yang dibutuhkan React

    def get_options(self, obj):
        return [obj.option_1, obj.option_2, obj.option_3, obj.option_4]
    
class ExamResultSerializer(serializers.ModelSerializer):
    module_title = serializers.CharField(source='module.title', read_only=True)
    
    class Meta:
        model = ExamResult
        fields = ['module_title', 'score', 'status', 'completed_at']