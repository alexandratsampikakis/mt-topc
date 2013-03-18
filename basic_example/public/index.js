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
        var cb1 = document.getElementById("cafeButtons1");
        var cb2 = document.getElementById("cafeButtons2");
        var cb3 = document.getElementById("cafeButtons3");
        var cb4 = document.getElementById("cafeButtons4");
        var cb5 = document.getElementById("cafeButtons5");
        var cb6 = document.getElementById("cafeButtons6");
        /*for (var i = 0; i < cafes.cafe.length; i++) {
            var a = document.createElement('a');
            var cafeName = cafes.cafe[i].name;
            a.innerHTML += cafeName;
            cb.appendChild(a);
            a.setAttribute("href", "http://satin.research.ltu.se:3001/cafeView.html?cafe=" + cafeName);
        };*/
        var a = document.createElement('a');
            var cafeName = cafes.cafe[0].name;
            a.innerHTML += cafeName;
            cb1.appendChild(a);
            a.setAttribute("href", "http://satin.research.ltu.se:3001/cafeView.html?cafe=" + cafeName);
        //console.log(cafes.cafe[0].name);

    });
};