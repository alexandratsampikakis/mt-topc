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
var currentTable;
//Plays the knocking sound
function knockSound() {
    audioElement.play();
}

function toggleButton(element) {
   if(element.css('display') === 'none') {
       element.css('display','inline-block') 
   } else {
       element.css('display','none');
   }
}

function resetOverhearing() {
    $('.ohbutton').show();
    $('.stopohbutton').hide();
    $('.overhearing').remove();
    $('.tableImg').show();
    overhearStream.close();
    if(room != undefined) room.disconnect();
    overhearStream = Erizo.Stream({audio: false, video: false, data: true, attributes:{type:'overhear',username:nameOfUser}});
}

function appendOverhearing(id) {
    $('#overhearingContainer'+id).append('<div class="row-fluid overhearing">\
                    <div id="overhear1" class="span4 overhearVidContainer">\
                    </div>\
                    <div id="overhear2" class="span4 overhearVidContainer">\
                    </div>\
                    <div id="overhear3" class="span4 overhearVidContainer">\
                    </div>\
                </div>\
                <div class="row-fluid overhearing">\
                    <div id="overhear4" class="span4 overhearVidContainer">\
                    </div>\
                    <div id="overhear5" class="span4 overhearVidContainer">\
                    </div>\
                    <div id="overhear6" class="span4 overhearVidContainer">\
                    </div>\
                </div>')
    $('#table'+id+'img').toggle();
    var videoheight = $('#table2img').height()/2;
    var videoheight2 = $('#table1img').height()/2;
    if(videoheight2 < videoheight) videoheight=videoheight2;
    $('.overhearVidContainer').height(videoheight)
    $(window).resize(function() {
        var videoheight = $('#table2img').height()/2;
        var videoheight2 = $('#table1img').height()/2;
        if(videoheight2 < videoheight) videoheight=videoheight2;
        $('.overhearVidContainer').height(videoheight)
    });
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

function redrawNapkin() {
    var c = $('#canvasNapkin')[0];
    var imgData = c.toDataURL();
    var ctx = c.getContext("2d");
    var myImage = new Image();
    myImage.onload = function(){
        ctx.drawImage(myImage, 0, 0,c.width,c.height);
    }; 
    myImage.src = imgData;
    c.height = $(window).height() - 415;
    c.width = 1.5*c.height;
}

function drawPath(color, thickness, path, width, height) {
    var widthRatio = $('#canvasNapkin')[0].width/width;
    var heightRatio = $('#canvasNapkin')[0].height/height;
    for (var i = 0; i < path.length; i+=2) {
        drawLine(color, thickness, path[i]*widthRatio, path[i+1]*heightRatio, path[i+2]*widthRatio, path[i+3]*heightRatio);
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
var pingServer = function(callback) {
    var req = new XMLHttpRequest();
    var url = serverUrl + 'api/ping';

    req.onreadystatechange = function () {
        if (req.readyState === 4) {
            callback(req.responseText);
        }
    };

    req.open('GET', url, true);

    req.send();
};

function pingForLeader() {
    
    var pingTime = 0;
    var prePingTime = new Date().getTime();
    pingServer(function() {
        pingTime = new Date().getTime() - prePingTime;
        prePingTime = new Date().getTime();

        pingServer(function() {
            pingTime = pingtime + new Date().getTime() - prePingTime;
            prePingTime = new Date().getTime();

            pingServer(function() {
                pingTime = pingtime + new Date().getTime() - prePingTime;
                return pingTime/3;
            }) 
        }) 
    }) 
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
    redrawNapkin();
    var doit;
    $(window).resize(function() {
        clearTimeout(doit);
        doit = setTimeout(function() {
            redrawNapkin();
        }, 100);
    });
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

            getTableImage(cafe, function(response) {
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

                        if(!hasImage) loadImage("/img/emptyTable.gif", imgID);

                    }
                }
            });    
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

    function initOversee(imageData, elementID) {
        var myImage = new Image();
        myImage.onload = function(){
            $(myImage).appendTo(elementID);
        };
        myImage.src = imageData;
        myImage.width=($(window).width()/6)+0.2;
        myImage.height = myImage.width/1.6;
    }


    function overseeInTable() {
        var maxHeight = ($(window).width()/6)/1.6
        $("#menuContainer").resizable({maxHeight:maxHeight});
        getCafeTables(cafe, function (response) {
        var cafes = JSON.parse(response);
        if(cafes.hasOwnProperty('error')) {
            console.log(cafes.error);
        } else {
            
            tableId[1] = cafes.table1;
            tableId[2] = cafes.table2;
            tableId[3] = cafes.table3;
            tableId[4] = cafes.table4;
            tableId[5] = cafes.table5;
            tableId[6] = cafes.table6;

            getTableImage(cafe, function(response) {
                var res = JSON.parse(response);
                var hasImage = false;
                var imgId;
                var imgData
                if(!res.hasOwnProperty('empty')){
                    for(var i=1;i<=6;i++){
                        hasImage = false;
                        for(var j=0;j<res.records.length;j++){
                            if(res.records[j].roomID == tableId[i]) {
                                imgData = res.records[j].imageData;
                                if(res.records[j].roomID != currentTable ) {
                                    initOversee(imgData, '#ddMenu');
                                }
                                
                                hasImage = true;

                            }
                            console.log(imgID);
                        }

                        if(!hasImage) initOversee("/img/emptyTable.gif", '#ddMenu');

                    }
                }
            });    
        }
    });
    }
    var h = parseInt($("#menuContainer").css('height')); //height mentioned in css- feel free to change
    var open = false;
    $("#menuContainer").resizable({ 
            handles: {
                "s":"#grippie"   
            },
            maxHeight:200, 
            minHeight:0,
            resize: function(){
                if($(this).height()<=h){
                    if(open === true) {
                        $("#ddMenu").hide();
                        $('#ddMenu').empty();
                        open = false;
                    }

                }else{
                    if(open === false) {
                        overseeInTable();
                        $("#ddMenu").show();
                        open = true;
                    }
                }
                
            }
    });

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
        resetOverhearing();
        overhear(tableId[1]);
        appendOverhearing(1);
        $('#ohtable1').toggle();
        toggleButton($('#stopohtable1'));
    });
    $('#ohtable2').click(function() {
        resetOverhearing();
        overhear(tableId[2]);
        appendOverhearing(2);
        $('#ohtable2').toggle();
        toggleButton($('#stopohtable2'));
    });
    $('#ohtable3').click(function() {
        resetOverhearing();
        overhear(tableId[3]);
        appendOverhearing(3);
        $('#ohtable3').toggle();
        toggleButton($('#stopohtable3'));
    });
    $('#ohtable4').click(function() {
        resetOverhearing();
        overhear(tableId[4]);
        appendOverhearing(4);
        $('#ohtable4').toggle();
        toggleButton($('#stopohtable4'));
    });
    $('#ohtable5').click(function() {
        resetOverhearing();
        overhear(tableId[5]);
        appendOverhearing(5);
        $('#ohtable5').toggle();
        toggleButton($('#stopohtable5'));
    });
    $('#ohtable6').click(function() {
        resetOverhearing();
        overhear(tableId[6]);
        appendOverhearing(6);
        $('#ohtable6').toggle();
        toggleButton($('#stopohtable6'));
    });

    $('#stopohtable1').click(function() {
        resetOverhearing();
        $('#ohtable1').show();
        $('#stopohtable1').hide();
    });
    $('#stopohtable2').click(function() {
        resetOverhearing();
        $('#ohtable2').show();
        $('#stopohtable2').hide();
    });
    $('#stopohtable3').click(function() {
        resetOverhearing();
        $('#ohtable3').show();
        $('#stopohtable3').hide();
    });
    $('#stopohtable4').click(function() {
        resetOverhearing();
        $('#ohtable4').show();
        $('#stopohtable4').hide();
    });
    $('#stopohtable5').click(function() {
        resetOverhearing();
        $('#ohtable5').show();
        $('#stopohtable5').hide();
    });
    $('#stopohtable6').click(function() {
        resetOverhearing();
        $('#ohtable6').show();
        $('#stopohtable6').hide();
    });

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
        $('#menuContainer').toggle();
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
        ctx = c.getContext("2d");
        c.toBlob(function(blob) {
            saveAs(blob, "myNapkin.png");
        });
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
        currentTable = roomId;
        $('#enterNameRow').toggle();
        $('#inTableRow').toggle();
        $('#menuContainer').toggle();
        $('#chatArea').css({
            position:'absolute', 
            top: $(window).height() - $('#chatArea').height()*2-56,
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
                top: $(window).height() - $('#chatArea').height()*2-56,
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
            if (room.getStreamsByAttribute('type','media').length < 6) {

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
                    console.log('HÄÄÄÄÄÄÄR FÖRST: ' + room.getStreamsByAttribute('type','media'));
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
                    if(leader === undefined) leader = calculateLeader;
                    if(leader === localStream.getID()) {
                        getSnapshots();
                    } 
                    console.log('HÄÄÄÄÄÄÄR TVÅ: ' + room.getStreamsByAttribute('type','media'));
                });

                room.addEventListener("stream-added", function (streamEvent) {
                    console.log('nrOfStreams: ' + room.getStreamsByAttribute('type','media').length);
                    console.log('Comparing Streams: ' + (streamEvent.stream.getID() === localStream.getID()) );
                    if(room.getStreamsByAttribute('type','media').length > 6 && streamEvent.stream.getID() === localStream.getID()) {
                        console.log('To many streams, leaving room.');
                        resetConnection();
                        $('#enterNameRow').toggle();
                        $('#inTableRow').toggle();
                        deniedNotification(2);
                    } else {
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
                        }  
                    }
                    
                    console.log('HÄÄÄÄÄÄÄR: ' + room.getStreamsByAttribute('type','media'));
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

                console.log('FÖRST: '+room.getStreamsByAttribute('type','media'));
                // Publish my stream
                room.publish(localStream);
                console.log('ANDRA: '+room.getStreamsByAttribute('type','media'));
                // Subscribe to other streams
                subscribeToStreams(room.getStreamsByAttribute('type','media'));
            } else {
                resetConnection();
                $('#enterNameRow').toggle();
                $('#inTableRow').toggle();
                deniedNotification(2);
            } 
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
                                            drawPath(evt.msg.color, evt.msg.thickness, evt.msg.path, evt.msg.width, evt.msg.height);
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
        var videoheight = $('#table2img').height()/2;
        var videoheight2 = $('#table1img').height()/2;
        if(videoheight2 < videoheight) videoheight=videoheight2;
        $('.overhearVidContainer').height(videoheight)
        $(window).resize(function() {
            var videoheight = $('#table2img').height()/2;
            var videoheight2 = $('#table1img').height()/2;
            if(videoheight2 < videoheight) videoheight=videoheight2;
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
