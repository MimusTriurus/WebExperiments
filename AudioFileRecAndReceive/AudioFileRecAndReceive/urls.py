"""
Definition of urls for AudioFileRecAndReceive.
"""

from datetime import datetime
from django.urls import path
from django.contrib import admin
from django.contrib.auth.views import LoginView, LogoutView
from app import forms, views


urlpatterns = [
    path('', views.audioSplitter, name='home'),
    path('upload/', views.upload, name='upload'),

    path('sendMfccData/', views.sendMfccData, name='sendMfccData'),
    path('loadMfccData/', views.loadMfccData, name='loadMfccData'),
]
