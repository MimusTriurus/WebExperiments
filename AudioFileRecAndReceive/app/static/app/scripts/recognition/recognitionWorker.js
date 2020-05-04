class RecognitionWorker extends AudioProcessing {
    constructor( ) {
        super( );
        this.startListenCallback = null;
        this.stopListenCallback = null;
        this.displayTextCallback = null;
        Recognize.bufferSize = this.BUFFER_SIZE;
    }
    // загрузка шаблона MFCC (ключевое слово)
    mfccDataLoad( ) {
        var xhr = new XMLHttpRequest( );
        var url = "loadMfccData/";
        xhr.open( "GET", url, true );
        xhr.setRequestHeader( "Content-Type", "application/json" );
        xhr.onreadystatechange = function ( ) {
            if ( xhr.readyState === 4 && xhr.status === 200 ) {
                var mfccData = JSON.parse( xhr.responseText );
                console.log( 'mfccTemplateLoaded!' );
                Recognize.mfccHistoryArr = mfccData;
            }
        };
        xhr.send( );
    }
    /*
    onRecognitionResult( data ) {
        console.log( "*** onRecognitionResult ***" );
        console.log( data );
        console.log( "***************************" );
        if ( this.displayTextCallback != null )
            this.displayTextCallback( data );
    }
    */
    
    setStartListenCallback( callback ) {
        this.startListenCallback = callback;
    }

    setStopListenCallback( callback ) {
        this.stopListenCallback = callback;
    }

    setDisplayTextCallback( callback ) {
        this.displayTextCallback = callback;
    }

    onSpeechOn( ) {
        super.onSpeechOn( );
        console.log( "worker speech end" );
        /*
        if ( this.displayTextCallback != null )
            this.displayTextCallback( "" );
        */
        if ( this.stopListenCallback != null )
            this.stopListenCallback;
    }

    processing( ) {
        super.processing( );
        // инициируем распознавание речи на сервере
        if ( this.searchKeyword == false ) { 
            this.BUFF_ARR_SIZE = 40;
            this.searchKeyword = true;

            if ( this.stopListenCallback != null )
                this.stopListenCallback( );


            var fName = 'buffer.wav';
            if ( this.blob )
                Utils.speech2Text( this.blob, fName, this.displayTextCallback );

        }
        else { // распознавание ключевого слова "вита" в браузере
            let result = Recognize.recognize( this.internalLeftChannel, this.setStateMsgFunc );
            if ( result ) {
                this.searchKeyword = false;

                this.BUFF_ARR_SIZE = 40 * 1000;

                if ( this.startListenCallback != null )
                    this.startListenCallback();
                if ( this.displayTextCallback != null )
                    this.displayTextCallback( "Я Вас слушаю..." );

                console.log( "Keyword ===> " + result.transcript + " <=== detected" );
            }
            else {
                console.log( "Keyword searching..." );
            }
        }
    }

    setStateMsgFunc( ) {
    }
}

var recognitionWorker = null;