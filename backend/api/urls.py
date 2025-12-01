"""
URL configuration for edusecure project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.urls import path
from .views import RegisterFaceView, LoginFaceView, save_interest, get_dashboard_data, submit_quiz, get_modules, get_quiz_questions, get_module_detail

urlpatterns = [
    path('register/', RegisterFaceView.as_view(), name='register'),
    path('login/', LoginFaceView.as_view(), name='login'),
    path('save-interest/', save_interest, name='save_interest'),
    path('dashboard/', get_dashboard_data, name='get_dashboard_data'),
    path('submit-quiz/', submit_quiz, name='submit_quiz'),
    path('modules/', get_modules, name='get_modules'),
    path('questions/', get_quiz_questions, name='get_quiz_questions'),
    path('modules/<int:module_id>/', get_module_detail, name='module_detail'),
]