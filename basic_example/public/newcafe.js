var room, localStream, dataStream, serverUrl, nameOfUser, leader;
var knockListYes = new Object();
var knockListNo = new Object();
var tableId1, tableId2, tableId3, tableId4, tableId5, tableId6;
var knockTimer = 20 * 1000; //20 seconds
var knocker = 0;
serverUrl = "http://satin.research.ltu.se:3001/";

function resetConnection() {
    localStream.close();
    dataStream.close();
    room.disconnect();
    localStream = Erizo.Stream({audio: true, video: true, data: false, attributes:{type:'media'}});
    dataStream = Erizo.Stream({audio: false, video: false, data: true, attributes:{type:'data'}});
}

function addToKnockList(roomId) {
    if(!knockListYes.hasOwnProperty(roomId)) {
        knockListYes[roomId] = 0;
        setTimeout(function () {removeUser(roomId)}, knockTimer+7000);
    }
    if(!knockListNo.hasOwnProperty(roomId)) {
        knockListNo[roomId] = 0;
    }
}

function addYesCount (roomId) {
    if(knockList.hasOwnProperty(roomId)) {
        knockList[roomId] += 1;
    }
}

function getYesCount(roomId) {
    if(knockList.hasOwnProperty(roomId)) {
        return knockList[roomId];
    }
}

function getNoCount(roomId) {
    if(knockListNo.hasOwnProperty(roomId)) {
        return knockListNo[roomId];
    }
}

function addNoCount (roomId) {
    if(knockListNo.hasOwnProperty(roomId)) {
        knockListNo[roomId] += 1;
    }
}

function removeUser(roomId) {
    if(knockListYes.hasOwnProperty(roomId)) {
        delete knockListYes[roomId];
    }
    if(knockListNo.hasOwnProperty(roomId)) {
        delete knockListNo[roomId];
    }
}

function getLeader() {
    var keys = [];
    var highest = parseInt(localStream.getID());
    for(var k in room.getStreamsByAttribute('type','media')) keys.push(k);
    for(i = 0; i<keys.length;i++) {
        if (parseInt(keys[i]) > highest) highest=parseInt(keys[i]);
    }
    console.log(highest);
    return highest;
}

function setLeader(id) {
    leader = id;
}

function broadcastLeader() {
    dataStream.sendData({id:'leader',leader:leader});
    console.log('broadcasting leader');
}

function getSnapshots() {
    var keys = [];
    for(var k in room.remoteStreams) keys.push(k);
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    canvas.id = "testCanvas";
    document.body.appendChild(canvas);
    var height = $('#myVideo').height();
    var width = $('#myVideo').width();
    if(keys.length > 3) {
        canvas.width = 3*width;
        canvas.height = 2*height;
    } else {
        canvas.width = keys.length*width;
        canvas.height = height;
    }
    console.log(keys.length);
    for(var i = 0; i<keys.length;i++) {
        var y = 0;
        if (i>2) {
            var y = height;
        }
        if(localStream.getID() !== parseInt(keys[i])){
            var bitmap;
            bitmap = room.remoteStreams[keys[i]].getVideoFrame();
            context.putImageData(bitmap, (i%3)*width, y);
        } else {
            var bitmap;
            bitmap = localStream.getVideoFrame();
            context.putImageData(bitmap, (i%3)*width, y);
        }
    }
}

function appendChatMessage(username, message) {
    var message = username + ": " + message;
    if($('#chatArea').val() !== "") {
        message = "\n"+message;
    }
    $('#chatArea').append(message);
    $('#chatArea').scrollTop($('#chatArea').scrollHeight);
}

function sendChatMessage(message) {
    dataStream.sendData({id:'chat',text:message, user:nameOfUser});
    $('#chatMessage').val("");
    appendChatMessage(nameOfUser, message);
    $("#myTextBox").focus();
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
$("#userName").focus();
try {
  localStream = Erizo.Stream({audio: true, video: true, data: false, attributes:{type:'media'}});
  dataStream = Erizo.Stream({audio: false, video: false, data: true, attributes:{type:'data'}});
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
        knock(tableId1);
    });
    $('#table2').click(function() {
        knock(tableId2);
    });
    $('#table3').click(function() {
        knock(tableId3);
    });
    $('#table4').click(function() {
        knock(tableId4);
    });
    $('#table5').click(function() {
        knock(tableId5);
    });
    $('#table6').click(function() {
        knock(tableId6);
    });
    $('#sendData').click(function() {
        getSnapshots();
    });
    $('#sendMessage').click(function() {
        if($('#chatMessage').val() !== "") {
            sendChatMessage($('#chatMessage').val());
        }
        return false;
    });
    $('#submitUsername').click(function() {
        enterName();
        return false;
    });
    $('#askToJoinTable').click(function() {
        dataStream.sendData({id:'popup', user:nameOfUser});
        return false;
    });
    $('#leaveTableButton').click(function() {
        resetConnection();
        $('#tablecontainer').toggle();
        $('#vidcontainer1').toggle();
        $('#vidcontainer2').toggle();
        $('#shareMediaChat').toggle();
        $('#menuList').toggle();
        return false;
    });
    $('#shareVideo').click(function() {
        $('#writeUrl').toggle();
        return false;
    });
    $('#getVideoUrl').click(function() {
        showVideo();
        return false;
    });
    $('#shareDocument').click(function() {
        return false;
    });

    var enterName = function() {
        if($('#userName').val() !== "") {
            nameOfUser = $('#userName').val();
            $('#enterName').toggle();
            $('#tablecontainer').toggle();
        }
    };

    //<button id="' + nameOfUser +'" class="btn-mini">Yes</button><button id="' + nameOfUser +'No' +'" class="btn-mini">No</button>
    var askToJoinTablePopup = function(nameOfUser) {
        $('.top-right').notify({ type: 'bangTidy', onYes:function () {dataStream.sendData({id:'popup-answer',user:nameOfUser, answer: true})}, onNo:function () {dataStream.sendData({id:'popup-answer',user:nameOfUser, answer: false})}, onClose:function () {dataStream.sendData({id:'popup-answer',user:nameOfUser, answer: false})}, message: { html: '<p style="color: grey"><b>Hey</b>, ' + nameOfUser +' want´s to sit down, it that OK?</p>' }, fadeOut: { enabled: true, delay: knockTimer}}).show();
    };

    var showVideo = function() { 
        $('#youtubeVideo').toggle();
    }

    var initialize = function(roomId) {
        $('#tablecontainer').toggle();
        $('#vidcontainer1').toggle();
        $('#vidcontainer2').toggle();
        $('#shareMediaChat').toggle();
        $('#menuList').toggle();

        //Init chat
        $('#chatArea').scrollTop($('#chatArea').scrollHeight);
        $('#chatArea').width('100%');
        $('#chatMessage').width('80%');
        $('#sendMessage').width('19%');
        $('#chatMessage').focus();
        //

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

            room.addEventListener("stream-subscribed", function(streamEvent) {
                var stream = streamEvent.stream;
                if (stream.getAttributes().type === 'media') {
                    for (var i = 2; i <= 6; i++) {
                        if ($('#vid'+i).children().length === 0) {
                            $('<div></div>', {
                                id: 'test'+stream.getID()
                            }).css('width','100%').appendTo('#vid'+i);
                            stream.show("test" + stream.getID());
                            /*stream.addEventListener("stream-data", function(evt){
                                switch (evt.msg.id) {
                                    case "chat":
                                        appendChatMessage(evt.msg.user, evt.msg.text);
                                        break;
                                    case "popup":
                                        askToJoinTablePopup(evt.msg.user);
                                        break;
                                    case "leader":
                                        console.log('message received :E');
                                        setLeader(evt.msg.leader);
                                   default:
                                      
                                }
                            });*/
                            $(window).resize(function() {
                                var videoheight = $('#vid'+1).width()/1.33;
                                $(stream.getID()).height(videoheight);
                            });
                            return;
                        }
                    }
                    console.log("There is no seat available at this table!");
                } 
            });

            room.addEventListener("stream-added", function (streamEvent) {
                // Subscribe to added streams
                var streams = [];
                streams.push(streamEvent.stream);
                subscribeToStreams(streams);

                //If table is empty, become the leader
                var keys = [];
                for(var k in room.remoteStreams) keys.push(k);
                if(keys.length === 1 && parseInt(keys[0]) === localStream.getID()) {
                    leader = localStream.getID();
                }
                if(leader === localStream.getID()) {
                    broadcastLeader();
                }
            });

            room.addEventListener("stream-removed", function (streamEvent) {
                // Remove stream from DOM
                var stream = streamEvent.stream;
                if (stream.elementID !== undefined) {
                    console.log('stream: ' + stream.getID());
                    console.log(stream.getID() === leader);
                    console.log('leader: ' + leader);
                    if(stream.getID() === leader) {
                        console.log('kommer jag hit?');
                        leader = getLeader();
                        console.log(getLeader());
                    }
                    console.log("Removing " + stream.elementID);
                    $('#'+stream.elementID).remove();
                }
            }); 

            localStream.show("myVideo");
            
            var videoheight = $('#myVideo').width()/1.33;
            $('#myVideo').height(videoheight);
            for (var i = 2; i <= 6; i++) {
                if ($('#vid'+i).children().length=1) {
                    $('#vid'+i).first().height(videoheight);
                }
            }
            $(window).resize(function() {
                var videoheight = $('#myVideo').width()/1.33;
                $('#myVideo').height(videoheight);
                for (var i = 2; i <= 6; i++) {
                    if ($('#vid'+i).children().length=1) {
                    $('#vid'+i).first().height(videoheight);
                    }
                }
            });

            // Publish my stream
            room.publish(localStream);

            // Subscribe to other streams
            subscribeToStreams(room.getStreamsByAttribute('type','media')); 
        }); 
        localStream.init();  
    }

    var knock = function(roomId) {
        if(!knockList.hasOwnProperty(roomId)) {
            resetConnection();
            createToken(roomId, "user", "role", function (response) {
                var token = response;
                console.log('token created ', token);
                L.Logger.setLogLevel(L.Logger.DEBUG);
                //L.Logger.debug("Connected!");
                room = Erizo.Room({token: token});

                dataStream.addEventListener("access-accepted", function () {
                    
                    var subscribeToStreams = function (streams) {
                        if (!dataStream.showing) {
                            dataStream.show();
                        }
                        var index, stream;
                        for (index in streams) {
                            if (streams.hasOwnProperty(index)) {
                                stream = streams[index];
                                if (dataStream !== undefined && dataStream.getID() !== stream.getID()) {
                                    room.subscribe(stream);
                                } else {
                                    console.log("My own stream");
                                }
                            }
                        }
                        setTimeout(function () {dataStream.sendData({id:'popup', user:nameOfUser})},5000);
                        addToKnockList(roomId);
                    };

                    room.addEventListener("room-connected", function (roomEvent) {
                        // Publish my stream
                        room.publish(dataStream);
                        //If table is empty
                        if(room.getStreamsByAttribute('type','media').length === 0) {
                            initialize(roomId);
                        }
                        // Subscribe to other streams
                        subscribeToStreams(room.getStreamsByAttribute('type','data'));
                    });

                    room.addEventListener("stream-subscribed", function(streamEvent) {
                        var stream = streamEvent.stream;
                        if (stream.getAttributes().type === 'data') {
                            stream.addEventListener("stream-data", function(evt){
                                console.log(evt.msg);
                                switch (evt.msg.id) {
                                    case "chat":
                                        appendChatMessage(evt.msg.user, evt.msg.text);
                                        break;
                                    case "popup":
                                        askToJoinTablePopup(evt.msg.user);
                                        break;
                                    case "popup-answer":
                                        if(evt.msg.user === nameOfUser && evt.msg.answer === true) {
                                            addYesCount(roomId);
                                            if(getYesCount(roomId) >= Math.ceil(room.getStreamsByAttribute('type','media').length/2)) {
                                                initialize(roomId);
                                            } 
                                        } else if (evt.msg.user === nameOfUser && evt.msg.answer === false) {
                                            addNoCount(roomId);
                                            if(getNoCount(roomId) >= Math.ceil(room.getStreamsByAttribute('type','media').length/2)) {
                                                //popup
                                                resetConnection();
                                            }
                                        } 
                                            
                                    case "leader":
                                        console.log('message received :E');
                                        setLeader(evt.msg.leader);
                                   default:
                                      
                                }
                            });
                        }
                    });

                    room.connect();       

                });
                dataStream.init();
            });
        }   
    }
};