"""
Definition of views.
"""

from datetime import datetime
from django.shortcuts import render
from django.http import HttpRequest, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import os
import json

from rhvoice_wrapper import TTS
from app.mfcc.mfccLoader import loadMfccJson

# главное меню
def home(request):
    return render( request, 'app/mainMenu.html' )
# модуль разделения аудио на отрезки-слова
def audioSplitter( request ) : 
    return render( request, 'app/audioSplitter.html' )
# модуль обучения (формирование mfcc шаблонов)
def recognitionTrainer( request ) : 
    return render( request, 'app/recognitionTrainer.html' )
# модуль распознавания
def recognitionWorker( request ) : 
    return render( request, 'app/recognitionWorker.html' )
# обучение и распознавание фраз с микрофона
def trainAndWorkWithMic( request ) :
    return render( request, 'app/index.html' )
# синтез речи
def speechSynthesis( request ) :
    return render( request, 'app/speechSynthesis.html' )

#сохранение аудио файла на сервере
@csrf_exempt
def upload( request ):
    f = request.GET.get( 'fName','buffer.wav' )
    print( f )
    customHeader = request.META[ 'HTTP_MYCUSTOMHEADER' ]
    uploadedFile = open( f, 'wb' )
    uploadedFile.write( request.body )
    uploadedFile.close( )
    return HttpResponse( '' )

#прием и сохранение mfcc шаблонов
@csrf_exempt
def sendMfccData( request ):
    f = request.GET.get( 'mfccFName','mfccDefault.json' )
    with open( f, 'w' ) as jsonFile:
        s = json.loads( request.body )
        json.dump( s, jsonFile )
    return JsonResponse( { } )

#отправка клиенту шаблонов mfcc
@csrf_exempt
def loadMfccData( request ):
    f = request.GET.get( 'mfccFName','mfccDefault.json' )
    mfccFile = open( f, 'r' )
    mfccData = json.load( mfccFile )
    return JsonResponse( mfccData, safe = False )

#генерация речи
tts = TTS( threads=1 )
def text2Speech( request ) :
    FILE_NAME = 'out.wav'
    txt = request.GET.get( 'text2Speech', '' )
    v = request.GET.get( 'voice','aleksandr' )
    tts.to_file( filename = 'out.wav', text = txt, voice = v, format_ = 'wav', sets = None )

    f = open( FILE_NAME,"rb" )
    response = HttpResponse( f.read( ) )
    response[ 'Content-Type' ] ='audio/wav'
    response[ 'Content-Length' ] = os.path.getsize( FILE_NAME )
    return response
