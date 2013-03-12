var serverUrl = "/";

window.onload = function () {
 var getCafeNames = function(callback) {

        var req = new XMLHttpRequest();
        var url = serverUrl + 'api/getcafenames/';

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

    

    getCafeNames(function (response) {
        var cafes = response;
        console.log(cafes);
    }
};