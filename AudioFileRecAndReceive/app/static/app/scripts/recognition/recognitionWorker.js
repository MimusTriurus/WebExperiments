class RecognitionWorker extends AudioProcessing {
    constructor( ) {
        super( );
        Recognize.bufferSize = this.BUFFER_SIZE;
    }

    mfccDataLoad( ) {
        var xhr = new XMLHttpRequest( );
        var url = "loadMfccData/";
        xhr.open( "GET", url, true );
        xhr.setRequestHeader( "Content-Type", "application/json" );
        xhr.onreadystatechange = function ( ) {
            if ( xhr.readyState === 4 && xhr.status === 200 ) {
                var mfccData = JSON.parse(xhr.responseText);
                Recognize.mfccHistoryArr = mfccData;
            }
        };
        xhr.send( );
    }



    processing( ) {
        super.processing( );

        let result = Recognize.recognize( this.internalLeftChannel, this.setStateMsgFunc );
        if ( result ) {
            console.log( "Great! the result is ===> " + result.transcript + " <=== try more." );
        }
        else {
            console.log( "Didn't Got it! please try to Again loud and clear." );
        }
        console.log( result );
    }

    setStateMsgFunc( ) {

    }
}

var recognitionWorker = null;

window.onload = function ( ) {
    recognitionWorker = new RecognitionWorker( );
    recognitionWorker.mfccDataLoad( );

    var btnStart = document.getElementById("startButton");
    btnStart.addEventListener("click", function ( ) {
        recognitionWorker.startListening( );
    } );

    var btnStop = document.getElementById("stopButton");
    btnStop.addEventListener("click", function () {
        recognitionWorker.stopListening();
    });

    this.console.log("recognition worker loaded");
}