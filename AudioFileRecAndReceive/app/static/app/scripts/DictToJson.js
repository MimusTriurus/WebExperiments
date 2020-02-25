function mfccDataSend( ) {
    var xhr = new XMLHttpRequest();
    var url = "sendMfccData/";
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");

    var data = JSON.stringify({ "email": "hey@mail.com", "password": "101010" });
    xhr.send(data);
}

function mfccDataLoad( ) {
    var xhr = new XMLHttpRequest( );
    var url = "loadMfccData/";
    xhr.open( "GET", url, true );
    xhr.setRequestHeader( "Content-Type", "application/json" );
    xhr.onreadystatechange = function ( ) {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var json = JSON.parse(xhr.responseText);
            console.log(json.email + ", " + json.password);
        }
    };
    xhr.send( );
}

var sendButton = document.getElementById( "btnSend" );
sendButton.addEventListener( "click", mfccDataSend );

var loadButton = document.getElementById( "btnLoad" );
loadButton.addEventListener("click", mfccDataLoad);