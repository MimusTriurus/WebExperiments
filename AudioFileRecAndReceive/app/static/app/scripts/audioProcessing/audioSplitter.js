class AudioSplitter extends AudioProcessing {

    constructor( ) {
        super( );
        this.currentIndex = 0;
    }
    // переопределенный виртуальные метод базового класса
    processing() {
        this.currentIndex++;
        //console.log( 'audioSplitter processing' );
        var fName = 'buffer' + this.currentIndex + '.wav';
        console.log( 'save file: ' + fName );
        if ( this.blob )
            Utils.upload( this.blob, fName );
    };
}

var audioSplitter = null;

window.onload = function ( ) {
    audioSplitter = new AudioSplitter( );

    var btnStart = document.getElementById( "startButton" );
    btnStart.addEventListener( "click", function ( ) {
        audioSplitter.startListening( Utils.getAudioStream( ) );
    } );

    var btnStop = document.getElementById( "stopButton" );
    btnStop.addEventListener( "click", function ( ) {
        audioSplitter.stopListening( );
    } );

    this.console.log( "audio splitter loaded" );
}
