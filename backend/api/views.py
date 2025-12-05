import face_recognition
import numpy as np
import base64
import json
from io import BytesIO
from PIL import Image

from django.core.mail import send_mail
from django.conf import settings
import random

from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from rest_framework import status
from .models import PasswordResetOTP, StudentProfile, QuizQuestion, Module, ExamResult
from .serializers import QuizQuestionSerializer, ModuleSerializer, ExamResultSerializer

# --- HELPER FUNCTION ---
def decode_base64_image(base64_string):
    """
    Converts a base64 string to a numpy array image for face_recognition
    """
    # Remove the data URL prefix if present (e.g., "data:image/jpeg;base64,")
    if ";base64," in base64_string:
        header, data = base64_string.split(';base64,')
    else:
        data = base64_string
    
    try:
        image_data = base64.b64decode(data)
        image = Image.open(BytesIO(image_data)).convert('RGB')
        return np.array(image)
    except Exception as e:
        return None

# --- REGISTER ENDPOINT ---
class RegisterFaceView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        email = request.data.get('email')           # <--- TAMBAHAN: Ambil Email
        full_name = request.data.get('fullName')    # <--- TAMBAHAN: Ambil Nama Lengkap
        image_data = request.data.get('image')

        # Validasi dasar
        if not username or not password or not image_data or not email:
            return Response({"error": "Semua field (termasuk email) wajib diisi."}, status=400)

        # 1. Cek User Exist
        if User.objects.filter(username=username).exists():
            return Response({"error": "Username sudah dipakai"}, status=400)
            
        # 2. Process Image (Tetap sama)
        img_array = decode_base64_image(image_data)
        if img_array is None:
            return Response({"error": "Data gambar tidak valid"}, status=400)

        # 3. Detect Face (Tetap sama)
        face_locations = face_recognition.face_locations(img_array)
        if len(face_locations) == 0:
            return Response({"error": "Wajah tidak terdeteksi. Pastikan pencahayaan cukup."}, status=400)
        
        face_encoding = face_recognition.face_encodings(img_array, face_locations)[0]

        # 4. Create User & Profile (BAGIAN INI YANG DIPERBAIKI)
        try:
            # Simpan username, EMAIL, dan password
            user = User.objects.create_user(
                username=username, 
                email=email,            # <--- PENTING: Simpan email disini
                password=password,
                first_name=full_name    # <--- Opsional: Simpan nama lengkap di first_name
            )
            
            profile = StudentProfile.objects.create(user=user)
            profile.set_encoding(face_encoding.tolist())
            profile.save()

            return Response({"message": "Registrasi Berhasil! Silakan Login."}, status=201)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

# --- LOGIN ENDPOINT ---
class LoginFaceView(APIView):
    def post(self, request):
        username = request.data.get('username')
        image_data = request.data.get('image') # Base64 string

        if not username or not image_data:
            return Response({"error": "Username and face image required"}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Find User
        try:
            profile = StudentProfile.objects.get(user__username=username)
        except StudentProfile.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        # 2. Process Incoming Image
        img_array = decode_base64_image(image_data)
        if img_array is None:
            return Response({"error": "Invalid image data"}, status=status.HTTP_400_BAD_REQUEST)

        # 3. Get Encodings from Incoming Image
        unknown_encodings = face_recognition.face_encodings(img_array)
        if len(unknown_encodings) == 0:
            return Response({"error": "No face detected in camera feed"}, status=status.HTTP_400_BAD_REQUEST)

        # 4. Compare with Stored Encoding
        stored_encoding = profile.get_encoding() # This is a list
        if not stored_encoding:
            return Response({"error": "No face data registered for this user"}, status=status.HTTP_400_BAD_REQUEST)

        # face_recognition expects numpy arrays
        stored_encoding_np = np.array(stored_encoding)
        unknown_encoding_np = unknown_encodings[0]

        # Compare (tolerance 0.6 is standard, lower is stricter)
        results = face_recognition.compare_faces([stored_encoding_np], unknown_encoding_np, tolerance=0.5)

        if results[0]:
            return Response({"status": "success", "message": "Login Successful!"}, status=status.HTTP_200_OK)
        else:
            return Response({"status": "fail", "message": "Face verification failed. Not a match."}, status=status.HTTP_401_UNAUTHORIZED)

# --- SUBMIT EXAM & DSS INTEGRATION ---
class SubmitExamView(APIView):
    def post(self, request):
        # 1. Get Data from React
        username = request.data.get('username')
        module_name = request.data.get('module_name')
        score = int(request.data.get('score'))

        # 2. Get the Student Profile
        try:
            student = StudentProfile.objects.get(user__username=username)
        except StudentProfile.DoesNotExist:
            return Response({"error": "Student not found"}, status=404)

        # 3. Save the Result to Database
        ExamResult.objects.create(student=student, module_name=module_name, score=score)

        # 4. CALL THE DSS ENGINE 🧠
        dss_decision, new_level = analyze_performance(student, module_name, score)

        # 5. Apply the DSS Decision (Update Database)
        if dss_decision['unlock_next']:
            student.current_module_level = new_level
            student.save()

        # 6. Send the Decision back to React Frontend
        return Response({
            "score": score,
            "dss_feedback": dss_decision['message'],
            "next_module_unlocked": dss_decision['unlock_next']
        })

# # --- LOGIKA REKOMENDASI AI SEDERHANA (DSS) ---
# def get_recommendations(interest):
#     if interest == 'AI':
#         return [
#             {"id": 1, "title": "Python for Data Science", "level": "Beginner"},
#             {"id": 2, "title": "Neural Networks 101", "level": "Intermediate"}
#         ]
#     elif interest == 'Cyber Security':
#         return [
#             {"id": 3, "title": "Ethical Hacking Basics", "level": "Beginner"},
#             {"id": 4, "title": "Network Defense", "level": "Advanced"}
#         ]
#     elif interest == 'IoT':
#         return [
#             {"id": 5, "title": "Arduino & Sensors", "level": "Beginner"},
#             {"id": 6, "title": "Smart Home Protocols", "level": "Intermediate"}
#         ]
#     else:
#         return [{"id": 0, "title": "General Computer Science", "level": "All Levels"}]
    
# --- VIEW MODULES LIST ---
@api_view(['GET'])
def get_modules(request):
    modules = Module.objects.all()
    serializer = ModuleSerializer(modules, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_module_detail(request, module_id):
    # Ambil satu modul spesifik berdasarkan ID
    module = get_object_or_404(Module, id=module_id)
    serializer = ModuleSerializer(module)
    return Response(serializer.data)

# --- VIEW DASHBOARD & SURVEY ---
@api_view(['POST'])
def save_interest(request):
    username = request.data.get('username')
    interest = request.data.get('interest')
    
    # 1. Validasi Input
    if not username or not interest:
        return Response({"error": "Username dan Interest wajib diisi."}, status=400)

    try:
        # 2. Cari Profile User
        profile = StudentProfile.objects.get(user__username=username)
        
        # 3. Update Minat
        profile.interest = interest
        profile.save()
        
        # 4. Return Success (Tidak perlu kirim rekomendasi disini, biar Frontend yang refresh)
        return Response({
            "status": "success", 
            "message": f"Minat berhasil diperbarui ke {interest}",
            "current_interest": interest
        })
        
    except StudentProfile.DoesNotExist:
        return Response({"error": "User tidak ditemukan."}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(['GET'])
def get_dashboard_data(request):
    username = request.query_params.get('username')
    try:
        profile = StudentProfile.objects.get(user__username=username)

        # Jika user punya interest, ambil modul dengan kategori tersebut
        if profile.interest:
            recommended_modules = Module.objects.filter(category=profile.interest)[:3] # Ambil 3 teratas
        else:
            recommended_modules = []

        # Serialize data modul
        rec_serializer = ModuleSerializer(recommended_modules, many=True)
        
        #ambil 5 riwayat terakhir
        history = ExamResult.objects.filter(student=profile).order_by('-completed_at')[:5]
        history_serializer = ExamResultSerializer(history, many=True)

        data = {
            "fullName": profile.user.first_name or username,
            "interest": profile.interest,
            "recommendations": rec_serializer.data,
            "history": history_serializer.data
        }
        return Response(data)
    except StudentProfile.DoesNotExist:
        return Response({"error": "User not found"}, status=404)


@api_view(['POST'])
def submit_quiz(request):
    username = request.data.get('username') #kita butuh username sekarang
    module_id = request.data.get('module_id') #kita butuh ID modul
    score = request.data.get('score')
    
    try:
        profile = StudentProfile.objects.get(user__username=username)
        module = Module.objects.get(id=module_id)
        
        # 1. Logika DSS
        status = "Lulus" if score >= 60 else "Remedial"
        message = ""
        
        if score >= 80:
            message = "Luar biasa! Modul lanjutan dibuka."
        elif score >= 60:
            message = "Selamat, Anda lulus."
        else:
            message = "Nilai belum cukup. Silakan pelajari ulang."

        ExamResult.objects.create(
            student=profile,
            module=module,
            score=score,
            status=status
        )
        
        return Response({
            "status": status,
            "message": message,
            "score": score
        })

    except Exception as e:
        print(e)
        return Response({"error": "Gagal menyimpan nilai"}, status=400)


@api_view(['GET'])
def get_quiz_questions(request):
    module_id = request.query_params.get('module_id')

    if module_id:
        questions = QuizQuestion.objects.filter(module__id=module_id)
    else:
        questions = QuizQuestion.objects.all()
    
    serializer = QuizQuestionSerializer(questions, many=True)
    return Response(serializer.data)

#kode otp password reset
@api_view(['POST'])
def request_password_reset(request):
    email = request.data.get('email')
    
    try:
        # Cari user berdasarkan email
        user = User.objects.get(email=email)
        
        # 1. Generate 6 Digit OTP
        otp = str(random.randint(100000, 999999))
        
        # 2. Simpan ke Database (Hapus OTP lama jika ada)
        PasswordResetOTP.objects.filter(user=user).delete()
        PasswordResetOTP.objects.create(user=user, otp_code=otp)
        
        # 3. Kirim Email
        send_mail(
            'EduSecure - Kode Reset Password',
            f'Halo {user.username},\n\nKode OTP untuk reset password Anda adalah: {otp}\n\nJangan berikan kode ini ke siapapun.',
            settings.EMAIL_HOST_USER,
            [email],
            fail_silently=False,
        )
        
        return Response({"status": "success", "message": "OTP telah dikirim ke email Anda."})
        
    except User.DoesNotExist:
        # Demi keamanan, tetap bilang sukses meski email tidak ada (agar hacker tidak bisa cek email terdaftar)
        # Tapi untuk development, kita jujur dulu biar gampang debug
        return Response({"error": "Email tidak terdaftar."}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['POST'])
def verify_and_reset_password(request):
    email = request.data.get('email')
    otp_input = request.data.get('otp')
    new_password = request.data.get('new_password')
    
    try:
        user = User.objects.get(email=email)
        otp_record = PasswordResetOTP.objects.filter(user=user, otp_code=otp_input).first()
        
        if not otp_record:
            return Response({"error": "Kode OTP Salah atau Kadaluarsa."}, status=400)
        
        # Ganti Password
        user.set_password(new_password) # set_password otomatis meng-hash password
        user.save()
        
        # Hapus OTP setelah dipakai
        otp_record.delete()
        
        return Response({"status": "success", "message": "Password berhasil diubah. Silakan login."})
        
    except User.DoesNotExist:
        return Response({"error": "User tidak valid."}, status=404)