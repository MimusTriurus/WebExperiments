class Utils {
    // захват аудио с микрофона
    static getMicrophoneStream( ) {
        var stream = navigator.mediaDevices.getUserMedia( { audio: true } );
        return stream;
    }
    // захват аудио с проигрывател€
    static getAudioStream( ) {
        var playbackElement = document.getElementById( "playback" );
        var stream = playbackElement.captureStream( );
        return stream;
    }

    // сливаем промежуточные б”феры в один
    static mergeBuffers( channelBuffer ) {
        if ( channelBuffer.length === 0 )
            return;
        var result = new Float32Array( channelBuffer.length * channelBuffer[ 0 ].length );
        var offset = 0;
        var lng = channelBuffer.length;
        for ( var i = 0; i < lng; i++ ) {
            var buffer = channelBuffer[ i ];
            result.set( buffer, offset );
            offset += buffer.length;
        }
        return result;
    }

    // создаем wav файл из буффера
    static bufferToBlob( internalLeftChannel, internalRecordingLength ) {
        var interleaved = this.mergeBuffers( internalLeftChannel, internalRecordingLength );
        if ( !interleaved )
            return;
        var numChannels = 1, sampleRate = 48000;
        // we create our wav file
        var buffer = new ArrayBuffer(44 + interleaved.length * 2);
        var view = new DataView(buffer);

        // RIFF chunk descriptor
        this.writeUTFBytes(view, 0, 'RIFF');

        // -8 (via #97)
        view.setUint32(4, 44 + interleaved.length * 2 - 8, true);

        this.writeUTFBytes(view, 8, 'WAVE');
        // FMT sub-chunk
        this.writeUTFBytes(view, 12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        // stereo (2 channels)
        view.setUint16(22, numChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * numChannels * 2, true); // numChannels * 2 (via #71)
        view.setUint16(32, numChannels * 2, true);
        view.setUint16(34, 16, true);
        // data sub-chunk
        this.writeUTFBytes(view, 36, 'data');
        view.setUint32(40, interleaved.length * 2, true);

        // write the PCM samples
        var lng = interleaved.length;
        var index = 44;
        var volume = 1;
        for (var i = 0; i < lng; i++) {
            view.setInt16(index, interleaved[i] * (0x7FFF * volume), true);
            index += 2;
        }

        // our final binary blob
        var blob = new Blob([view], {
            type: 'audio/wav'
        });

        return blob;
    }

    // необходима дл€ загрузки файла на сервер
    static getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
    // загрузка wav файла на сервер
    static upload( blob ) {
        var csrftoken = Utils.getCookie( 'csrftoken' );

        var xhr = new XMLHttpRequest( );
        xhr.open( 'POST', '../upload/', true );
        xhr.setRequestHeader( "X-CSRFToken", csrftoken );
        xhr.setRequestHeader( "MyCustomHeader", "Put anything you need in here, like an ID" );

        xhr.upload.onloadend = function ( ) {
            //console.log('Upload complete');
        };
        /*
        xhr.upload.onprogress = function (e) {
            if (e.lengthComputable) {
                console.log((e.loaded / e.total) * 100)
            }
        };
        */
        xhr.send( blob );
    }

    static getTimestamp() {
        var timeStampInMs = window.performance && window.performance.now && window.performance.timing && window.performance.timing.navigationStart ? window.performance.now() + window.performance.timing.navigationStart : Date.now();
        return timeStampInMs;
    }

    static writeUTFBytes(view, offset, string) {
        var lng = string.length;
        for (var i = 0; i < lng; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    }

    static getVoiceFile(blob, timeInterval) {
        if (!blob)
            return;
        var a = document.createElement('a');
        a.target = '_blank';
        a.innerHTML = 'Open Recorded Audio';
        a.href = URL.createObjectURL(blob);
        $('#audios-container').html(a);
    };

}
