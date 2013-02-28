var serverUrl = "/";
var localStream, room;

window.onload = function () {

		localStream = Erizo.Stream({audio: true, video: true, data: true});

    var createToken = function(userName, role, callback) {

        var req = new XMLHttpRequest();
        var url = serverUrl + 'createToken/';
        var body = {username: userName, role: role};

        req.onreadystatechange = function () {
            if (req.readyState === 4) {
                callback(req.responseText);
            }
        };

        req.open('POST', url, true);
        req.setRequestHeader('Content-Type', 'application/json');
        req.send(JSON.stringify(body));
    };

    createToken("user", "role", function (response) {
        //var token = "5007cf9aa8946ac114000117";
        //console.log("Token:");
        //console.log(token);
        room = Erizo.Room({token: "5007cf9aa8946ac114000117"});

        localStream.addEventListener("access-accepted", function () {
            console.log("access-accepted");
            var subscribeToStreams = function (streams) {
                for (var index in streams) {
                    var stream = streams[index];
                    if (localStream.getID() !== stream.getID()) {
                        room.subscribe(stream);
                    } 
                }
            };

            room.addEventListener("room-connected", function (roomEvent) {
                console.log("room-connected");
                room.publish(localStream);
                subscribeToStreams(roomEvent.streams);
            });

            room.addEventListener("stream-subscribed", function(streamEvent) {
                console.log("stream-subscribed");
                var stream = streamEvent.stream;
                var div = document.createElement('div');
                div.setAttribute("style", "width: 320px; height: 240px;");
                div.setAttribute("id", "test" + stream.getID());

                document.body.appendChild(div);
                stream.show("test" + stream.getID());

            });

            room.addEventListener("stream-added", function (streamEvent) {
                console.log("stream-added");
                var streams = [];
                streams.push(streamEvent.stream);
                subscribeToStreams(streams);
            });

            room.addEventListener("stream-removed", function (streamEvent) {
                console.log("stream-removed");
                // Remove stream from DOM
                var stream = streamEvent.stream;
                if (stream.elementID !== undefined) {
                    var element = document.getElementById(stream.elementID);
                    document.body.removeChild(element);
                }
            });

            room.connect();

            localStream.show("myVideo");

        });
        localStream.init();
    });   
};