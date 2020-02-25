class AudioSplitter {
    constructor(props) {
        this.playbackElement = null;

        this.audioContextType = null;
        this.localstream = null;
        this.context = null;
        this.track = null;
        this.node = null;
        this.recording = true;
        this.speechHark = null;
        this.leftchannel = [ ];

        this._stopRecTimeout = 1000;
        this._threshold = -40;
        this._harkInterval = 100;
        this.recordingLength = 0;
        this.numChannels = 1;

        this.BUFFER_SIZE = 2048;
        this.BUFF_ARR_SIZE = 40 * 100;
    }

    onMediaSuccess = ( stream ) => {
        this.audioContextType = window.AudioContext || window.webkitAudioContext;
        this.localStream = stream;
        this.track = this.localStream.getTracks( )[ 0 ];

        this.context = new this.audioContextType( );
        var source = this.context.createMediaStreamSource( this.localStream );

        if ( !this.context.createScriptProcessor ) {
            this.node = this.context.createJavaScriptNode( this.BUFFER_SIZE, this.numChannels, this.numChannels );
        } else {
            this.node = this.context.createScriptProcessor( this.BUFFER_SIZE, this.numChannels, this.numChannels );
        }

        this.node.onaudioprocess = ( e ) => {
            var left = e.inputBuffer.getChannelData( 0 );

            if ( !this.recording )
                return;
            if ( this.leftchannel.length < this.BUFF_ARR_SIZE ) {
                this.leftchannel.push( new Float32Array( left ) );
                this.recordingLength += this.bufferSize;
            }
            else {
                this.leftchannel.splice( 0, 1 );
                this.leftchannel.push( new Float32Array( left ) );
            }
        }

        source.connect( this.node );
        this.node.connect( this.context.destination );

        this.speechHark = initHarker( this.localStream, { interval: this._harkInterval, threshold: this._threshold, play: false, recoredInterval: this._stopRecTimeout } );
        this.speechHark.on( 'speaking', ( ) => {
            console.log( "speaking" );
        } );
        this.speechHark.on( 'stopped_speaking', ( ) => {
            console.log( "stopped_speaking" );
            this.stopRec( );
        } );
    }

    stopRec = ( ) => {
        console.log( "stop recording" );
        this.recording = false;
        var internalLeftChannel = this.leftchannel.slice( 0 );
        var internalRecordingLength = this.recordingLength;

        var blob = Utils.bufferToBlob( internalLeftChannel, internalRecordingLength );

        if ( !blob )
            return;

        Utils.upload( blob );

        this.leftchannel.length = 0;
        this.recordingLength = 0;
        this.recording = true;
    };

    async startListening( ) {
        this.playbackElement = document.getElementById("playback");
        var captureStream = this.playbackElement.captureStream();
        this.playbackElement.play( );
        this.onMediaSuccess( captureStream );
    };

    stopListening = ( ) => {
        this.recording = false;
        if ( this.leftchannel ) {
            this.leftchannel.length = 0;
            this.leftchannel = [ ];
        }
        this.localStream = null;
        this.recordingLength = 0;
        if (this.speechHark) this.speechHark.stop();
        this.playbackElement.pause( );
    };
}

var audioSplitter = null;

window.onload = function () {
    audioSplitter = new AudioSplitter();

    var btnStart = document.getElementById("startButton");
    btnStart.addEventListener("click", function () {
        audioSplitter.startListening();
    });

    var btnStop = document.getElementById("stopButton");
    btnStop.addEventListener("click", function () {
        audioSplitter.stopListening();
    });

    this.console.log("loaded");
}
