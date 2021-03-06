var sendFeedback = function(subject, email, text, callback) {
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
    req.send(JSON.stringify(body));
};