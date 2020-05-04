from datetime import datetime
from django.shortcuts import render
from django.http import HttpRequest, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import os
import json
import requests
import argparse

from rhvoice_wrapper import TTS
from app.mfcc.mfccLoader import loadMfccJson

from app.NLP.Facts import *
from app.NLP.Rules import *

def emk(request):
    return render( request, 'app/EMK/index.html' )

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

def testSpeechKITT( request ) :
    return render( request, 'app/testSpeechKITT.html' )

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

URL_RECOGNITION = "https://stt.api.cloud.yandex.net/speech/v1/stt:recognize"
URL_SYNTHESIS = "https://tts.api.cloud.yandex.net/speech/v1/tts:synthesize"
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
    response = requests.post( URL_RECOGNITION, params = params, headers = headers, data = data )
    decode_resp = response.content.decode( 'UTF-8' )
    text = json.loads( decode_resp )
    return text

def synthesizeWithYandexSpeechKit( text ) :
    headers = { 'Authorization': f'Api-Key {IAM_TOKEN}' }
    params = {
        'text': text,
        'lang': 'ru-RU',
        'folderId': ID_FOLDER,
        'voice' : 'zahar',
        #'emotion': 'evil'
        #'format': 'lpcm',
        #'sampleRateHertz': 16000
    }
    with requests.post( URL_SYNTHESIS, headers = headers, data = params, stream = True ) as resp:
        if resp.status_code != 200:
            raise RuntimeError("Invalid response received: code: %d, message: %s" % ( resp.status_code, resp.text ) )

        for chunk in resp.iter_content( chunk_size = None ):
            yield chunk


# 1. покажи медицинскую карту Григория Петрова		            -> *проигрышь звука*
# 2. у пациента имеются аллергические реакции на лекарства?		-> У пациента алергия на ибупрофен
# 3. покажи результаты анализов за 10 декабря	                -> *проигрышь звука*
# 4. у пациента есть жалобы?			                        -> Петров жаловался на сильные боли в ноге
# 5. выпиши рецепт на фентанил 			                        -> *проигрышь звука*
def nlpProcessing( txt ) :
    parser = Parser( CMD_SHOW_MED_CARD )
    for match in parser.findall( txt ):
        jsonData = json.dumps( {'result' : txt, 'cmd': match.fact.action, 'doc': match.fact.doc, 'name' : ( match.fact.name.first + ' ' + match.fact.name.last ) }, ensure_ascii=False )
        print( jsonData )
        return jsonData
    ###########################################################################################
    parser = Parser( CMD_ALERGIC )
    for match in parser.findall( txt ):
        jsonData = json.dumps( {'result' : txt, 'cmd': match.fact.action, 'doc': match.fact.doc, 'value' : match.fact.value }, ensure_ascii=False )
        print( jsonData )
        return jsonData
    ###########################################################################################
    parser = Parser( CMD_ANALYZES )
    for match in parser.findall( txt ):
        jsonData = json.dumps( {'result' : txt, 'cmd': match.fact.action, 'doc': match.fact.doc, 'date' : ( match.fact.day + ' ' + match.fact.month ) }, ensure_ascii=False )
        print( jsonData )
        return jsonData
    ###########################################################################################
    parser = Parser( CMD )
    for match in parser.findall( txt ):
        jsonData = json.dumps( {'result' : txt, 'cmd': match.fact.action }, ensure_ascii=False )
        print( jsonData )
        return jsonData
    ###########################################################################################
    parser = Parser( CMD_RECIPE )
    for match in parser.findall( txt ):
        jsonData = json.dumps( {'result' : txt, 'cmd': match.fact.action, 'doc': match.fact.doc, 'value' : match.fact.value }, ensure_ascii=False )
        print( jsonData )
        return jsonData

@csrf_exempt
def speech2Text( request ):
    result = recognizeWithYandexSpeechKit( request.body )

    jsonData = nlpProcessing( result['result'] )

    return JsonResponse( jsonData, safe = False )

#генерация речи
tts = TTS( threads=1 )
def text2Speech( request ) :
    FILE_NAME = 'out.wav'
    txt = request.GET.get( 'text2Speech', '' )
    v = request.GET.get( 'voice','aleksandr' )
    tts.to_file( filename = FILE_NAME, text = txt, voice = v, format_ = 'wav', sets = None )
    f = open( FILE_NAME,"rb" )
    audioData = f.read( )
    f.close( )

    parser = Parser( CMD_SHOW_MED_CARD )
    for match in parser.findall( txt ):
        print( match.fact )

    #recognizedTxt = recognizeWithYandexSpeechKit( audioData )
    #print( recognizedTxt )

    # synth with yandex speech kit
    #FILE_NAME = 'out.ogg'
    #f = open( FILE_NAME,"wb" )
    #for audio_content in synthesizeWithYandexSpeechKit( txt ):
        #f.write( audio_content )
    #f.close( )

    #f = open( FILE_NAME,"rb" )
    #audioData = f.read( )
    #f.close( )

    response = HttpResponse( audioData )
    response[ 'Content-Type' ] ='audio/wav'
    response[ 'Content-Length' ] = os.path.getsize( FILE_NAME )

    return response
