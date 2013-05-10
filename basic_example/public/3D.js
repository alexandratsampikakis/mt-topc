var room, localStream, serverUrl;
var tableId = "513dcfda07aa2f143700001c";
serverUrl = "http://satin.research.ltu.se:3001/";
var streams = [];
var vid, videoTexture, geometry, streamer, videoImageContext, dae, skin;

var reflectionCamera;

var MovingCube, textureCamera;
var screenScene, screenCamera, firstRenderTarget, finalRenderTarget;

var mouse = new THREE.Vector2(), INTERSECTED;
var projector, raycaster;

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(70, window.innerWidth/window.innerHeight, 0.1, 1000);
var mirrorCube, mirrorCubeCamera; // for mirror material
var position = [[],[-10,4,0,0.2*Math.PI],[10,4,0,-0.2*Math.PI],[-10,0,0,0.2*Math.PI],[10,0,0,-0.2*Math.PI],[-10,-4,0,0.2*Math.PI],[10,-4,0,-0.2*Math.PI]];

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight-82);
document.body.appendChild(renderer.domElement);

THREEx.WindowResize(renderer, camera);
camera.position.z = 10;

var initScene = function() {

    // var cubeGeom = new THREE.CubeGeometry(20, 20, 2, 1, 1, 1);
    // mirrorCubeCamera = new THREE.CubeCamera( 0.1, 5000, 512 );
    // // mirrorCubeCamera.renderTarget.minFilter = THREE.LinearMipMapLinearFilter;
    // scene.add( mirrorCubeCamera );
    // var mirrorCubeMaterial = new THREE.MeshBasicMaterial( { envMap: mirrorCubeCamera.renderTarget } );
    // mirrorCube = new THREE.Mesh( cubeGeom, mirrorCubeMaterial );
    // mirrorCube.position.set(0,-6,0);
    // mirrorCube.rotation.x = Math.PI / 2;
    // mirrorCubeCamera.position = mirrorCube.position;
    // scene.add(mirrorCube);  
    // // FLOOR
    // var floorGeometry = new THREE.PlaneGeometry(20, 20, 10, 10);
    // reflectionCamera = new THREE.CubeCamera( 0.1, 40, 512 );
    // scene.add(reflectionCamera);
    // var floorMaterial = new THREE.MeshBasicMaterial( { map: reflectionCamera.renderTarget } );
    // floor = new THREE.Mesh(floorGeometry, floorMaterial);
    // floor.position.y = -6;
    // floor.rotation.x = Math.PI / 2;
    // reflectionCamera.position = floor.position;
    // //reflectionCamera.rotation = floor.rotation;
    // scene.add(floor);

    // CAMERAS
    // camera 2
    textureCamera = new THREE.PerspectiveCamera( 70, window.innerWidth/window.innerHeight, 0.1, 1000 );
    scene.add(textureCamera);
    
    // SKYBOX/FOG
    var materialArray = [];
    materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( '/img/Backgrounds/grey_wash_wall/3d1turkos.png' ) }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( '/img/Backgrounds/grey_wash_wall/3d1turkos.png' ) }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( '/img/Backgrounds/grey_wash_wall/grey_wash_wall.png' ) }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( '/img/Backgrounds/grey_wash_wall/3d1turkos.png' ) }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( '/img/Backgrounds/grey_wash_wall/3d1turkos.png' ) }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( '/img/Backgrounds/grey_wash_wall/3d1turkos.png' ) }));
    for (var i = 0; i < 6; i++)
       materialArray[i].side = THREE.BackSide;
    var skyboxMaterial = new THREE.MeshFaceMaterial( materialArray );
    var skyboxGeom = new THREE.CubeGeometry( 40, 40, 40, 1, 1, 1 );
    var skybox = new THREE.Mesh( skyboxGeom, skyboxMaterial );
    scene.add( skybox );

    /*// create an array with six textures for a cool cube (the camera)
    var materialArray = [];
    materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( '/img/Backgrounds/grey_wash_wall/grey_wash_wall.png' ) }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( '/img/Backgrounds/grey_wash_wall/grey_wash_wall.png' ) }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( '/img/Backgrounds/grey_wash_wall/grey_wash_wall.png' ) }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( '/img/Backgrounds/grey_wash_wall/grey_wash_wall.png' ) }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( '/img/Backgrounds/grey_wash_wall/grey_wash_wall.png' ) }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( '/img/Backgrounds/grey_wash_wall/grey_wash_wall.png' ) }));
    var MovingCubeMat = new THREE.MeshFaceMaterial(materialArray);
    var MovingCubeGeom = new THREE.CubeGeometry( 4, 4, 4, 1, 1, 1, materialArray );
    MovingCube = new THREE.Mesh( MovingCubeGeom, MovingCubeMat );
    MovingCube.position.set(0, -5, 5);
    scene.add( MovingCube );

    // intermediate scene.
    //   this solves the problem of the mirrored texture by mirroring it again.
    //   consists of a camera looking at a plane with the mirrored texture on it. 
    screenScene = new THREE.Scene();
    
    screenCamera = new THREE.OrthographicCamera( 
        window.innerWidth  / -2, window.innerWidth  /  2, 
        window.innerHeight /  2, window.innerHeight / -2, 
        -10000, 10000 );
    screenCamera.position.z = 5;
    screenScene.add( screenCamera );
                
    var screenGeometry = new THREE.PlaneGeometry( window.innerWidth, window.innerHeight );
    
    firstRenderTarget = new THREE.WebGLRenderTarget( 512, 512, { format: THREE.RGBFormat } );   
    var screenMaterial = new THREE.MeshBasicMaterial( { map: firstRenderTarget } );
    
    var quad = new THREE.Mesh( screenGeometry, screenMaterial );
    // quad.rotation.x = Math.PI / 2;
    screenScene.add( quad );
                    
    // final version of camera texture, used in scene. 
    var planeGeometry = new THREE.CubeGeometry( 20, 20, 1, 1 );
    finalRenderTarget = new THREE.WebGLRenderTarget( 512, 512, { format: THREE.RGBFormat } );
    var planeMaterial = new THREE.MeshBasicMaterial( { map: finalRenderTarget } );
    floor = new THREE.Mesh( planeGeometry, planeMaterial );
    floor.position.set(0,-6,0);
    floor.rotation.x = Math.Pi/2;
    scene.add(floor);
    // pseudo-border for plane, to make it easier to see
    var planeGeometry = new THREE.CubeGeometry( 22, 22, 1, 1 );
    var planeMaterial = new THREE.MeshBasicMaterial( { color: 0x000000 } );
    var plane = new THREE.Mesh( planeGeometry, planeMaterial );
    plane.position.set(0,-6.1,0);
    plane.rotation.x = Math.Pi/2;
    scene.add(plane);*/

    projector = new THREE.Projector();
    raycaster = new THREE.Raycaster();

    document.addEventListener( 'mousemove', onDocumentMouseMove, false );
    window.addEventListener( 'resize', onWindowResize, false );
};

function onWindowResize() {
    camera.aspect = window.innerWidth / (window.innerHeight-82);
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight-82 );
}

function redrawNapkin() {
    var c = $('#canvasNapkin')[0];
    var imgData = c.toDataURL();
    var ctx = c.getContext("2d");
    var myImage = new Image();
    myImage.onload = function() {
        ctx.drawImage(myImage, 0, 0,c.width,c.height);
    };

    $('.tabbable').css({
        position:'absolute'
    });

    myImage.src = imgData;
    c.height = $(window).height() - 550; //415;
    c.width = 1.5*c.height;

    $('#chatArea').css({
        position:'absolute', 
        top: $(window).height() - $('#chatArea').height()*2-56,
        left:'25%'
    });
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

function sendNapkinToNewUser() {
    var c = document.getElementById("canvasNapkin");
    var ctx = c.getContext("2d");
    var napkinImgData = c.toDataURL();
    dataStream.sendData({id:'currentNapkin', napkinImgData: napkinImgData});
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

function onDocumentMouseMove( event ) {
    if(event.clientY > 41 && event.clientY < window.innerHeight-41) {
        event.preventDefault();
        mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
        //console.log(mouse.x +", "+mouse.y);
    }
}

var StreamObject = function(video, texture, context){
    this.video = video;
    this.videoTexture = texture;
    this.context = context;
    return this;
};
StreamObject.prototype.getVideo = function() {
    return this.video;
};
StreamObject.prototype.getTexture = function() {
    return this.videoTexture;
};

StreamObject.prototype.getContext = function() {
    return this.context;
};

var reflection;
var movieGeometry;
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
    movieGeometry = new THREE.PlaneGeometry(  4, 4);
    var movieScreen = new THREE.Mesh( movieGeometry, movieMaterial );
    movieScreen.position.set(x,y,z);
    movieScreen.rotation.y += rot;
    scene.add(movieScreen);
    var newStream = new StreamObject(vid, videoTexture, videoImageContext);
    streams.push(newStream);
    if(pos === 5) {
        var movieMaterial = new THREE.MeshBasicMaterial( { map: videoTexture, overdraw: true, side:THREE.DoubleSide , transparent: true, opacity: 0.3 } );
        // the geometry on which the movie will be displayed;
        //      movie image will be scaled to fit these dimensions.
        var movieGeometry = new THREE.PlaneGeometry(  4.16, 4.16);
        reflection = new THREE.Mesh( movieGeometry, movieMaterial );
        reflection.position.set(-8.69,-6,0.71);
        reflection.rotation.set(1.4,0,-0.96);
        scene.add(reflection);
    }
    if(pos === 6) {
        var movieMaterial = new THREE.MeshBasicMaterial( { map: videoTexture, overdraw: true, side:THREE.DoubleSide , transparent: true, opacity: 0.5 } );
        // the geometry on which the movie will be displayed;
        //      movie image will be scaled to fit these dimensions.
        var movieGeometry = new THREE.PlaneGeometry(  4.16, 4.16);
        reflection = new THREE.Mesh( movieGeometry, movieMaterial );
        reflection.position.set(8.69,-6,0.71);
        reflection.rotation.set(1.4,0,0.96);
        scene.add(reflection);
    }
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

var rotationY;
function render() {   
    requestAnimationFrame(render);

    updateVideos();
    // mirrorCube.visible = false;
    // mirrorCubeCamera.updateCubeMap( renderer, scene );
    // mirrorCube.visible = true;

    /*MovingCube.visible = false; 
    // put the result of textureCamera into the first texture.
    renderer.render( scene, textureCamera, firstRenderTarget, true );
    MovingCube.visible = true;
    renderer.render( screenScene, screenCamera, finalRenderTarget, true );*/

    var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
    projector.unprojectVector( vector, camera );
    raycaster.set( camera.position, vector.sub( camera.position ).normalize() );
    var intersects = raycaster.intersectObjects( scene.children );
    if ( intersects.length > 1 ) {
        if ( INTERSECTED != intersects[ 0 ].object ) {
            if(INTERSECTED)INTERSECTED.rotation.y = rotationY;
            //if ( INTERSECTED ) //INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
            INTERSECTED = intersects[ 0 ].object;
            /*INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
            INTERSECTED.material.emissive.setHex( 0xff0000 );*/
            rotationY = INTERSECTED.rotation.y;
            INTERSECTED.rotation.y = 0;
        }
    } else {
        //if ( INTERSECTED ) //INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
        if(INTERSECTED)INTERSECTED.rotation.y = rotationY;
        INTERSECTED = null;
    }

    renderer.render( scene, camera );

    // update the texture camera's position and look direction
    /*var relativeCameraOffset = new THREE.Vector3(0,0,1);
    var cameraOffset = MovingCube.matrixWorld.multiplyVector3( relativeCameraOffset );
    textureCamera.position.x = cameraOffset.x;
    textureCamera.position.y = cameraOffset.y;
    textureCamera.position.z = cameraOffset.z;
    var relativeCameraLookOffset = new THREE.Vector3(0,0,-1);
    var cameraLookOffset = relativeCameraLookOffset.applyMatrix4( MovingCube.matrixWorld );
    textureCamera.lookAt( cameraLookOffset );*/
}
window.onload = function () {
    initScene();
    render();

    $('#chatArea').css({
        position:'absolute', 
        top: $(window).height() - $('#chatArea').height()*2-56,
        left:'25%'
    });
    $('#chatMessage').css({
        position:'absolute', 
        top:  $('#chatArea').height()+$('#chatArea').position().top+20,
        left:'25%'
    });
    $('#sendMessage').css({
        position:'absolute', 
        top:  $('#chatArea').height()+$('#chatArea').position().top+20,
        left:'66%'
    });
    $(window).resize(function() {
        $('#chatArea').css({
            position:'absolute', 
            top: $(window).height() - $('#chatArea').height()*2-56,
            left:'25%'
        });
        $('#chatMessage').css({
            position:'absolute', 
            top:  $('#chatArea').height()+$('#chatArea').position().top+20,
            left:'25%'
        });
        $('#sendMessage').css({
            position:'absolute', 
            top:  $('#chatArea').height()+$('#chatArea').position().top+20,
            left:'66%'
        });
    });
    $('#chatArea').scrollTop($('#chatArea').scrollHeight);
    $('#chatArea').width('50%');
    $('#chatMessage').width('40.5%');
    $('#sendMessage').width('9%');

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
    $('#napkinTab').click(function() {
        $('#napkinTab').css({
            left: '31%',
            top: '5%',
            width: '40%'
        });
        $('#videoTab').css({
            left: '30%',
            top: '2%',
            width: '40%'
        });
        return false;
    });
    $('#videoTab').click(function() {
        $('#videoTab').css({
            left: '31%',
            top: '5%',
            width: '40%'
        });
        $('#napkinTab').css({
            left: '30%',
            top: '2%',
            width: '40%'
        });
        return false;
    });

    var context = document.getElementById("canvasNapkin").getContext('2d');
    redrawNapkin();
    var doit;

    $(window).resize(function() {
        clearTimeout(doit);
        doit = setTimeout(function() {
            redrawNapkin();
        }, 100);
    });
    
    StreamObject.prototype.getVideo = function() {
        return this.video;
    };
    StreamObject.prototype.getTexture = function() {
        return this.videoTexture;
    };

    StreamObject.prototype.getContext = function() {
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

    var initialize = function(roomId) {
        
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

