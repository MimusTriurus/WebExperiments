"""
Definition of urls for AudioFileRecAndReceive.
"""

from datetime import datetime
from django.urls import path
from django.contrib import admin
from django.contrib.auth.views import LoginView, LogoutView
from app import forms, views


urlpatterns = [
    #path('', psJsVIew.homePocketsphinx, name='home')#,
    path('', views.home, name='home'),
    path('upload/', views.upload, name='upload'),
    path('receiveJson/', views.receiveJson, name='receiveJson'),
    #path('login/',
         #LoginView.as_view
         #(
             #template_name='app/login.html',
             #authentication_form=forms.BootstrapAuthenticationForm,
             #extra_context=
             #{
                 #'title': 'Log in',
                 #'year' : datetime.now().year,
             #}
         #),
         #name='login'),
    #path('logout/', LogoutView.as_view(next_page='/'), name='logout'),
    #path('admin/', admin.site.urls),
]
