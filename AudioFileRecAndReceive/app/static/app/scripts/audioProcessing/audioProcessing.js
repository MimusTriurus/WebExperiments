class AudioProcessing {
    constructor( ) {
        this.audioContextType = null;
        this.localstream = null;
        this.context = null;
        this.track = null;
        this.node = null;
        this.recording = true;
        this.speechHark = null;
        this.leftchannel = [];

        this._stopRecTimeout = 1000;
        this._threshold = -50;
        this._harkInterval = 100;
        this.recordingLength = 0;
        this.numChannels = 1;

        this.internalLeftChannel = null;
        this.internalRecordingLength = null;

        // текущий аудио файл
        this.blob = null;

        this.BUFFER_SIZE = 2048;
        // определяем максимальный размер аудио файла
        this.BUFF_ARR_SIZE = 40 * 100;
        // тэг аудио проигрывателя на странице html
        this.AUDIO_FILE_TAG = "playback";
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
            this.processing( );
        } );
    }
    // речь окончилась - записываем аудио файл
    stopRec( ) {
        this.recording = false;

        this.internalLeftChannel = this.leftchannel.slice( 0 );
        this.internalRecordingLength = this.recordingLength;

        this.blob = Utils.bufferToBlob( this.internalLeftChannel, this.internalRecordingLength );

        this.leftchannel.length = 0;
        this.recordingLength = 0;
        this.recording = true;
    };
    // виртуальные метод обработки текущего аудио-файла
    processing( ) {
        //console.log( "audioProcessing processing" );
        //console.log( this.localStream.active );
    }

    async startListening( ) {
        var captureStream = await this.getAudioStream( );
        this.onMediaSuccess( captureStream );
        this.audioIsEnded = false;
    };

    stopListening = ( ) => {
        this.recording = false;
        if ( this.leftchannel ) {
            this.leftchannel.length = 0;
            this.leftchannel = [ ];
        }
        this.localStream = null;
        this.recordingLength = 0;
        if ( this.speechHark ) this.speechHark.stop( );

        this.audioIsEnded = true;
    };

    // захват аудио с микрофона
    getMicrophoneStream = ( ) => {
        var stream = navigator.mediaDevices.getUserMedia( { audio: true } );
        return stream;
    }
    // захват аудио с проигрывателя
    getAudioStream = ( ) => {
        var playbackElement = document.getElementById(this.AUDIO_FILE_TAG);
        var stream = playbackElement.captureStream( );
        return stream;
    }
}