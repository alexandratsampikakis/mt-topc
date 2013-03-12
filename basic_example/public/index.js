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

    
        <a href="http://satin.research.ltu.se:3001/cafeView.html"><button class="buttonCafe btn btn btn-info" type="button"><i class="icon-heart"></i> Café Paris</button></a>

    getCafeNames(function (response) {
        var cafes = JSON.parse(response);
        var cb = document.getElementById("cafeButtons");
        for (var i = 0; i < cafes.cafe[0].length; i++) {
            var a = document.createElement('a');
            a.setAttribute("href", "http://satin.research.ltu.se:3001/cafeView.html");
            a.innerHTML += cafes.cafe[0].name;
            cb.appendChild(a);
            
            var btn = document.createElement('button');
            btn.setAttribute("class", "buttonCafe btn btn btn-info");
            btn.setAttribute("type", "button");
            a.appendChild(btn);
        };
        console.log(cafes.cafe[0].name);

    });
};