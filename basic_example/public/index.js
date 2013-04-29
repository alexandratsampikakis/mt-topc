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
        var cb = document.getElementById("cafeButtons");
        var 3Dcb = document.getElementById("3DcafeButtons");
        for (var i = 0; i < cafes.cafe.length; i++) {
            var a = document.createElement('a');
            var cafeName = cafes.cafe[i].name;
            a.innerHTML += cafeName;
            cb.appendChild(a);
            a.setAttribute("href", "http://satin.research.ltu.se:3001/cafeView.html?cafe=" + cafeName);
            a.setAttribute("class", "buttonCafe btn btn-info");
            a.setAttribute("type", "button");
        };
        for (var i = 0; i < cafes.cafe.length; i++) {
            var b = document.createElement('b');
            var cafeName = cafes.cafe[i].name;
            b.innerHTML += cafeName;
            3Dcb.appendChild(b);
            b.setAttribute("href", "http://satin.research.ltu.se:3001/3d2.html?cafe=" + cafeName);
            b.setAttribute("class", "buttonCafe btn btn-info");
            b.setAttribute("type", "button");
        };

    });

    function clearFeedback() {
            $('#feedbackSubject').val("");
            $('#feedbackMail').val("");
            $('#feedbackMessage').val("");
    }

    $('#sendFeedback').click(function() {
        if($('#feedbackMessage').val() !== "" && $('#feedbackSubject').val() !== "" && $('#feedbackMail').val() !== "")
        sendFeedback($('#feedbackSubject').val(), $('#feedbackMail').val(), $('#feedbackMessage').val(), function (response) {
            console.log(response);
            clearFeedback();
            $('#feedbackModal').modal('hide')
        });
    });

    $('#closeFeedback').click(function() {
        clearFeedback();
    });

};