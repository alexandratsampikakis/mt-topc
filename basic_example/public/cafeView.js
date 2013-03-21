var room, localStream, serverUrl;

var tableId1, tableId2, tableId3, tableId4, tableId5, tableId6;
serverUrl = "http://satin.research.ltu.se:3001/";

function appendChatMessage(username, message) {
    var message = username + ": " + message;
    $('#chatArea').append(message);
}

function sendChatMessage(username, message) {
    localStream.sendData({text:message, user:'\n'+username});
}

var getQueryString = function getQueryString(key, default_) {
    if (default_==null) default_="";
    key = key.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
    var regex = new RegExp("[\\?&]"+key+"=([^&#]*)");
    var qs = regex.exec(window.location.href);
    if(qs == null)
        return default_;
    else
        return qs[1];
}

var updateTitle = function(title) {
    $('#cafeTitle').html(title);
    $('#cafeTableTitle').html(title);
    $('#cafeVideoTitle').html(title);
}  

var getCafeTables = function(cafe, callback) {
    var req = new XMLHttpRequest();
    var url = serverUrl + 'api/getcafe/' + cafe;

    req.onreadystatechange = function () {
        if (req.readyState === 4) {
            callback(req.responseText);
        }
    };

    req.open('GET', url, true);

    req.send();
};

window.onload = function () {
try {
  localStream = Erizo.Stream({audio: true, video: true, data: true});
} catch (error) {
    console.log('erizo error: ' + error);
}

    getCafeTables(getQueryString('cafe'), function (response) {
        var cafes = JSON.parse(response);
        var tc = document.getElementById("tablecontainer");
        if(cafes.hasOwnProperty('error')) {
            console.log(cafes.error);
        } else {
            updateTitle(cafes.name);
            tableId1 = cafes.table1;
            tableId2 = cafes.table2;
            tableId3 = cafes.table3;
            tableId4 = cafes.table4;
            tableId5 = cafes.table5;
            tableId6 = cafes.table6;
        }
    });

    var createToken = function(roomId, userName, role, callback) {
        console.log(getQueryString('cafe'));
        console.log(roomId);
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

    $('#table1').click(function() {
        initialize(tableId1);
    });
    $('#table2').click(function() {
        initialize(tableId2);
    });
    $('#table3').click(function() {
        initialize(tableId3);
    });
    $('#table4').click(function() {
        initialize(tableId4);
    });
    $('#table5').click(function() {
        initialize(tableId5);
    });
    $('#table6').click(function() {
        initialize(tableId6);
    });

    var initialize = function(roomId) {
        var tablecontainer = document.getElementById("tablecontainer");
        tablecontainer.setAttribute("class", "hide");
        var vidcontainer1 = document.getElementById("vidcontainer1");
        vidcontainer1.setAttribute("class", "");
        var vidcontainer2 = document.getElementById("vidcontainer2");
        vidcontainer2.setAttribute("class", "");
        var shareMediaChat = document.getElementById("shareMediaChat");
        shareMediaChat.setAttribute("class", "");
        var menuList = document.getElementById("menuList");
        menuList.setAttribute("class", "span2 hide");
        

        //Init chat
        var textarea = document.getElementById('chatArea');
        textarea.scrollTop = textarea.scrollHeight;
        //
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
                    console.log("streams: " + roomEvent.streams);
                });

                room.addEventListener("stream-subscribed", function(streamEvent) {
                    var stream = streamEvent.stream;
                    var div = document.createElement('div');
                    div.setAttribute("style", "width:auto;");
                    div.setAttribute("id", "test" + stream.getID());
                    
                    for (var i = 2; i <= 6; i++) {
                        var elem = document.getElementById('vid'+i);
                        if (elem.childNodes.length === 1) {
                            elem.appendChild(div);
                            stream.show("test" + stream.getID());
                            stream.addEventListener("stream-data", function(evt){
                                appendChatMessage(evt.msg.user, evt.msg.text);
                            });
                            $(window).resize(function() {
                                var bodyheight = $('#myVideo').width()/1.33;
                                $(stream.getID()).height(bodyheight);
                            });
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
                    /*streamEvent.stream.addEventListener("stream-data", function(evt){
                        
                        console.log(evt);
                        console.log('Received data ', evt.msg, 'from stream ');
                    });*/
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
