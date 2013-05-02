var room, localStream, serverUrl;
var tableId = "513dcfda07aa2f143700001c";
serverUrl = "http://satin.research.ltu.se:3001/";
var count = 0;
var streams = [];
var vid, videoTexture, material, geometry, streamer, videoImageContext, dae, skin;
var scene = new THREE.Scene();
var bgScene = new THREE.Scene();
var bgCam = new THREE.Camera();
var camera = new THREE.PerspectiveCamera(70, window.innerWidth/window.innerHeight, 0.1, 1000);
var position = [[],[-11,4,0,0.2*Math.PI],[11,4,0,0.8*Math.PI],[-11,0,0,0.2*Math.PI],[11,0,0,0.8*Math.PI],[-11,-4,0,0.2*Math.PI],[11,-4,0,0.8*Math.PI]];
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight-82);
document.body.appendChild(renderer.domElement);

camera.position.z = 10;
var initialize = function() {
    var bg = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2, 0),
    new THREE.MeshBasicMaterial({map:THREE.ImageUtils.loadTexture('img/Backgrounds/grey_wash_wall/bluegrey_wash_wall_@2X.png')})
    );

    // The bg plane shouldn't care about the z-buffer.
    bg.material.depthTest = false;
    bg.material.depthWrite = false;

    bgScene = new THREE.Scene();
    bgCam = new THREE.Camera();
    bgScene.add(bgCam);
    bgScene.add(bg);
};

var StreamObject = function(video, texture, context){
    this.video = video;
    this.videoTexture = texture;
    this.context = context;
    return this;
};
StreamObject.prototype.getVideo = function(){
    return this.video;
};
StreamObject.prototype.getTexture = function(){
    return this.videoTexture;
};

StreamObject.prototype.getContext = function(){
    return this.context;
};


function initVideo(stream,pos) {
    var x = position[pos][0];
    var y = position[pos][1];
    var z = position[pos][2];
    var rot = position[pos][3];
    var vid, canvas;
    if(stream.getID() === localStream.getID()) {
        vid = localStream.player.video;
    } else {
        vid = stream.player.video;
    }
    //document.getElementById('streamundefined');

    
    vid.style.width = '320px';
    vid.style.height = '240px';
    vid.autoplay = true;
    canvas = $('<canvas width="320" height="240"></canvas>').appendTo('#canvases')[0];
    var videoImageContext = canvas.getContext('2d');

    videoTexture = new THREE.Texture( canvas );
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    //var x = room.getStreamsByAttribute('type','media').length;
    var movieMaterial = new THREE.MeshBasicMaterial( { map: videoTexture, overdraw: true, side:THREE.DoubleSide } );
    // the geometry on which the movie will be displayed;
    //      movie image will be scaled to fit these dimensions.
    var movieGeometry = new THREE.PlaneGeometry(  4, 4);
    var movieScreen = new THREE.Mesh( movieGeometry, movieMaterial );
    //movieScreen.position.set(1*count,1*count,0);
    movieScreen.position.set(x,y,z);
    movieScreen.rotation.y += rot;
    scene.add(movieScreen);
    var newStream = new StreamObject(vid, videoTexture, videoImageContext);
    streams.push(newStream);
    count++;
}

function updateVideos() {
    var vid;
    var videoImageContext;
    var videoTexture; 

    for (var i = 0; i < streams.length; i++) {
        vid = streams[i].getVideo();
        videoImageContext = streams[i].getContext();
        videoTexture = streams[i].getTexture();
        if ( vid.readyState === vid.HAVE_ENOUGH_DATA ) {
            videoImageContext.drawImage( vid, 0, 0, 320, 240 );
               if ( videoTexture ) videoTexture.needsUpdate = true;
        }
    };
}

function render() {   
    requestAnimationFrame(render);
    updateVideos();

    renderer.render( bgScene, bgCam );
    renderer.render( scene, camera );
}
window.onload = function () {
StreamObject.prototype.getVideo = function(){
    return this.video;
};
StreamObject.prototype.getTexture = function(){
    return this.videoTexture;
};

StreamObject.prototype.getContext = function(){
    return this.context;
};
	try {
      localStream = Erizo.Stream({audio: true, video: true, data: true, attributes:{type:'media'}});
    } catch (error) {
        console.log('erizo error: ' + error);
    }
    //Creates token for the chosen café
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

    // Collada model
    //lib/three.js/mrdoob-three.js-28136e7/examples/models/tv-model/meuble_tv.dae

    var loader = new THREE.ColladaLoader();
    loader.options.convertUpAxis = true;
    //loader.load( 'models/collada/monster/monster.dae', function ( collada ) {
    loader.load( '/lib/three.js/mrdoob-three.js-28136e7/examples/models/tv-model/meuble_tv4.dae', function ( collada ) {
    //loader.load( '/lib/three.js/mrdoob-three.js-28136e7/examples/models/collada/monster/monster.dae', function ( collada ) {
        dae = collada.scene;
        skin = collada.skins[ 0 ];

        dae.scale.x = dae.scale.y = dae.scale.z = 2;
        dae.position.x = 0;
        dae.position.z = 3;
        dae.updateMatrix();

        scene.add(dae);

    } );

    var initialize = function(roomId) {
        //
        createToken(roomId, "user", "role", function (response) {
            var token = response;
            console.log('token created ', token);
            L.Logger.setLogLevel(L.Logger.DEBUG);
            //L.Logger.debug("Connected!");
            room = Erizo.Room({token: token});

            localStream.addEventListener("access-accepted", function () {
                
                var subscribeToStreams = function (streams) {
                    console.log("subscribe to streams");
                    if (!localStream.showing) {
                        localStream.show();
                        console.log("LocalStream showing");
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
                    console.log("streams: " + roomEvent.streams.length);
                });

                room.addEventListener("stream-subscribed", function(streamEvent) {
                    console.log("stream stream-subscribed");
                    var stream = streamEvent.stream;
                    
                    for (var i = 2; i <= 6; i++) {
                        if ($('#vid'+i).children().length === 0) {
                            $('<div></div>', {
                                id: 'test'+stream.getID()
                            }).css('width','100%').appendTo('#vid'+i);
                            stream.show("test" + stream.getID());
                            console.log("InitVideo stream-subscribed");
                            initVideo(stream,i);                            
                            return;
                        }
                    }

                    console.log("There is no seat available at this table!");
                });

                room.addEventListener("stream-added", function (streamEvent) {
                    // Subscribe to added streams
                    var streams = [];
                    streams.push(streamEvent.stream);
                    subscribeToStreams(streams);

                    //If table is empty, become the leader
                    var currStreams = room.getStreamsByAttribute('type','media');
                    console.log('InitVideo stream-added');
                    if(streamEvent.stream.getID() === localStream.getID()) {
                        initVideo(streamEvent.stream,1);
                    }
                    render();
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

                room.connect();        

                localStream.show("vid1");
            });
			localStream.init();
		});
	}
	initialize(tableId);
}
//render();*/

