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
        // предзапись с момента начала речи
        this._harkInterval = 100;
        // постзапись с момента окончания речи
        this._stopRecTimeout = 1000;

        this._threshold = -50;
        this.numChannels = 1;

        this.internalLeftChannel = null;
        // текущий аудио файл
        this.blob = null;
        // размер буфера записываемого wav файла
        this.BUFFER_SIZE = 2048;
        // определяем максимальный размер аудио файла
        this.BUFF_ARR_SIZE = 40 * 100;
        // тэг аудио проигрывателя на странице html
        this.AUDIO_FILE_TAG = "playback";

        this.TARGET_SAMPLE_RATE = 8000;
        // объект смены частоты wav файла
        this.resampler = null;
    }

    onMediaSuccess = ( stream ) => {
        this.audioContextType = window.AudioContext || window.webkitAudioContext;
        this.localStream = stream;
        this.track = this.localStream.getTracks( )[ 0 ];
        this.context = new this.audioContextType( );

        this.resampler = new Resampler( this.context.sampleRate, this.TARGET_SAMPLE_RATE, this.numChannels, this.BUFFER_SIZE );

        var source = this.context.createMediaStreamSource( this.localStream );

        if ( !this.context.createScriptProcessor ) {
            this.node = this.context.createJavaScriptNode( this.BUFFER_SIZE, this.numChannels, this.numChannels );
        } else {
            this.node = this.context.createScriptProcessor( this.BUFFER_SIZE, this.numChannels, this.numChannels );
        }

        this.node.onaudioprocess = ( e ) => {
            var left = this.resampler.resample( e.inputBuffer.getChannelData( 0 ) );
            if ( !this.recording )
                return;
            if ( this.leftchannel.length < this.BUFF_ARR_SIZE ) {
                this.leftchannel.push( new Float32Array( left ) );
            }
            else {
                this.leftchannel.splice( 0, 1 );
                this.leftchannel.push( new Float32Array( left ) );
            }
        }

        source.connect( this.node );
        this.node.connect( this.context.destination );

        this.speechHark = initHarker(this.localStream, { interval: this._harkInterval, threshold: this._threshold, play: false, recoredInterval: this._stopRecTimeout });

        this.speechHark.on( 'speaking', this.onSpeechStart );
        this.speechHark.on( 'stopped_speaking', this.onSpeechEnd );
    }
    // система зафиксировала речь
    onSpeechStart = ( ) => {
        console.log( 'start speaking' );
    }
    // речь закончилась
    onSpeechEnd = ( ) => {
        console.log( 'end speaking' );
        this.stopRec( );
        this.processing( );
    }

    // речь окончилась - записываем аудио файл
    async stopRec( ) {
        this.recording = false;
        //console.log(this.leftchannel.slice(0));
        this.internalLeftChannel = this.leftchannel.slice( 0 );

        this.blob = Utils.bufferToBlob( this.internalLeftChannel, this.TARGET_SAMPLE_RATE );

        this.leftchannel.length = 0;
        this.recording = true;
    }

    // pure virtual метод обработки текущего аудио-файла
    processing( ) {
        //console.log( "audioProcessing processing" );
        //console.log( this.localStream.active );
    }

    async startListening( stream ) {
        this.onMediaSuccess( stream );
    }

    stopListening = ( ) => {
        this.recording = false;
        if ( this.leftchannel ) {
            this.leftchannel.length = 0;
            this.leftchannel = [ ];
        }
        this.localStream = null;
        if ( this.speechHark ) this.speechHark.stop( );
    }

    // захват аудио с микрофона
    getMicrophoneStream = ( ) => {
        var stream = navigator.mediaDevices.getUserMedia( { audio: true } );
        return stream;
    }
    // захват аудио с проигрывателя
    getAudioStream = ( ) => {
        var playbackElement = document.getElementById( this.AUDIO_FILE_TAG );
        var stream = playbackElement.captureStream( );
        return stream;
    }
}