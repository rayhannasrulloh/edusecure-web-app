from rest_framework import serializers
from .models import StudentProfile, QuizQuestion, Module, ExamResult

class ModuleSerializer(serializers.ModelSerializer):
    is_locked = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()

    class Meta:
        model = Module
        fields = '__all__' # Ini akan otomatis menyertakan is_locked dan status

    def get_is_locked(self, obj):
        # Ambil username dari URL parameter (?username=...)
        request = self.context.get('request')
        username = request.query_params.get('username')
        
        # Jika tidak ada username, anggap terkunci (kecuali modul 1)
        if not username:
             return obj.order != 1

        if obj.order == 1:
            return False
            
        try:
            prev_module_order = obj.order - 1
            
            # Cari berdasarkan username dari parameter
            profile = StudentProfile.objects.get(user__username=username)
            
            prev_result = ExamResult.objects.filter(
                student=profile, 
                module__order=prev_module_order, 
                status="Lulus"
            ).exists()
            
            return not prev_result
        except:
            return True

    def get_status(self, obj):
        request = self.context.get('request')
        username = request.query_params.get('username')
        
        if not username: return "Not Started"

        try:
            profile = StudentProfile.objects.get(user__username=username)
            result = ExamResult.objects.filter(student=profile, module=obj).last()
            return result.status if result else "Not Started"
        except:
            return "Not Started"

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