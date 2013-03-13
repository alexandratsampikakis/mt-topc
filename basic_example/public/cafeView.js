var serverUrl = "/";


window.onload = function () {

    var getQuerystring = function(key, default_) {
        if (default_==null) default_=""; 
        key = key.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
        var regex = new RegExp("[\\?&]"+key+"=([^&#]*)");
        var qs = regex.exec(window.location.href);
        if(qs == null)
            return default_;
        else
            return qs[1];
    };

    var getCafeTables = function(callback) {

        var req = new XMLHttpRequest();
        var url = serverUrl + 'api/getcafe/' + getQueryString('cafe');

        req.onreadystatechange = function () {
            if (req.readyState === 4) {
                callback(req.responseText);
            }
        };

        req.open('GET', url, true);

        //console.log("Sending to " + url + " - " + JSON.stringify(body));
        req.send();
    };

    getCafeTables(function (response) {
        var cafes = JSON.parse(response);
        var tc = document.getElementById("tableContainer");
        if(cafes.hasOwnProperty('error')) {
            console.log(hejja);
        }
        console.log(cafes.name);

    });
};