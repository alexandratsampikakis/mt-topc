var serverUrl = "/";

window.onload = function () {
 var getCafeTables = function(cafe, callback) {

        var req = new XMLHttpRequest();
        var url = serverUrl + 'api/getcafe/' + cafe;

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
        var tc = document.getElementById("tableContainer");
        if(cafes.hasOwnProperty('error')) {
            console.log(hejja);
        }
        console.log(cafes.cafe[0].name);

    });
};