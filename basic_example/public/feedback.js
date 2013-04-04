var sendFeedback = function(subject, email, text, callback) {
    console.log(getQueryString('cafe'));
    console.log(roomId);
    var req = new XMLHttpRequest();
    var url = serverUrl + 'sendFeedback';
    var body = {email: email, subject: subject, text: text};

    req.onreadystatechange = function () {
        if (req.readyState === 4) {
            callback(req.responseText);
        }
    };

    req.open('POST', url, true);

    req.setRequestHeader('Content-Type', 'application/json');
    //console.log("Sending to " + url + " - " + JSON.stringify(body));
    req.send(JSON.stringify(body));
};

createToken('hello world', "myztix89@gmail.com", "hejjahoppsan", function (response) {
    console.log(response);
});