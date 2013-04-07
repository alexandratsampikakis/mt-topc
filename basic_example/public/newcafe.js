var room, localStream, dataStream, serverUrl, nameOfUser, leader, urlVideo;
var audioElement;
var knockListYes = new Object();
var knockListNo = new Object();
var tableId1, tableId2, tableId3, tableId4, tableId5, tableId6;
var knockTimer = 20 * 1000; //20 seconds
var knocker = 0;
serverUrl = "http://satin.research.ltu.se:3001/";

function knockSound() {
    audioElement.play();
}

function hasJoinedTheRoom(username) {
    var message = username + " sat down at the table.";
    if($('#chatArea').val() !== "") {
        message = "\n"+message;
    }
    $('#chatArea').append(message);
    $('#chatArea').scrollTop($('#chatArea').scrollHeight);
}

function resetConnection() {
    localStream.close();
    dataStream.close();
    room.disconnect();
    localStream = Erizo.Stream({audio: true, video: true, data: false, attributes:{type:'media',username:nameOfUser}});
    dataStream = Erizo.Stream({audio: false, video: false, data: true, attributes:{type:'data',username:nameOfUser}});
}

function addToKnockList(roomId) {
    if(!knockListYes.hasOwnProperty(roomId)) {
        knockListYes[roomId] = 0;
        setTimeout(function () {removeRoomFromKnocklist(roomId)}, knockTimer+7000);
    }
    if(!knockListNo.hasOwnProperty(roomId)) {
        knockListNo[roomId] = 0;
    }
}

function addYesCount (roomId) {
    if(knockListYes.hasOwnProperty(roomId)) {
        knockListYes[roomId] += 1;
    }
}

function getYesCount(roomId) {
    if(knockListYes.hasOwnProperty(roomId)) {
        return knockListYes[roomId];
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

function removeRoomFromKnocklist(roomId) {
    if(knockListYes.hasOwnProperty(roomId)) {
        delete knockListYes[roomId];
    }
    if(knockListNo.hasOwnProperty(roomId)) {
        delete knockListNo[roomId];
    }
}

function onYouTubePlayerReady(playerId) {
  ytplayer = document.getElementById("myytplayer");
  ytplayer.addEventListener("onStateChange", "onytplayerStateChange");
}

function onytplayerStateChange(newState) {
    switch (newState) {
        case 1:
            //play
            dataStream.sendData({id:'ytplayer', state:1});
            console.log("play video");
            break;
        case 2:
            //pause
            dataStream.sendData({id:'ytplayer', state:2});
            break;
       default:
          
    }
    console.log("state change");
}

function play() {
    if (ytplayer) {
        ytplayer.playVideo();
    }
}

function pause() {
    if (ytplayer) {
        ytplayer.pauseVideo();
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
    var popoverWidth = 400;
    var popoverHeight = popoverWidth/1.33;

    var streams = room.getStreamsByAttribute('type','media');
    var length = streams.length;

    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    canvas.id = "testCanvas";
    //document.body.appendChild(canvas);
    var height = $('#myVideo').height();
    var width = $('#myVideo').width();
    if(length > 3) {
        canvas.width = 3*width;
        canvas.height = 2*height;
    } else {
        canvas.width = length*width;
        canvas.height = height;
    }

    console.log(length);
    for(var i = 0; i<length;i++) {
        var y = 0;
        if (i>2) {
            var y = height;
        }
        if(streams[i].getID() === localStream.getID()) {
            var bitmap;
            bitmap = localStream.getVideoFrame();
            context.putImageData(bitmap, (i%3)*width, y);        
        } else {
            var bitmap;
            bitmap = streams[i].getVideoFrame();
            context.putImageData(bitmap, (i%3)*width, y);
        }

    }

    var canvas2 = document.createElement('canvas');
    var context2 = canvas2.getContext('2d');

    var imgData = canvas.toDataURL();
    var myImage = new Image();
    canvas2.width = 400;
    canvas2.height = 400/1.33;
    myImage.src = imgData;
    $(myImage).load(function(){
        context2.drawImage(myImage, 0, 0,popoverWidth,popoverHeight/2);
        console.log(canvas);
        document.body.appendChild(canvas2);
    }); 
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

var getTableImage = function(room, callback) {
    var req = new XMLHttpRequest();
    var url = serverUrl + 'api/getTableImg/' + room;

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

    audioElement = document.createElement('audio');
    audioElement.setAttribute('src', '/media/knock.mp3');
    audioElement.load();


    var sendTableImg = function(roomId, callback) {
        var req = new XMLHttpRequest();
        var url = serverUrl + 'api/sendTableImg/' + roomId;
        var imgData = getSnapshots();
        var body = {imgData: imgData};

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

    $("#table1").mouseover(function(){
        getTableImage(tableId1, function (response) {
            var tableImg = JSON.parse(response);
            if(tableImg.hasOwnProperty('empty')) {
                if(tableImg.empty === true) {
                    $("#table1").popover({title: 'Table 1', placement:'right', content : 'Café is empty'});
                }
            } else {
                var canvas = document.createElement('canvas');
                var context = canvas.getContext('2d');
                canvas.id = "tableImg" + tableId1;
                imgData = tableImg.imageData;
                var myImage = new Image();
                myImage.src = imgData;
                context.drawImage(myImage, 0, 0);
                console.log(canvas);
                $("#table1").popover({title: 'Table 1', placement:'right',html:true, content : canvas
                });
            }
        });
    });

    $('#sendData').click(function() {
        sendTableImg(room.roomID, function(response) {
            console.log(response);
        });
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
        if($('#VideoUrl').val() !== "") {
            urlVideo = $('#VideoUrl').val();
            dataStream.sendData({id:'ytplayer', state:3, url: urlVideo});
            showVideo(urlVideo);
        }
        return false;
    });
    $('#closeVideo').click(function() {
        $('#youtubeVideo').toggle(); //fungerar inte
        $('#closeVideo').toggle();
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

            try {
                localStream = Erizo.Stream({audio: true, video: true, data: false, attributes:{type:'media',username:nameOfUser}});
                dataStream = Erizo.Stream({audio: false, video: false, data: true, attributes:{type:'data',username:nameOfUser}});
            } catch (error) {
                console.log('erizo error: ' + error);
            }

        getTableImage(tableId1, function (response) {
            var tableImg = JSON.parse(response);
            if(tableImg.hasOwnProperty('empty')) {
                if(tableImg.empty === true) {
                    //$("#table1").popover({title: 'Table 1', placement:'right', content : 'Café is empty'});
                }
            } else {
                var canvas = document.createElement('canvas');
                        var context = canvas.getContext('2d');
                        canvas.id = "tableImg" + tableId1;
                        imgData = tableImg.imageData;
                        console.log(tableImg);
                        console.log(imgData);
                        var myImage = new Image();
                        myImage.src = imgData;
                        $(myImage).load(function(){
                            console.log(myImage.width, myImage.height);
                            context.drawImage(myImage, 0, 0);
                            console.log(canvas);
                            document.body.appendChild(canvas);
                        });


                //$("#table1").popover({title: 'Table 1', placement:'right',html:true, content : canvas
                //});
            }
        });
        }
    };

    var askToJoinTablePopup = function(nameOfUser) {
        knockSound();
        $('.top-right').notify({ type: 'bangTidy', onYes:function () {dataStream.sendData({id:'popup-answer',user:nameOfUser, answer: true})}, onNo:function () {dataStream.sendData({id:'popup-answer',user:nameOfUser, answer: false})}, onClose:function () {dataStream.sendData({id:'popup-answer',user:nameOfUser, answer: false})}, message: { html: '<p style="color: grey"><b>Hey</b>, ' + nameOfUser +' want´s to sit down, it that OK?</p>' }, fadeOut: { enabled: true, delay: knockTimer}}).show();
    };

    var deniedNotification = function(whatCase) {
        switch (whatCase) {
            case 1:
                $('.center').notify({ fadeOut: { enabled: true, delay: 5000 }, type: 'bangTidy', question: false, message: { html: '<p style="color: grey"><b>Hey</b>, seams that the users want some privacy at the moment. Try again later!</p>' }}).show();
                break;
            case 2:
                $('.center').notify({ fadeOut: { enabled: true, delay: 5000 }, type: 'bangTidy', question: false, message: { html: '<p style="color: grey"><b>Hey</b>, all the seats are taken at the moment. Try again later!</p>' }}).show();
                break;
           default:
        }
    }

    var showVideo = function(urlVideo) {
        var videoID = urlVideo.split('=')[1];
        if(videoID !== undefined) {
            var params = { allowScriptAccess: "always" };
            var atts = { id: "myytplayer" };
            swfobject.embedSWF("http://www.youtube.com/v/" + videoID + "?enablejsapi=1&playerapiid=ytplayer&version=3",
                           "youtubeVideo", "80%", "300", "8", null, null, params, atts);

            $('#youtubeVideo').show();
            $('#writeUrl').toggle();
            $('#closeVideo').show();
        }
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
                if(streamEvent.stream.getAttributes().type === "media"){
                    hasJoinedTheRoom(streamEvent.stream.getAttributes().username);
                }
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
        if(!knockListYes.hasOwnProperty(roomId)) {
            createToken(roomId, "user", "role", function (response) {
                var token = response;
                console.log('token created ', token);
                L.Logger.setLogLevel(L.Logger.DEBUG);
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
                        if(room.getStreamsByAttribute('type','media').length >= 1 && room.getStreamsByAttribute('type','media').length < 6) {
                            knockSound();
                            setTimeout(function () {dataStream.sendData({id:'popup', user:nameOfUser})},5000);
                            addToKnockList(roomId);                        
                        } else {
                            deniedNotification(2);
                            resetConnection();
                        }

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
                                        if(localStream.showing === true) {
                                            appendChatMessage(evt.msg.user, evt.msg.text);
                                        }   
                                        break;
                                    case "popup":
                                        if(localStream.showing === true) {
                                            askToJoinTablePopup(evt.msg.user);
                                        }
                                        break;
                                    case "popup-answer":
                                        if(evt.msg.user === nameOfUser && evt.msg.answer === true) {
                                            addYesCount(roomId);
                                            console.log(getYesCount(roomId) === Math.floor(room.getStreamsByAttribute('type','media').length/2)+1);
                                            console.log(getYesCount(roomId));
                                            console.log(Math.floor(room.getStreamsByAttribute('type','media').length/2)+1);
                                            if(room.getStreamsByAttribute('type','media').length === 1) {
                                                removeRoomFromKnocklist(roomId);
                                                initialize(roomId);
                                                
                                            } else if(getYesCount(roomId) === Math.floor(room.getStreamsByAttribute('type','media').length/2)+1) {
                                                removeRoomFromKnocklist(roomId);
                                                initialize(roomId);
                                                
                                            } 
                                        } else if (evt.msg.user === nameOfUser && evt.msg.answer === false) {
                                            addNoCount(roomId);
                                            if(getNoCount(roomId) === Math.floor(room.getStreamsByAttribute('type','media').length/2)+1) {
                                                deniedNotification(1);
                                                resetConnection();
                                            }
                                        } 
                                        break;  
                                    case "leader":
                                        if(localStream.showing === true) {
                                            console.log('message received :E');
                                            setLeader(evt.msg.leader);
                                        }
                                        break;
                                    case "ytplayer":
                                        if(localStream.showing === true) {
                                            if(evt.msg.state === 1) {
                                                play();
                                            } else if (evt.msg.state === 2) {
                                                pause();
                                            } else if (evt.msg.state === 3) {
                                                showVideo(evt.msg.url);
                                            };
                                        }
                                        break;
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
