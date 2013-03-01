var serverUrl = "/";
var localStream, room;
roomId = "512dea742628dd4376000001";

window.onload = function () {

		localStream = Erizo.Stream({audio: true, video: true, data: true});

    var createToken = function(roomId, userName, role, callback) {

        var req = new XMLHttpRequest();
        var url = serverUrl + 'createToken/' + roomId;
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

    createToken(roomId, "user", "role", function (response) {
        var token = response;
        console.log('token: ', token);
        room = Erizo.Room({token: token});

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