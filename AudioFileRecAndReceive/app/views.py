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

def home(request):
    return render( request, 'app/mainMenu.html' )

def audioSplitter( request ) : 
    return render( request, 'app/audioSplitter.html' )

def recognitionTrainer( request ) : 
    return render( request, 'app/recognitionTrainer.html' )

def recognitionWorker( request ) : 
    return render( request, 'app/recognitionWorker.html' )

def trainAndWorkWithMic( request ) :
    return render( request, 'app/index.html' )

def speechSynthesis( request ) :
    return render( request, 'app/speechSynthesis.html' )

i = 0

@csrf_exempt
def upload(request):
    global i
    i += 1
    name = 'f_' + str( i ) + '.wav'
    print( name )
    customHeader = request.META[ 'HTTP_MYCUSTOMHEADER' ]
    uploadedFile = open( name, 'wb' )
    uploadedFile.write( request.body )
    uploadedFile.close( )
    return HttpResponse( '' )

#прием и сохранение mfcc шаблонов
@csrf_exempt
def sendMfccData( request ):
    with open( 'mfccData.json', 'w' ) as jsonFile:
        s = json.loads( request.body )
        json.dump( s, jsonFile )
    return JsonResponse( { } )

#отправка клиенту шаблонов mfcc
@csrf_exempt
def loadMfccData( request ):
    mfccFile = open( 'mfccData.json', 'r' )
    mfccData = json.load( mfccFile )
    return JsonResponse( mfccData, safe = False )

#генерация речи
tts = TTS( threads=1 )
def text2Speech( request ) :
    FILE_NAME = 'out.wav'
    txt = ( request.GET.get( 'text2Speech', '' ) );
    tts.to_file( filename='out.wav', text=txt, voice='aleksandr', format_='wav', sets=None )

    #response = HttpResponse( mimetype='audio/mpeg' )
    #response['Content-Disposition'] = 'attachment; filename=%s' % smart_str( FILE_NAME )
    #response['Accept-Ranges'] = 'bytes'
    #response['X-Sendfile'] = smart_str( FILE_NAME )
    #return response

    f = open(FILE_NAME,"rb") 
    response = HttpResponse( f.read( ) )
    response[ 'Content-Type' ] ='audio/wav'
    response[ 'Content-Length' ] = os.path.getsize( FILE_NAME )
    return response
