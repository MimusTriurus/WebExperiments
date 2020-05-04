class RecognitionTrainer extends AudioProcessing {
    constructor( ) {
        super( );
        this.trained = false;
        // кол-во эпох обучения
        this.EPOCH = 100;
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
                console.log( "training is finished, now we will try to guess what you are trying to say from the trained vocabulary." );
            }
            else {
                this.currentTrainingIndex = i;
                console.log( "Good! say the next word loud and clear, and wait until we process it.  ===>  " + Recognize.dictionary[i % Recognize.dictionary.length] );
            }
        }
        else {
            console.log( "we didn't got it, try again, say the next word loud and clear, and wait until we process it.    " + Recognize.dictionary[this.currentTrainingIndex % Recognize.dictionary.length] );
        }
    }

    processing( ) {
        super.processing( );
        let success = Recognize.train( this.internalLeftChannel,
            "vita",
            this.setStateMsgFunc);
        if ( success ) {
            this.currentTrainingIndex++;
            console.log( 'train success: ' + this.currentTrainingIndex );
            if ( this.currentTrainingIndex == this.EPOCH )
                this.mfccDataSend( );
        }
    }

    mfccDataSend( ) {
        var xhr = new XMLHttpRequest( );
        var url = "sendMfccData/";
        xhr.open( "POST", url, true );
        xhr.setRequestHeader( "Content-Type", "application/json" );
        console.log( Recognize.mfccHistoryArr);
        var data = JSON.stringify( Recognize.mfccHistoryArr );
        xhr.send( data );
    }

    setStateMsgFunc( ) {

    }
}

var recognitionTrainer = null;