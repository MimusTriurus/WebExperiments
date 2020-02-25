import json

def loadMfccJson( ) :
    mfccFile = open( "mfccData.json", "r" )
    mfccData = json.load( mfccFile )
    return mfccData
