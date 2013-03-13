var serverUrl = "/";
var localStream, room;

//Retrieves querystrings. ex getQueryString('hello') on page 
//http://www.mypage.se?hello=world returns 'world'
function getQueryString(key, default_) {
    if (default_==null) default_=""; 
    key = key.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
    var regex = new RegExp("[\\?&]"+key+"=([^&#]*)");
    var qs = regex.exec(window.location.href);
    if(qs == null)
        return default_;
    else
        return qs[1];
}

window.onload = function () {

    try {
        localStream = Erizo.Stream({audio: true, video: true, data: true});
    } catch (error) {

    }   

    var table1 = document.getElementById('table1');
    var table2 = document.getElementById('table2');
    var table3 = document.getElementById('table3');
    var table4 = document.getElementById('table4');
    var table5 = document.getElementById('table5');
    var table6 = document.getElementById('table6');

    var tableId1, tableId2, tableId3, tableId4, tableId5, tableId6;
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

    getCafeTables(getQueryString('cafe'), function (response) {
        var cafes = JSON.parse(response);
        var tc = document.getElementById("tableContainer");
        if(cafes.hasOwnProperty('error')) {
            console.log(cafes.error);
        } else {
            tableId1 = cafes.table1;
            tableId2 = cafes.table2;
            tableId3 = cafes.table3;
            tableId4 = cafes.table4;
            tableId5 = cafes.table5;
            tableId6 = cafes.table6;
        }
        console.log(cafes.name);

    });

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

    table1.onclick = function(evt) {
        initialize(tableId1);
    };

    table2.onclick = function(evt) {
        initialize(tableId2);
    };
    table3.onclick = function(evt) {
        initialize(tableId3);
    };
    table4.onclick = function(evt) {
        initialize(tableId4);
    };
    table5.onclick = function(evt) {
        initialize(tableId5);
    };
    table6.onclick = function(evt) {
        initialize(tableId6);
    };

      var initialize = function(roomId) {
        var tableContainer = document.getElementById("tableContainer");
        tableContainer.setAttribute("class", "hide");
        var videoContainer = document.getElementById("videoContainer");
        videoContainer.setAttribute("class", "");

        createToken(roomId, "user", "role", function (response) {
            var token = response;
            console.log('token created ', token);
     //   L.Logger.setLogLevel(L.Logger.DEBUG);
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

                localStream.show("myVideo");

            });
            localStream.init();
        });   

















































    }
};