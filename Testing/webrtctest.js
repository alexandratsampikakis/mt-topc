  function test(hej) {
      var he = hej*hej;
      console.log(he);
    }

if (Meteor.isClient) {

  Template.youtube.rendered = function() {
    if(!this._rendered) {
      this._rendered = true;
    }
  };

   

    Template.youtube.events = {
    'click input.btn': function() {
      var videoURL = document.getElementById("new_video_url").value;
      videoURL = 'http://www.youtube.com/embed/' + videoURL.split('=')[1];
      console.log(videoURL);
      console.log(Session.equals('playerLoaded', true));
      if(Session.equals('playerLoaded', true)) {
        console.log("hejja");
        var youtubeplayer = document.getElementById('ytplayer');
        youtubeplayer.setAttribute('src', videoURL);
      } else {
        var youtubeplayer = document.createElement("iframe");
        youtubeplayer.setAttribute('id', 'ytplayer');
        youtubeplayer.setAttribute('type', 'text/html');
        youtubeplayer.setAttribute('width', '640');
        youtubeplayer.setAttribute('height', '360');
        youtubeplayer.setAttribute('src', videoURL);
        youtubeplayer.setAttribute('frameborder', '0');
        document.body.insertBefore(youtubeplayer, document.body.childNodes[4]);
        Session.set("playerLoaded", true);
      }
      
    }

  
  };
}


