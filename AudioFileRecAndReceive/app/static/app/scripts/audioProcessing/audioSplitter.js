class AudioSplitter extends AudioProcessing {

    constructor( ) {
        super( );
    }
    // переопределенный виртуальные метод базового класса
    processing( ) {
        console.log( "audioSplitter processing" );
        if ( this.blob )
            Utils.upload( this.blob );
    };
}

var audioSplitter = null;

window.onload = function ( ) {
    audioSplitter = new AudioSplitter( );

    var btnStart = document.getElementById( "startButton" );
    btnStart.addEventListener( "click", function ( ) {
        audioSplitter.startListening( );
    } );

    var btnStop = document.getElementById( "stopButton" );
    btnStop.addEventListener( "click", function ( ) {
        audioSplitter.stopListening( );
    } );

    this.console.log( "audio splitter loaded" );
}
