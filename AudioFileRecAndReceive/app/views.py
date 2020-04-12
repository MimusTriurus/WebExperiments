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
import requests

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

URL = "https://stt.api.cloud.yandex.net/speech/v1/stt:recognize"
IAM_TOKEN = "AQVN3w5-7jV6pE6ewRVoRsKSZUhqbLkqawA2AyNk"
ID_FOLDER = "b1gum09hamrdguk0984d"

def recognizeWithYandexSpeechKit( data ):
    headers = { 'Authorization': f'Api-Key {IAM_TOKEN}' }
    params = {
        'lang': 'ru-RU',
        'folderId': ID_FOLDER,
        'sampleRateHertz': 16000,
        'format' : 'lpcm'
    }
    response = requests.post( URL, params = params, headers = headers, data = data )
    decode_resp = response.content.decode( 'UTF-8' )
    text = json.loads( decode_resp )
    return text

#генерация речи
tts = TTS( threads=1 )
def text2Speech( request ) :
    FILE_NAME = 'out.wav'
    txt = request.GET.get( 'text2Speech', '' )
    v = request.GET.get( 'voice','aleksandr' )
    tts.to_file( filename = FILE_NAME, text = txt, voice = v, format_ = 'wav', sets = None )
    f = open( FILE_NAME,"rb" )
    audioData = f.read( )

    recognizedTxt = recognizeWithYandexSpeechKit( audioData )
    print( recognizedTxt )

    response = HttpResponse( audioData )
    response[ 'Content-Type' ] ='audio/wav'
    response[ 'Content-Length' ] = os.path.getsize( FILE_NAME )
    return response
