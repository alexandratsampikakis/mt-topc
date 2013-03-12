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

        req.open('GET', url, true);

        //console.log("Sending to " + url + " - " + JSON.stringify(body));
        req.send();
    };

    

    getCafeNames(function (response) {
        var cafes = JSON.parse(response);
        /*for (var i = 0; i < cafes.length; i++) {
            cafes
        };*/
        console.log(cafes);
        console.log(cafes.cafe);
        console.log(cafes.cafe[0].name);

    });
};