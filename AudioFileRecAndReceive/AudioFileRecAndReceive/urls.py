"""
Definition of urls for AudioFileRecAndReceive.
"""

from datetime import datetime
from django.urls import path
from django.contrib import admin
from django.contrib.auth.views import LoginView, LogoutView
from app import forms, views


urlpatterns = [
    path('', views.home, name='home'),

    path('emk/', views.emk, name='emk'),
    path('emk/loadMfccData/', views.loadMfccData, name='loadMfccData'),

    path('recognitionTrainer/', views.recognitionTrainer, name='recognitionTrainer'),
    path('recognitionWorker/', views.recognitionWorker, name='recognitionWorker'),

    path('trainAndWorkWithMic/', views.trainAndWorkWithMic, name='trainAndWorkWithMic'),

    path('audioSplitter/', views.audioSplitter, name='audioSplitter'),

    path('speechSynthesis/', views.speechSynthesis, name='speechSynthesis'),

    path('upload/', views.upload, name='upload'),
    path('speech2Text/', views.speech2Text, name='speech2Text'),

    path('text2Speech/', views.text2Speech, name='text2Speech'),
    path('recognitionTrainer/sendMfccData/', views.sendMfccData, name='sendMfccData'),
    path('recognitionWorker/loadMfccData/', views.loadMfccData, name='loadMfccData'),

    path('testSpeechKITT/', views.testSpeechKITT, name='testSpeechKITT'),
]
