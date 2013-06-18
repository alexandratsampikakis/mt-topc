
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