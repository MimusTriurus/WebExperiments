URL = window.URL || window.webkitURL;

var gumStream;
var rec;
var input;
var hark;

const levelRangeElement = document.getElementById("levelRange");

var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext //audio context to help us record

var recordButton = document.getElementById("recordButton");
var stopButton = document.getElementById("stopButton");
var pauseButton = document.getElementById("pauseButton");

recordButton.addEventListener("click", startRecording);
stopButton.addEventListener("click", stopRecording);
pauseButton.addEventListener("click", pauseRecording);

function startRecording( ) {
    var constraints = { audio: true, video:false }

	recordButton.disabled = true;
	stopButton.disabled = false;
	pauseButton.disabled = false

	navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {

		console.log("getUserMedia() success, stream created, initializing Recorder.js ...");

		audioContext = new AudioContext();

		document.getElementById("formats").innerHTML="Format: 1 channel pcm @ "+audioContext.sampleRate/1000+"kHz"

		gumStream = stream;

		hark = initHarker(gumStream);

		hark.on('speaking', function () {
			console.log('speaking');
		});

		hark.on('stopped_speaking', function () {
			console.log('stopped_speaking');
		});

		input = audioContext.createMediaStreamSource(stream);

		rec = new Recorder(input,{numChannels:1})
		rec.record()

		console.log("Recording started");

	}).catch(function(err) {
    	recordButton.disabled = false;
    	stopButton.disabled = true;
    	pauseButton.disabled = true
	});
}

function pauseRecording(){
	if (rec.recording){
		//pause
		rec.stop();
		pauseButton.innerHTML="Resume";
	}else{
		//resume
		rec.record()
		pauseButton.innerHTML="Pause";
	}
}

function stopRecording() {
	stopButton.disabled = true;
	recordButton.disabled = false;
    pauseButton.disabled = true;

	pauseButton.innerHTML="Pause";
	
	rec.stop();

	gumStream.getAudioTracks()[0].stop();

    rec.exportWAV(upload);
}

// Required for Django CSRF
function getCookie(name) {
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

// Actual Upload function using xhr
function upload(blob) {
    var csrftoken = getCookie('csrftoken');

    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'upload/', true);
    xhr.setRequestHeader("X-CSRFToken", csrftoken);
    xhr.setRequestHeader("MyCustomHeader", "Put anything you need in here, like an ID");

    xhr.upload.onloadend = function () {
        alert('Upload complete');
    };

    xhr.upload.onprogress = function (e) {
        if (e.lengthComputable) {
            console.log((e.loaded / e.total) * 100)
        }
    };

    xhr.send(blob);
}