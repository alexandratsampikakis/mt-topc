var room, roomId, localStream, interval, serverUrl;

roomId1 = "512dea742628dd4376000001";
roomId2 = "51308ef1f5355b9501000001";
roomId3 = "5130901cf5355b9501000002";
roomId4 = "51309135f5355b9501000003";

serverUrl = "/";

window.onload = function () {
try {
  localStream = Erizo.Stream({audio: true, video: true, data: true});
} catch (error) {
  document.getElementById('howto').removeAttribute("class");
  document.getElementById('rooms').setAttribute("class","hide");
}

    var room1 = document.getElementById('room1');
    var room2 = document.getElementById('room2');
    var room3 = document.getElementById('room3');
    var room4 = document.getElementById('room4');

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
        //console.log("Sending to " + url + " - " + JSON.stringify(body));
        req.send(JSON.stringify(body));
    };

    var createTestRoom = function(callback) {

        var req = new XMLHttpRequest();
        var url = serverUrl + 'createTestRoom/';

        req.onreadystatechange = function () {
            if (req.readyState === 4) {
                callback(req.responseText);
            }
        };

        req.open('POST', url, true);

        //console.log("Sending to " + url + " - " + JSON.stringify(body));
        req.send();
    };

    var getUsers = function(roomId, callback) {

        var req = new XMLHttpRequest();
        var url = serverUrl + 'getUsers/' + roomId;

        req.onreadystatechange = function () {
            if (req.readyState === 4) {
                callback(req.responseText);
            }
        };

        req.open('GET', url, true);

        //console.log("Sending  to " + url);
        req.send();
    };

    var writeUsers = function(id, room, users) {
        var number;
        if(users == '?') {
            number = users; 
        } else {
            number = JSON.parse(users).length;
        }
        if (id == 4) {
            room.childNodes[1].innerText = "CUBE!!! - (" + number + " users)";
        } else {
            room.childNodes[1].innerText = "Room " + id + " - (" + number + " users)";
        }
    };

    var checkUsers = function() {
        getUsers(roomId1, function(users) {
            writeUsers(1, room1, users);
            getUsers(roomId2, function(users) {
                writeUsers(2, room2, users);
                getUsers(roomId3, function(users) {
                    writeUsers(3, room3, users);
                    getUsers(roomId4, function(users) {
                        writeUsers(4, room4, users);
                    });    
                });
            });
        });
    };

    interval = setInterval(checkUsers, 10000);

    checkUsers();

    room1.onclick = function(evt) {
        console.log("Klickade på room1");
        initialize(roomId1);
    };

    room2.onclick = function(evt) {
        initialize(roomId2);
    };

    room3.onclick = function(evt) {
        initialize(roomId3);
    };

    room4.onclick = function(evt) {
        window.location = './cube/cube.html';
    };

    var initialize = function(roomId) {
        clearInterval(interval);
        var roomcontainer = document.getElementById("roomcontainer");
        roomcontainer.setAttribute("class", "hide");
        var vidcontainer = document.getElementById("vidcontainer");
        vidcontainer.setAttribute("class", "");

        createToken(roomId, "user", "role", function (response) {
            var token = response;
            console.log('token created ', token);
		L.Logger.setLogLevel(L.Logger.DEBUG);
            //L.Logger.debug("Connected!");
            room = Erizo.Room({token: token});

            localStream.addEventListener("access-accepted", function () {
                
                var subscribeToStreams = function (streams) {
                    if (!localStream.showing) {
                        localStream.show();
                    }
                    var index, stream;
                    for (index in streams) {
                        if (streams.hasOwnProperty(index)) {
                            stream = streams[index];
                            if (localStream !== undefined && localStream.getID() !== stream.getID()) {
                                room.subscribe(stream);
                            } else {
                                console.log("My own stream");
                            }
                        }
                    }
                };

                room.addEventListener("room-connected", function (roomEvent) {
                    // Publish my stream
                    room.publish(localStream);

                    // Subscribe to other streams
                    subscribeToStreams(roomEvent.streams);
                });

                room.addEventListener("stream-subscribed", function(streamEvent) {
                    var stream = streamEvent.stream;
                    var div = document.createElement('div');
                    div.setAttribute("style", "width: 320px; height: 240px; position: absolute; top: 10px; left: 10px; background-color: black");
                    div.setAttribute("id", "test" + stream.getID());

                    for (var i = 2; i < 5; i++) {
                        var elem = document.getElementById('vid'+i);
                        if (elem.childNodes.length === 1) {
                            elem.appendChild(div);
                            stream.show("test" + stream.getID());
                            return;
                        }
                    }
                    console.log("Oh, oh! There are no video tags available");
                });

                room.addEventListener("stream-added", function (streamEvent) {
                    // Subscribe to added streams
                    var streams = [];
                    streams.push(streamEvent.stream);
                    subscribeToStreams(streams);
                });

                room.addEventListener("stream-removed", function (streamEvent) {
                    // Remove stream from DOM
                    var stream = streamEvent.stream;
                    if (stream.elementID !== undefined) {
                        console.log("Removing " + stream.elementID);
                        var element = document.getElementById(stream.elementID);
                        element.parentNode.removeChild(element);
                    }
                });

                room.connect();

                localStream.show("pepito");

            });
            localStream.init();
        });   
    }
};
