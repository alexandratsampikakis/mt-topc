var serverUrl = "/";

window.onload = function () {

    $('#test').click(function() {
        $('#myModal').modal('toggle');
        return false;
    });

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
        var cb = document.getElementById("cafeButtons");
        for (var i = 0; i < cafes.cafe.length; i++) {
            var a = document.createElement('a');
            var cafeName = cafes.cafe[i].name;
            a.innerHTML += cafeName;
            cb.appendChild(a);
            a.setAttribute("href", "http://satin.research.ltu.se:3001/cafeView.html?cafe=" + cafeName);
            a.setAttribute("class", "buttonCafe btn btn btn-info");
            a.setAttribute("type", "button");
        };
        //console.log(cafes.cafe[0].name);

    });
};