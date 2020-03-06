class RecognitionTrainer extends AudioProcessing {
    constructor( ) {
        super( );
        this.trained = false;
        this.currentTrainingIndex = 0;
        Recognize.bufferSize = this.BUFFER_SIZE;
    }

    traingNextWord( success ) {
        if ( success ) {
            // next word
            let i = this.currentTrainingIndex + 1;
            if (i > Recognize.dictionary.length * 2 - 1) {
                this.trained = true;
                this.currentTrainingIndex = i;
                console.log("training is finished, now we will try to guess what you are trying to say from the trained vocabulary.");
            }
            else {
                this.currentTrainingIndex = i;
                console.log("Good! say the next word loud and clear, and wait until we process it.  ===>  " + Recognize.dictionary[i % Recognize.dictionary.length]);
            }
        }
        else {
            console.log("we didn't got it, try again, say the next word loud and clear, and wait until we process it.    " + Recognize.dictionary[this.currentTrainingIndex % Recognize.dictionary.length]);
        }
    }

    processing( ) {
        super.processing();
        let success = Recognize.train( this.internalLeftChannel,
            "person1",
            this.setStateMsgFunc);
        if ( success ) {
            //currentTrainingIndex++;
            //if (this.currentTrainingIndex == 4)
                //mfccDataSend();
        }
    }

    mfccDataSend( ) {
        var xhr = new XMLHttpRequest( );
        var url = "sendMfccData/";
        xhr.open( "POST", url, true );
        xhr.setRequestHeader( "Content-Type", "application/json" );

        var data = JSON.stringify( Recognize.mfccHistoryArr );
        xhr.send( data );
    }

    setStateMsgFunc( ) {

    }
}

var recognitionTrainer = null;

window.onload = function ( ) {
    recognitionTrainer = new RecognitionTrainer();


    var playbackElement = document.getElementById("playback");
    var stream = playbackElement.captureStream();
    var audioSrc = this.document.getElementById( "audioSrc" );

    var step = 0;
    var epoch = 1;
    
    playbackElement.addEventListener('canplay', () => {
        //recognitionTrainer.stopListening( );
        recognitionTrainer.startListening( stream );
    } );
    
    playbackElement.addEventListener("ended", () => {
        recognitionTrainer.mfccDataSend();
    });

    var btnStart = document.getElementById( "startButton" );
    btnStart.addEventListener("click", function ( ) {
        //recognitionTrainer.startListening( stream );
    } );

    var btnStop = document.getElementById( "stopButton" );
    btnStop.addEventListener( "click", function ( ) {
        recognitionTrainer.stopListening( );
    } );

    this.console.log( "recognition trainer loaded" );
}