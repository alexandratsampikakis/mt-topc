function onYouTubePlayerReady(playerId) {
  ytplayer = document.getElementById("myytplayer");
  ytplayer.addEventListener("onStateChange", "onytplayerStateChange");
}

function onytplayerStateChange(newState, stream) {
	switch (newState) {
        case 1:
            //play
            stream.sendData({id:'ytplayer', state:1})
            break;
        case 2:
            //pause
            stream.sendData({id:'ytplayer', state:2})
            break;
        case "leader":
            console.log('message received :E');
            setLeader(evt.msg.leader);
       default:
          
    }
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

window.onload = function () {

  $('#shareVideo').click(function() {
        $('#writeUrl').toggle();
        return false;
    });
    $('#getVideoUrl').click(function() {
        if($('#VideoUrl').val() !== "") {
            urlVideo = $('#VideoUrl').val();
            showVideo(urlVideo);
        }
        return false;
    });
    $('#closeVideo').click(function() {
        $('#youtubeVideo').toggle();
        $('#closeVideo').toggle();
        return false;
    });

    var showVideo = function(urlVideo) {
        /*<iframe width="80%" height="300"
            src="http://www.youtube.com/embed/XGSy3_Czz8k">
        </iframe>*/
        var params = { allowScriptAccess: "always" };
        var atts = { id: "myytplayer" };
        swfobject.embedSWF("http://www.youtube.com/v/" + urlVideo + "?enablejsapi=1&playerapiid=ytplayer&version=3",
                       "youtubeVideo", "80%", "300", "8", null, null, params, atts);

        $('#youtubeVideo').show();
        $('#writeUrl').toggle();
        $('#closeVideo').show();
    }
}