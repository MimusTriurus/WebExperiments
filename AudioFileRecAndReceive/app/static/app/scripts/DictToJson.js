function send( ) {
    var xhr = new XMLHttpRequest();
    var url = "receiveJson/";
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var json = JSON.parse(xhr.responseText);
            console.log(json.email + ", " + json.password);
        }
    };
    var data = JSON.stringify({ "email": "hey@mail.com", "password": "101010" });
    xhr.send(data);
}

var sendButton = document.getElementById("btn");
sendButton.addEventListener("click", send);