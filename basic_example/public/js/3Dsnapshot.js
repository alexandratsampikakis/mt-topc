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
    req.send(JSON.stringify(body));
};

//Loops through and takes a snapshot of each stream. Merges into one image, sends to server.
function getSnapshots() {
    //Width and height of popover where the image will be displayed.
    var w = 320;
    var h = 200

    //Get all media streams
    var streams = room.getStreamsByAttribute('type','media');
    var length = streams.length;

    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');

    //what the image will look like with 6 media streams
    //'''''''''''''//
    //  1   2   3  //
    //  4   5   6  //
    //,,,,,,,,,,,,,//
    canvas.width = 3*w;
    canvas.height = 2*h;
    for(var i = 0; i<length;i++) {
        var y = 0;
        //if i>2, go to "second row" of image
        if (i>2) {
            var y = h;
        }
        
        //For some reason, the stream you get from room.getStreamsByAttribute
        //and room.remoteStreams that equals localStream, does not contain 
        //all the things localStream does, therefor, special case for LocalStream.
        if(streams[i].getID() === localStream.getID()) {
            var bitmap;
            bitmap = localStream.getVideoFrame();
            context.putImageData(bitmap, (i%3)*w, y);
            document.body.appendChild(canvas);        
        } else {
            var bitmap;
            bitmap = streams[i].getVideoFrame();
            context.putImageData(bitmap, (i%3)*w, y);
        }

    }

    for(var i = length; i<6;i++) {
        var y = 0;
        //if i>2, go to "second row" of image
        if (i>2) {
            var y = h;
        }
        context.drawImage(chairImg, (i%3)*w, y, w, h);        
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
        
        //Convert to base64 and send to server.
        sendTableImg(cafe, canvas2.toDataURL(), room.roomID, function (response) {
            console.log(response);
        });
    }; 
    myImage.src = imgData;
}

//Checks if a new users video stream is ready for snapshot
var isVideoLoaded = function(streamId) {
    setTimeout(function(){
        console.log("strömID: " + streamId);
        if($('#stream'+streamId).length > 0 && $('#stream'+streamId)[0].readyState === 4) {
            console.log('Snapshot sent at ' + Date.now());
            getSnapshots();
        } else {
            console.log("nope!");
            isVideoLoaded(streamId);
        }
    },1000*5);
}