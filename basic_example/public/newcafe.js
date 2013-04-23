//(function(){
var room, cafe, localStream, dataStream, overhearStream, serverUrl, nameOfUser, leader, urlVideo;
var audioElement;
var knockListYes = new Object();
var knockListNo = new Object();
var tableId = new Array();
var knockTimer = 20 * 1000; //20 seconds
var knocker = 0;
var chairImg = new Image();
serverUrl = "http://satin.research.ltu.se:3001/";

//Plays the knocking sound
function knockSound() {
    audioElement.play();
}

//Notifys users of newly joined user by writing in chat
function hasJoinedTheRoom(username) {
    var message = username + " sat down at the table.";
    if($('#chatArea').val() !== "") {
        message = "\n"+message;
    }
    $('#chatArea').append(message);
    $('#chatArea').scrollTop($('#chatArea').scrollHeight);
}

//Clears feedback text fields
function clearFeedback() {
    $('#feedbackSubject').val("");
    $('#feedbackMail').val("");
    $('#feedbackMessage').val("");
}

//Close all streams, disconnect room, reset streams, clear text fields
function resetConnection() {
    localStream.close();
    dataStream.close();
    overhearStream.close();
    room.disconnect();
    overhearStream = Erizo.Stream({audio: false, video: false, data: true, attributes:{type:'overhear',username:nameOfUser}});
    localStream = Erizo.Stream({audio: true, video: true, data: false, attributes:{type:'media',username:nameOfUser}});
    dataStream = Erizo.Stream({audio: false, video: false, data: true, attributes:{type:'data',username:nameOfUser}});
    clearTextFields();
}

function stopOverhear() {
    overhearStream.close();
    room.disconnect();
    overhearStream = Erizo.Stream({audio: false, video: false, data: true, attributes:{type:'overhear',username:nameOfUser}});
    //toggles
}

//Adds room to knocklist
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

//Removes room from knocklist
function removeRoomFromKnocklist(roomId) {
    if(knockListYes.hasOwnProperty(roomId)) {
        delete knockListYes[roomId];
    }
    if(knockListNo.hasOwnProperty(roomId)) {
        delete knockListNo[roomId];
    }
}

function drawPath(color, thickness, path) {
    for (var i = 0; i < path.length; i+=2) {
        drawLine(color, thickness, path[i], path[i+1], path[i+2], path[i+3]);
    };
}

function drawLine (color, thickness, x1, y1, x2, y2) {
    context.strokeStyle = color;
    context.lineWidth   = thickness;

    context.beginPath();
    context.moveTo(x1, y1)
    context.lineTo(x2, y2);
    context.stroke();
}

//Adds eventlisteners to youtubeplayer
function onYouTubePlayerReady(playerId) {
  ytplayer = document.getElementById("myytplayer");
  ytplayer.addEventListener("onStateChange", "onytplayerStateChange");
}

//handler for youtube player state change
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
}

//Plays the youtube video
function play() {
    if (ytplayer) {
        ytplayer.playVideo();
    }
}

//Pauses the youtube video
function pause() {
    if (ytplayer) {
        ytplayer.pauseVideo();
    }
}

//Calculates leader. Highest stream ID wins. Only counts 'media' streams.
//Leader is used for sending snapshots to server
function calculateLeader() {
    var keys = [];
    var highest = parseInt(localStream.getID());
    for(i = 0; i<room.getStreamsByAttribute('type','media').length;i++) {
        var streamID = parseInt(room.getStreamsByAttribute('type','media')[i].getID());
        if (streamID > highest) highest=streamID;
    }
    console.log(highest);
    return highest;
}

function setLeader(id) {
    leader = id;
}

function getLeader() {
    return leader;
}

//Tells the room who the leader is.
function broadcastLeader() {
    dataStream.sendData({id:'leader',leader:leader});
    console.log('broadcasting leader');
}

function sendNapkinToNewUser() {
    var c = document.getElementById("canvasNapkin");
    var ctx = c.getContext("2d");
    var napkinImgData = c.toDataURL();
    dataStream.sendData({id:'currentNapkin', napkinImgData: napkinImgData});
}

//Clears textfields
function clearTextFields() {
    $('#chatArea').val("");
    $('#chatMessage').val("");
    $('#VideoUrl').val("");
}

//Appends chat message to chatArea
function appendChatMessage(username, message) {
    var message = username + ": " + message;
    var scrollbot = false;
    if($('#chatArea').val() !== "") {
        message = "\n"+message;
    }
    $('#chatArea').append(message);
    $('#chatArea').scrollTop($('#chatArea')[0].scrollHeight);
}

//Sends the chat message to other users
function sendChatMessage(message) {
    dataStream.sendData({id:'chat',text:message, user:nameOfUser});
    $('#chatMessage').val("");
    appendChatMessage(nameOfUser, message);
    $("#myTextBox").focus();
}

//Retrieves the query strings
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

//Update titles
var updateTitle = function(title) {
    $('#cafeTitle').html(title);
    $('#cafeTableTitle').html(title);
    $('#cafeVideoTitle').html(title);
}  

//Retrieves cafe tables
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

//Retrieves table image
var getTableImage = function(cafe, callback) {
    var req = new XMLHttpRequest();
    var url = serverUrl + 'api/getTableImg/' + cafe;

    req.onreadystatechange = function () {
        if (req.readyState === 4) {
            callback(req.responseText);
        }
    };

    req.open('GET', url, true);

    req.send();
};

function loadImage(imageData, elementID) {
    var myImage = new Image();
    myImage.onload = function(){
        $(myImage).appendTo(elementID);
    };
    myImage.src = imageData;
    myImage.className = 'centerImage';
}


window.onload = function () {
    chairImg.src="/img/emptyChair.jpg";
    cafe = getQueryString('cafe');

    var context = document.getElementById("canvasNapkin").getContext('2d');
    //focus "enternametextfield"
    $("#userName").focus();

    //Retrieves the IDs of the table for the chosen café
    getCafeTables(cafe, function (response) {
        var cafes = JSON.parse(response);
        var tc = document.getElementById("tablecontainer");
        if(cafes.hasOwnProperty('error')) {
            console.log(cafes.error);
        } else {
            updateTitle(cafes.name);
            tableId[1] = cafes.table1;
            tableId[2] = cafes.table2;
            tableId[3] = cafes.table3;
            tableId[4] = cafes.table4;
            tableId[5] = cafes.table5;
            tableId[6] = cafes.table6;

            getTableImage('Unik', function(response) {
                var res = JSON.parse(response);
                var hasImage = false;
                var imgId;
                var imgData
                if(!res.hasOwnProperty('empty')){
                    for(var i=1;i<=6;i++){
                        hasImage = false;
                        imgID = '#table'+i+'img';
                        for(var j=0;j<res.records.length;j++){
                            if(res.records[j].roomID == tableId[i]) {
                                console.log('i: ' + i + ', j: ' + j);
                                imgData = res.records[j].imageData;
                                loadImage(imgData, imgID);
                                hasImage = true;

                            }
                            console.log(imgID);
                        }

                        if(!hasImage) loadImage("http://placehold.it/320x200", imgID);

                    }
                }
            });

            /*getTableImage(cafe, function (response) {
                var tableImg = JSON.parse(response);
                console.log(tableImg);
                /*var tableImgId = '#table'+i+'img';
                console.log(tableImgId);
                if(tableImg.hasOwnProperty('empty')) {
                    console.log('DET HÄR ÄR FEEEEEEEEEEEEEEEL!');
                    if(tableImg.empty === true) {
                        var myImage = new Image();
                        myImage.onload = function(){
                            $(myImage).appendTo(tableImgId);
                        };
                        myImage.src = "http://placehold.it/320x200";
                    }
                } else {
                    console.log('DET HÄR ÄR RÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄTT!');
                    console.log(tableImgId);
                    imgData = tableImg.imageData;
                    var myImage = new Image();
                    myImage.onload = function(){
                        $(myImage).appendTo(tableImgId);
                    };
                    myImage.src = imgData;
                }*/
            //});
    
        }
    });

    //Initializes the audio element used for playing the knocking sound
    audioElement = document.createElement('audio');
    audioElement.setAttribute('src', '/media/knock.mp3');
    audioElement.load();

    //Sends a base64 string to server
    var sendTableImg = function(cafe, imgData, roomId, callback) {
        var req = new XMLHttpRequest();
        var url = serverUrl + 'api/sendTableImg/' + roomId;
        var body = {imgData: imgData,
                    cafe: cafe};

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

    //Creates token for the chosen café
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

    //loops through and takes a snapshot of each stream. Merges into one image, sends to server.
    function getSnapshots() {
        //Width and height of popover where the image will be displayed.
        var w = 320;
        var h = 200
        //Get all media streams
        var streams = room.getStreamsByAttribute('type','media');
        var length = streams.length;

        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');

        var height = $('#myVideo').height();
        var width = $('#myVideo').width();

        //what the image will look like with 6 media streams
        //'''''''''''''//
        //  1   2   3  //
        //  4   5   6  //
        //,,,,,,,,,,,,,//
        canvas.width = 3*width;
        canvas.height = 2*height;
        for(var i = 0; i<length;i++) {
            var y = 0;
            //if i>2, go to "second row" of image
            if (i>2) {
                var y = height;
            }
            
            //For some reason, the stream you get from room.getStreamsByAttribute
            // and room.remoteStreams that equals localStream, does not contain 
            //all the things localStream does, therefor, special case for LocalStream.
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

        for(var i = length; i<6;i++) {
            var y = 0;
            //if i>2, go to "second row" of image
            if (i>2) {
                var y = height;
            }
            context.drawImage(chairImg, (i%3)*width, y, width, height);        
        }

        //Draw the image on a new canvas in order to rescale.
        var canvas2 = document.createElement('canvas');
        var context2 = canvas2.getContext('2d');

        var imgData = canvas.toDataURL();
        var myImage = new Image();
        canvas2.width = 320;
        canvas2.height = 200;
        myImage.onload = function(){
            context2.drawImage(myImage, 0, 0,w,h);
            //console.log(canvas);
            //document.body.appendChild(canvas2);
            //Convert to base64 and send to server.
            sendTableImg(cafe, canvas2.toDataURL(), room.roomID, function (response) {
                console.log(response);
            });
        }; 
        myImage.src = imgData;
    }

    //Table buttons
    $('#table1').click(function() {
        knock(tableId[1]);
    });
    $('#table2').click(function() {
        knock(tableId[2]);
    });
    $('#table3').click(function() {
        knock(tableId[3]);
    });
    $('#table4').click(function() {
        knock(tableId[4]);
    });
    $('#table5').click(function() {
        knock(tableId[5]);
    });
    $('#table6').click(function() {
        knock(tableId[6]);
    });

    $('#ohtable1').click(function() {
        overhear(tableId[1]);
        $('#ohtable1').toggle();
        $('#stopohtable1').toggle();
        $('.overhearing').toggle();
    });
    $('#ohtable2').click(function() {
        overhear(tableId[2]);
        $('#ohtable2').toggle();
        $('#stopohtable2').toggle();
    });
    $('#ohtable3').click(function() {
        overhear(tableId[3]);
        $('#ohtable3').toggle();
        $('#stopohtable3').toggle();
    });
    $('#ohtable4').click(function() {
        overhear(tableId[4]);
        $('#ohtable4').toggle();
        $('#stopohtable4').toggle();
    });
    $('#ohtable5').click(function() {
        overhear(tableId[5]);
        $('#ohtable5').toggle();
        $('#stopohtable5').toggle();
    });
    $('#ohtable6').click(function() {
        overhear(tableId[6]);
        $('#ohtable6').toggle();
        $('#stopohtable6').toggle();
    });

    $('#stopohtable1').click(function() {
        stopOverhear(tableId[1]);
        $('#ohtable1').toggle();
        $('#stopohtable1').toggle();
    });
    $('#stopohtable2').click(function() {
        stopOverhear(tableId[2]);
        $('#ohtable2').toggle();
        $('#stopohtable2').toggle();
    });
    $('#stopohtable3').click(function() {
        stopOverhear(tableId[3]);
        $('#ohtable3').toggle();
        $('#stopohtable3').toggle();
    });
    $('#stopohtable4').click(function() {
        stopOverhear(tableId[4]);
        $('#ohtable4').toggle();
        $('#stopohtable4').toggle();
    });
    $('#stopohtable5').click(function() {
        stopOverhear(tableId[5]);
        $('#ohtable5').toggle();
        $('#stopohtable5').toggle();
    });
    $('#stopohtable6').click(function() {
        stopOverhear(tableId[6]);
        $('#ohtable6').toggle();
        $('#stopohtable6').toggle();
    });

    /*$("#table1").mouseover(function(){
        $("#table1").popover({title: 'Table 1', placement:'right', content : '<div id="overhearingContainer" class="hide"><div class="span3"><div id="overhear1"></div><div id="overhear2"></div><div id="overhear3"></div><div id="overhear4"></div><div id="overhear5"></div><div id="overhear6"></div></div></div>'
                    });
                    overhear(tableId1);
        /*getTableImage(tableId1, function (response) {
            var tableImg = JSON.parse(response);
            if(tableImg.hasOwnProperty('empty')) {
                if(tableImg.empty === true) {

                }
            } else {
                imgData = tableImg.imageData;
                var myImage = new Image();
                myImage.onload = function(){

                    /*$("#table1").popover({title: 'Table 1', placement:'right',html:true, content: '<canvas id="popoverimg"></canvas>'
                    });*/

                        
                    /*var canvas = document.getElementById('popoverimg');
                    var context = canvas.getContext('2d');
                    context.drawImage(myImage, 0, 0);
                };
                myImage.src = imgData;

            }
        });*/
    //});

    //Send chat message
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
        $('#enterNameRow').toggle();
        $('#inTableRow').toggle();
        $('#markis').toggle();
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
        $('#closeVideo').toggle();
        $('#myytplayer').replaceWith('<div id="youtubeVideo" class="embed-container hide"><a href="javascript:void(0);" onclick="play();">Play</a></div>');
        return false;
    }); 

    //Sends message details to server which in turn sends an email to iDipity google group
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

    $('#clearNapkin').click(function() {
        dataStream.sendData({id:'clearNapkin'});
        var c = document.getElementById("canvasNapkin");
        var ctx = c.getContext("2d");
        ctx.clearRect(0,0,c.width,c.height);
    });

    $('#saveNapkin').click(function() {
        var c = document.getElementById("canvasNapkin");
        var dataURL = c.toDataURL("image/png");
        window.open(c.toDataURL('image/png'));

        // Get file name from url.
        var filename = 'myNapkin';
        var xhr = new XMLHttpRequest();
        xhr.responseType = 'blob';
        xhr.onload = function() {
            var a = document.createElement('a');
            a.href = window.URL.createObjectURL(xhr.response); // xhr.response is a blob
            a.download = filename; // Set the file name.
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            delete a;
        };
        xhr.open('GET', url);
        xhr.send();

        /*var data = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
        window.location.href = data;*/
    });

    var enterName = function() {
        if($('#userName').val() !== "") {
            nameOfUser = $('#userName').val();
            $('#enterName').toggle();
            $('#tablecontainer').toggle();
            $('#markis').toggle();

            try {
                overhearStream = Erizo.Stream({audio: false, video: false, data: true, attributes:{type:'overhear',username:nameOfUser}});
                localStream = Erizo.Stream({audio: true, video: true, data: false, attributes:{type:'media',username:nameOfUser}});
                dataStream = Erizo.Stream({audio: false, video: false, data: true, attributes:{type:'data',username:nameOfUser}});
            } catch (error) {
                console.log('erizo error: ' + error);
            }

        // getTableImage(tableId1, function (response) {
        //     var tableImg = JSON.parse(response);
        //     if(tableImg.hasOwnProperty('empty')) {
        //         if(tableImg.empty === true) {
        //             console.log('ingen bild');
        //                                 //$("#table1").popover({title: 'Table 1', placement:'right', content : 'Café is empty'});
        //         }
        //     } else {
        //         var canvas = document.createElement('canvas');
        //                 var context = canvas.getContext('2d');
        //                 canvas.id = "tableImg" + tableId1;
        //                 imgData = tableImg.imageData;
        //                 console.log(tableImg);
        //                 console.log(imgData);
        //                 var myImage = new Image();
        //                 console.log('bilds!')

        //                 myImage.onload = function(){
        //                     console.log(myImage.width, myImage.height);
        //                     context.drawImage(myImage, 0, 0);
        //                     console.log(canvas);
        //                     document.body.appendChild(myImage);
        //                     document.body.appendChild(canvas);
        //                     console.log(myImage);
        //                 };
        //                 myImage.src = imgData;
                        


        //         //$("#table1").popover({title: 'Table 1', placement:'right',html:true, content : canvas
        //         //});
        //     }
        //});
        }
    };

    var askToJoinTablePopup = function(nameOfUser) {
        knockSound();
        $('#knocking').notify({ type: 'bangTidy', onYes:function () {dataStream.sendData({id:'popup-answer',user:nameOfUser, answer: true})}, onNo:function () {dataStream.sendData({id:'popup-answer',user:nameOfUser, answer: false})}, onClose:function () {dataStream.sendData({id:'popup-answer',user:nameOfUser, answer: false})}, message: { html: '<p style="color: grey"><b>Hey</b>, ' + nameOfUser +' wants to sit down, is that OK?</p>' }, fadeOut: { enabled: true, delay: knockTimer}}).show();
    };

    var deniedNotification = function(whatCase) {
        switch (whatCase) {
            case 1:
                $('#answer').notify({ fadeOut: { enabled: true, delay: 5000 }, type: 'bangTidy', question: false, message: { html: '<p style="color: grey"><b>Hey</b>, seems that the users want some privacy at the moment. Try again later!</p>' }}).show();
                break;
            case 2:
                $('#answer').notify({ fadeOut: { enabled: true, delay: 5000 }, type: 'bangTidy', question: false, message: { html: '<p style="color: grey"><b>Hey</b>, all the seats are taken at the moment. Try again later!</p>' }}).show();
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
                           "youtubeVideo", "80%", "400", "8", null, null, params, atts);

            $('#myytplayer').css ({visibility:'visible'});
            $('#writeUrl').show();
            $('#closeVideo').show();
            $('#VideoUrl').val("");
        }
    }

//---------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------

    var initialize = function(roomId) {
        $('#enterNameRow').toggle();
        $('#inTableRow').toggle();

        $('#chatArea').css({
            position:'absolute', 
            top: $(window).height() - $('#chatArea').height()*2-40,
            left:'0'
        });
        $('#chatMessage').css({
            position:'absolute', 
            top:  $('#chatArea').height()+$('#chatArea').position().top+20,
            left:'0'
        });
        $('#sendMessage').css({
            position:'absolute', 
            top:  $('#chatArea').height()+$('#chatArea').position().top+20,
            left:'81%'
        });
        $(window).resize(function() {
            $('#chatArea').css({
                position:'absolute', 
                top: $(window).height() - $('#chatArea').height()*2-40,
                left:'0'
            });
            $('#chatMessage').css({
                position:'absolute', 
                top:  $('#chatArea').height()+$('#chatArea').position().top+20,
                left:'0'
            });
            $('#sendMessage').css({
                position:'absolute', 
                top:  $('#chatArea').height()+$('#chatArea').position().top+20,
                left:'81%'
            });
        });
        $('#chatArea').scrollTop($('#chatArea').scrollHeight);
        $('#chatArea').width('100%');
        $('#chatMessage').width('80%');
        $('#sendMessage').width('19%');

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
                                }).appendTo('#vid'+i);
                            stream.show("test" + stream.getID());
                            $(window).resize(function() {
                                var videoheight = $('#vid'+1).width()/1.33;
                                $(stream.getID()).height(videoheight);
                            });
                            return;
                        }
                    }
                    console.log("There is no seat available at this table!");
                }
                if(leader === localStream.getID()) {
                    getSnapshots();
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
                var currStreams = room.getStreamsByAttribute('type','media');
                if(currStreams.length === 1 && parseInt(currStreams[0].getID()) === localStream.getID()) {
                    console.log('Snapshot sent at ' + Date.now());
                    leader = localStream.getID();
                    getSnapshots();
                    setInterval(function(){
                        console.log('Snapshot sent at ' + Date.now());
                        getSnapshots();
                    },1000*60*5);
                } else if(leader === localStream.getID()) {
                    broadcastLeader();
                    sendNapkinToNewUser();
                    //getSnapshots();
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
                        leader = calculateLeader();
                        if(leader === localStream.getID()) {
                            console.log('Snapshot sent at ' + Date.now());
                            getSnapshots();
                            setInterval(function(){
                                console.log('Snapshot sent at ' + Date.now());
                                getSnapshots();
                            },1000*60*5);
                        }
                        console.log(calculateLeader());
                    } else if (leader === localStream.getID()) {
                        getSnapshots();
                    }
                    
                    console.log("Removing " + stream.elementID);
                    var streamToRemove = $('#'+stream.elementID);
                    var vidElementNr = parseInt(streamToRemove.parent()[0].id[3])+1;
                    streamToRemove.remove();
                    
                    streams = room.getStreamsByAttribute('type','media');                    
                    while($('#vid'+vidElementNr).children().length != 0) {
                        var prevStream = '#vid'+(vidElementNr-1);
                        var nextStream = '#vid'+(vidElementNr);
                        for (var i = 0; i < streams.length; i++) {

                            if(streams[i].elementID == $(nextStream).children()[0].id) {
                                
                                var streamID = $(nextStream).children()[0].id;
                                streams[i].hide(streamID);
                                $('#'+streamID).remove();
                                $('<div></div>', {
                                    id: 'test'+streams[i].getID()
                                }).appendTo(prevStream);
                                streams[i].show("test" + streams[i].getID());
                                break;
                            }
                        }
                        vidElementNr++;
                    }
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

//---------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------

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
                        if(room.getStreamsByAttribute('type','media').length < 6) {
                            if(room.getStreamsByAttribute('type','media').length > 1) {
                                knockSound();
                            }
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
                                                console.log('Visa video stream');
                                            };
                                        }
                                        break;
                                    case "paint":
                                        if(localStream.showing === true) {
                                            drawPath(evt.msg.color, evt.msg.thickness, evt.msg.path);
                                        }
                                        break;
                                    case "currentNapkin":
                                        if(localStream.showing === true) {
                                            var c = document.getElementById("canvasNapkin");
                                            var ctx = c.getContext("2d");
                                            var myImage = new Image();
                                            myImage.onload = function(){
                                                ctx.drawImage(myImage, 0, 0,c.width,c.height);
                                            }; 
                                            myImage.src = evt.msg.napkinImgData;
                                        }
                                        break;
                                    case "clearNapkin":
                                        if(localStream.showing === true) {
                                            var c = document.getElementById("canvasNapkin");
                                            var ctx = c.getContext("2d");
                                            ctx.clearRect(0,0,c.width,c.height);
                                            console.log('Clear napkin');
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

//---------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------

    var overhear = function(roomId) {
            var videoheight = $('#table2img').height/2;
            $('.overhearVidContainer').height(videoheight)
            $(window).resize(function() {
                var videoheight = $('#table2img').height/2;
                $('.overhearVidContainer').height(videoheight)
            });
        createToken(roomId, "user", "role", function (response) {
            var token = response;
            console.log('token created ', token);
            L.Logger.setLogLevel(L.Logger.DEBUG);
            room = Erizo.Room({token: token});

            overhearStream.addEventListener("access-accepted", function () {
                
                var subscribeToStreams = function (streams) {
                    if (!overhearStream.showing) {
                        overhearStream.show();
                    }
                    var index, stream;
                    for (index in streams) {
                        if (streams.hasOwnProperty(index)) {
                            stream = streams[index];
                            if (overhearStream !== undefined && overhearStream.getID() !== stream.getID()) {
                                room.subscribe(stream);
                            } else {
                                console.log("My own stream");
                            }
                        }
                    }
                };

                room.addEventListener("room-connected", function (roomEvent) {
                    // Publish my stream
                    room.publish(overhearStream);
                    //If table is empty
                    if(room.getStreamsByAttribute('type','media').length === 0) {
                        console.log('Room is empty!')
                    } else {
                        // Subscribe to other streams
                        subscribeToStreams(room.getStreamsByAttribute('type','media'));
                    }
                });

                room.addEventListener("stream-subscribed", function(streamEvent) {
                    var stream = streamEvent.stream;
                    if (stream.getAttributes().type === 'media') {
                        for (var i = 1; i <= 6; i++) {
                            if ($('#overhear'+i).children().length === 0) {
                                $('<div></div>', {
                                    id: 'test'+stream.getID()
                                }).css('width','100%').appendTo('#overhear'+i);
                                stream.show("test" + stream.getID());
                                return;
                            }
                        }
                        console.log("There is no seat available at this table!");
                    } 
                });

                room.connect();       

            });
            overhearStream.init();
        });  
    }
};
//})();
