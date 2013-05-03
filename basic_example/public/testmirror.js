/*
	Three.js "tutorials by example"
	Author: Lee Stemkoski
	Date: March 2013 (three.js v56)
 */

// standard global variables
var container, scene, camera, renderer, controls, stats;
var keyboard = new THREEx.KeyboardState();
var clock = new THREE.Clock();

// custom global variables
var mirrorSphere, mirrorSphereCamera; // for mirror material

var room, localStream, serverUrl;
var tableId = "513dcfda07aa2f143700001c";
serverUrl = "http://satin.research.ltu.se:3001/";
var count = 0;
var streams = [];
var vid, videoTexture, geometry, streamer, videoImageContext, dae, skin;
var scene = new THREE.Scene();
var position = [[],[-10,4,0,0.2*Math.PI],[10,4,0,-0.2*Math.PI],[-10,0,0,0.2*Math.PI],[10,0,0,-0.2*Math.PI],[-10,-4,0,0.2*Math.PI],[10,-4,0,-0.2*Math.PI]];


init();
animate();

// FUNCTIONS 		
function init() {
	// SCENE
	scene = new THREE.Scene();

	// CAMERA
	camera = new THREE.PerspectiveCamera(70, window.innerWidth/window.innerHeight, 0.1, 1000);
	var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
	var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
	//camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
	scene.add(camera);
	camera.position.set(0,0,10);
	camera.lookAt(scene.position);

	// RENDERER
	if ( Detector.webgl )
		renderer = new THREE.WebGLRenderer( {antialias:true} );
	else
		renderer = new THREE.CanvasRenderer(); 
	renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT-82);
	container = document.createElement( 'div' );
	document.body.appendChild( container );
	container.appendChild( renderer.domElement );

	// EVENTS
	THREEx.WindowResize(renderer, camera);
	//THREEx.FullScreen.bindKey({ charCode : 'm'.charCodeAt(0) });

	// CONTROLS
	controls = new THREE.TrackballControls( camera );
	// STATS
	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.bottom = '0px';
	stats.domElement.style.zIndex = 100;
	//container.appendChild( stats.domElement );

	// LIGHT
	var light = new THREE.PointLight(0xffffff);
	light.position.set(0,250,0);
	scene.add(light);

	// FLOOR
	var floorTexture = new THREE.ImageUtils.loadTexture( '/img/wood.jpg' );
	floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping; 
	floorTexture.repeat.set( 10, 10 );
	var floorMaterial = new THREE.MeshBasicMaterial( { map: floorTexture, side: THREE.DoubleSide } );
	var floorGeometry = new THREE.PlaneGeometry(20, 20, 10, 10);
	var floor = new THREE.Mesh(floorGeometry, floorMaterial);
	floor.position.y = -0.5;
	floor.rotation.x = Math.PI / 2;
	scene.add(floor);
	
	// SKYBOX/FOG
	var materialArray = [];
	materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( '/img/Backgrounds/grey_wash_wall/3d1turkos.png' ) }));
	materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( '/img/Backgrounds/grey_wash_wall/3d1turkos.png' ) }));
	materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( '/img/Backgrounds/grey_wash_wall/3d1turkos.png' ) }));
	materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( '/img/Backgrounds/grey_wash_wall/3d1turkos.png' ) }));
	materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( '/img/Backgrounds/grey_wash_wall/3d1turkos.png' ) }));
	materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( '/img/Backgrounds/grey_wash_wall/3d1turkos.png' ) }));
	for (var i = 0; i < 6; i++)
	   materialArray[i].side = THREE.BackSide;
	var skyboxMaterial = new THREE.MeshFaceMaterial( materialArray );
	var skyboxGeom = new THREE.CubeGeometry( 5000, 5000, 5000, 1, 1, 1 );
	var skybox = new THREE.Mesh( skyboxGeom, skyboxMaterial );
	scene.add( skybox );
	
	////////////
	// CUSTOM //
	////////////
	var sphereGeom =  new THREE.SphereGeometry( 50, 32, 16 ); // radius, segmentsWidth, segmentsHeight
	mirrorSphereCamera = new THREE.CubeCamera( 0.1, 5000, 512 );
	scene.add( mirrorSphereCamera );
	var mirrorSphereMaterial = new THREE.MeshBasicMaterial( { envMap: mirrorSphereCamera.renderTarget } );
	mirrorSphere = new THREE.Mesh( sphereGeom, mirrorSphereMaterial );
	mirrorSphere.position.set(75,50,0);
	mirrorSphereCamera.position = mirrorSphere.position;
	scene.add(mirrorSphere);

}

function animate() {
    requestAnimationFrame( animate );
	render();		
	update();
}

function update() {
	if ( keyboard.pressed("z") ) 
	{ 
		// do something
	}
	
	controls.update();
	stats.update();
}

function render() {
	updateVideos();

	mirrorSphere.visible = false;
	mirrorSphereCamera.updateCubeMap( renderer, scene );
	mirrorSphere.visible = true;
	
	renderer.render( scene, camera );
}

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
    movieScreen.position.set(x,y,z);
    movieScreen.rotation.y += rot;
    scene.add(movieScreen);
    var newStream = new StreamObject(vid, videoTexture, videoImageContext);
    streams.push(newStream);
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
        req.send(JSON.stringify(body));
    };

    var initialize = function(roomId) {
        
        createToken(roomId, "user", "role", function (response) {
            var token = response;
            console.log('token created ', token);
            L.Logger.setLogLevel(L.Logger.DEBUG);
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