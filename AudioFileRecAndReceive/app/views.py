"""
Definition of views.
"""

from datetime import datetime
from django.shortcuts import render
from django.http import HttpRequest, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json

def home(request):
    #return HttpResponse('<h1></h1>')
    return render(
        request,
        'app/index.html',
        {
            'title':'Home Page',
            'year':datetime.now().year,
        }
    )

@csrf_exempt
def upload(request):
 
    customHeader = request.META['HTTP_MYCUSTOMHEADER']
 
    # obviously handle correct naming of the file and place it somewhere like media/uploads/
    uploadedFile = open("recording.ogg", "wb")
    # the actual file is in request.body
    uploadedFile.write(request.body)
    uploadedFile.close()
    # put additional logic like creating a model instance or something like this here
    return HttpResponse("")

@csrf_exempt
def receiveJson(request):
    uploadedFile = open("data.json", "wb")
    # the actual file is in request.body
    uploadedFile.write(request.body)
    uploadedFile.close()
    #"email": "hey@mail.com", "password": "101010"
    return JsonResponse({'email':'django@mail.com', 'password':'django'})