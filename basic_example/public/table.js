var room, cafe, localStream, serverUrl;
serverUrl = "http://satin.research.ltu.se:3001/";

//knock
var dataStream, nameOfUser, leader;
var audioElement;
var knockListYes = new Object();
var knockListNo = new Object();
var knockTimer = 20 * 1000; //20 seconds
var knocker = 0;

//overhear
var isOverhearing = null;
var overhearGroup;
var tableId = new Array();
var oSeePosition = [[],[-32/3,0,0],[0,0,0],[32/3,0,0],[-32/3,-10,0],[0,-10,0],[32/3,-10,0]];
var overhearStream;
var streams = [];

var chairImg = new Image();
var emptyImg = new Image();
var overhearImg = new Image();
var currentState = "CAFEVIEW";
var vid, videoTexture, geometry, streamer, videoImageContext, dae, skin;

var reflectionCamera;

var MovingCube, textureCamera;
var screenScene, screenCamera, firstRenderTarget, finalRenderTarget;

var mouse = new THREE.Vector2(), INTERSECTED;
var projector, raycaster;

//Rotate
var objectToRotate;
var targetRotation = 0;
var targetRotationOnMouseDown = 0;

var mouseX = 0;
var mouseXOnMouseDown = 0;
var windowHalfX = window.innerWidth / 2;

var clickTime;

var placeHolderData;

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(70, window.innerWidth/window.innerHeight, 0.1, 1000);
var mirrorCube, mirrorCubeCamera; // for mirror material
var position = [[],[-12,-14,38],[12,-14,38],[-12,-14,46],[12,-14,46],[-12,-14,51],[12,-14,51]];
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight-82);
document.body.appendChild(renderer.domElement);

THREEx.WindowResize(renderer, camera);
camera.position.set(0,-10,61);

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

//Clears textfields
function clearTextFields() {
    $('#chatArea').val("");
    $('#chatMessage').val("");
    $('#VideoUrl').val("");
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

var initSceneTables = function() { 

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
    var skyboxGeom = new THREE.CubeGeometry( 80, 50, 110, 1, 1, 1 );
    var skybox = new THREE.Mesh( skyboxGeom, skyboxMaterial );
    scene.add( skybox );

    projector = new THREE.Projector();
    raycaster = new THREE.Raycaster();

    var movieMaterial = new THREE.MeshBasicMaterial( { color:'#000000' } );
    // the geometry on which the movie will be displayed;
    //      movie image will be scaled to fit these dimensions.
    movieGeometry = new THREE.PlaneGeometry(  32, 20);
    var movieScreen = new THREE.Mesh( movieGeometry, movieMaterial );
    movieScreen.position.set(0,-5,-0.01);
    scene.add(movieScreen);

    //document.addEventListener( 'mousemove', onDocumentMouseMove, false );
    window.addEventListener( 'resize', onWindowResize, false );
    document.addEventListener( 'mousedown', onDocumentMouseDown, false );
   
};

var initSceneInTable = function() {
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

var intersects = null;
function onDocumentMouseDown( event ) {
    clickTime = new Date().getTime();
    targetRotation = targetRotationOnMouseDown = 0;
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    event.preventDefault();
    var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
    projector.unprojectVector( vector, camera );
    raycaster.set( camera.position, vector.sub( camera.position ).normalize() );
    var intersects = raycaster.intersectObjects( scene.children );

    if ( intersects.length > 1 ) {
        objectToRotate = intersects[ 0 ];
        document.addEventListener( 'mousemove', onDocumentMouseMove, false );
        document.addEventListener( 'mouseup', onDocumentMouseUp, false );
        document.addEventListener( 'mouseout', onDocumentMouseOut, false );

        mouseXOnMouseDown = event.clientX - windowHalfX;
        targetRotationOnMouseDown = targetRotation;
    }
    console.log(intersects);
    console.log(objectToRotate);
    /*
    // Parse all the faces
    for ( var i in intersects ) {

        intersects[ i ].face.material[ 0 ].color.setHex( Math.random() * 0xffffff | 0x80000000 );

    }
    */
}

function onDocumentMouseMove( event ) {
    if(event.clientY > 41 && event.clientY < window.innerHeight-41) {
        console.log("test");
        event.preventDefault();
        mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    }
    mouseX = event.clientX - windowHalfX;
    targetRotation = targetRotationOnMouseDown + ( mouseX - mouseXOnMouseDown ) * 0.02;
}

function onDocumentMouseUp( event ) {
    var totalClickTime = new Date().getTime() - clickTime;
    document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
    document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
    document.removeEventListener( 'mouseout', onDocumentMouseOut, false );
    if(totalClickTime < 100 && objectToRotate.faceIndex === 4) {
        console.log("KNOCK KNOCK");
        knock(tableId[parseInt(objectToRotate.object.name)]);
    } else if(totalClickTime < 100 && objectToRotate.faceIndex === 5) {
        if(isOverhearing === null  ) {
            overhear(tableId[parseInt(objectToRotate.object.name)]);
            isOverhearing = objectToRotate.object.name;
        } else if(isOverhearing != null  && isOverhearing != objectToRotate.object.name) {
            resetOverhearing();
            isOverhearing = null;
        }
    }
    objectToRotate = null; 
}

function onDocumentMouseOut( event ) {
    document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
    document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
    document.removeEventListener( 'mouseout', onDocumentMouseOut, false );
    objectToRotate = null;
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

function resetOverhearing() {
    scene.remove(overhearGroup);
    overhearStream.close();
    if(room != undefined) room.disconnect();
    isOverhearing = null;
    overhearStream = Erizo.Stream({audio: false, video: false, data: true, attributes:{type:'overhear',username:nameOfUser}});
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

var rotationY;
function render() {
    requestAnimationFrame(render);
    updateVideos();

    var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
    projector.unprojectVector( vector, camera );
    raycaster.set( camera.position, vector.sub( camera.position ).normalize() );
    var intersects = raycaster.intersectObjects( scene.children );

    if(currentState === "TABLEVIEW") {
        console.log("nu är vi i TABLEVIEW");
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
    } else if(currentState === "CAFEVIEW" && objectToRotate != null) {
        objectToRotate.object.rotation.y += ( targetRotation - objectToRotate.object.rotation.y ) * 0.01;
        if (isOverhearing === objectToRotate.object.name && objectToRotate.object.rotation.y%(2*Math.PI) < 0.05 && objectToRotate.object.rotation.y%(2*Math.PI) > -0.05) {
            resetOverhearing();
        }
    }

    camera.aspect = window.innerWidth / (window.innerHeight-82);
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight-82 );
    renderer.render( scene, camera );
}


var StreamObject = function(video, texture, context){
    this.video = video;
    this.videoTexture = texture;
    this.context = context;
    return this;
};

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

function loadPlaceholder() {
    var myImage = new Image();
    myImage.onload = function(){
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        canvas.width = 320;
        canvas.height = 200;
        context.drawImage(myImage, 0, 0,canvas.width,canvas.height);
        placeHolderData = canvas.toDataURL();
    };
    myImage.src = "/img/emptyTable.gif";
}

function loadImage(imageData, elementID, pos) {
    var x = position[pos][0];
    var y = position[pos][1];
    var z = position[pos][2];
    var myImage = new Image();

    myImage.onload = function() {
        var videoTexture = new THREE.Texture( myImage );
        videoTexture.minFilter = THREE.LinearFilter;
        videoTexture.magFilter = THREE.LinearFilter;
        videoTexture.needsUpdate = true;
        var videoTexture2 = new THREE.Texture( overhearImg );
        videoTexture2.minFilter = THREE.LinearFilter;
        videoTexture2.magFilter = THREE.LinearFilter;
        videoTexture2.needsUpdate = true;
        //var x = room.getStreamsByAttribute('type','media').length;
        //var movieMaterial = new THREE.MeshBasicMaterial( { map: videoTexture, overdraw: true, side:THREE.DoubleSide } );
        // the geometry on which the movie will be displayed;
        //movie image will be scaled to fit these dimensions.
        var materialArray = [];
        materialArray.push(new THREE.MeshBasicMaterial( { color: '#000000' }));
        materialArray.push(new THREE.MeshBasicMaterial( { color: '#000000' }));
        materialArray.push(new THREE.MeshBasicMaterial( { color: '#000000'}));
        materialArray.push(new THREE.MeshBasicMaterial( { color: '#000000' }));
        materialArray.push(new THREE.MeshBasicMaterial( { map: videoTexture }));
        materialArray.push(new THREE.MeshBasicMaterial( { map: videoTexture2 }));
        /*for (var i = 0; i < 6; i++)
            materialArray[i].side = THREE.BackSide;*/
        var skyboxMaterial = new THREE.MeshFaceMaterial( materialArray );
        var skyboxGeom = new THREE.CubeGeometry( 4, 3, 0.3, 1, 1, 1 );
        //var movieScreen = new THREE.Mesh( movieGeometry, movieMaterial );
        var movieScreen = new THREE.Mesh( skyboxGeom, skyboxMaterial );
        movieScreen.position.set(x,y,z);
        movieScreen.name = pos;
        scene.add(movieScreen);
    };
    myImage.src = imageData;
    myImage.className = 'centerImage';
}

function initVideoTables(stream,pos) {
    var x = oSeePosition[pos][0];
    var y = oSeePosition[pos][1];
    var z = oSeePosition[pos][2];
    var vid, canvas;

    vid = stream.player.video;
    
    vid.style.width = '320px';
    vid.style.height = '240px';
    vid.autoplay = true;
    canvas = $('<canvas width="320" height="240"></canvas>').appendTo('#canvases')[0];
    var videoImageContext = canvas.getContext('2d');

    videoTexture = new THREE.Texture( canvas );
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    var movieMaterial = new THREE.MeshBasicMaterial( { map: videoTexture, overdraw: true } );
    movieGeometry = new THREE.PlaneGeometry(  32/3, 10);
    var movieScreen = new THREE.Mesh( movieGeometry, movieMaterial );
    movieScreen.position.set(x,y,z);
    overhearGroup.add(movieScreen);
    var newStream = new StreamObject(vid, videoTexture, videoImageContext);
    streams.push(newStream);
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

var reflection;
var movieGeometry;
function initVideoInTable(stream,pos) {
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


window.onload = function () {
    chairImg.src="/img/emptyChair.jpg";
    cafe = getQueryString('cafe');

    overhearImg.src = "/img/clicktooverhear.png";
    loadPlaceholder();

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

    getCafeTables(cafe, function (response) {
        var cafes = JSON.parse(response);
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
                if(!res.hasOwnProperty('empty')) {
                    for(var i=1;i<=6;i++) {
                        hasImage = false;
                        imgID = '#table'+i+'img';
                        for(var j=0;j<res.records.length;j++) {
                            if(res.records[j].roomID == tableId[i]) {
                                console.log('i: ' + i + ', j: ' + j);
                                imgData = res.records[j].imageData;
                                loadImage(imgData, imgID,i);
                                hasImage = true;
                                //
                                //

                            }
                            console.log(imgID);
                        }

                        if(!hasImage) loadImage(placeHolderData, imgID,i);

                    }
                }
            });    
        }
    });

    //Initializes the audio element used for playing the knocking sound
    audioElement = document.createElement('audio');
    audioElement.setAttribute('src', '/media/knock.mp3');
    audioElement.load();

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
        $('#enterName').show();
        $('#videoTab').hide();
        $('#napkinTab').hide();
        currentState = "TABLEVIEW";
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
    $('#napkinTab').click(function() {
        $('#napkinTab').css({
            position: 'absolute',
            marginLeft: '31%',
            marginTop: '5%',
            width: '40%',
            zIndex: '1'
        });
        $('#videoTab').css({
            position: 'absolute',
            marginLeft: '30%',
            marginTop: '2%',
            width: '40%',
            zIndex: '0'
        });
        return false;
    });
    $('#videoTab').click(function() {
        $('#videoTab').css({
            position: 'absolute',
            marginLeft: '31%',
            marginTop: '5%',
            width: '40%',
            zIndex: '1'
        });
        $('#napkinTab').css({
            position: 'absolute',
            marginLeft: '30%',
            marginTop: '2%',
            width: '40%',
            zIndex: '0'
        });
        return false;
    });

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

    var enterName = function() {
        if($('#userName').val() !== "") {
            nameOfUser = $('#userName').val();
            $('#enterName').toggle();
            initSceneTables();
            render();
            try {
                overhearStream = Erizo.Stream({audio: false, video: false, data: true, attributes:{type:'overhear',username:nameOfUser}});
                localStream = Erizo.Stream({audio: true, video: true, data: false, attributes:{type:'media',username:nameOfUser}});
                dataStream = Erizo.Stream({audio: false, video: false, data: true, attributes:{type:'data',username:nameOfUser}});
            } catch (error) {
                console.log('erizo error: ' + error);
            }
        }
    };

    // var createToken = function(roomId, userName, role, callback) {
    //     var req = new XMLHttpRequest();
    //     var url = serverUrl + 'createToken/' + roomId;
    //     var body = {username: userName, role: role};

    //     req.onreadystatechange = function () {
    //         if (req.readyState === 4) {
    //             callback(req.responseText);
    //         }
    //     };

    //     req.open('POST', url, true);
    //     req.setRequestHeader('Content-Type', 'application/json');
    //     req.send(JSON.stringify(body));
    // };

    var initialize = function(roomId) {
        currentTable = roomId;
        $('#leaveTableButton').show();
        $('#videoTab').show();
        $('#napkinTab').show();

        $('#chatArea').css({
            position:'absolute', 
            top: $(window).height() - $('#chatArea').height()*2-56,
            left:'30%'
        });
        $('#chatMessage').css({
            position:'absolute', 
            top:  $('#chatArea').height()+$('#chatArea').position().top+20,
            left:'30%'
        });
        $('#sendMessage').css({
            position:'absolute', 
            top:  $('#chatArea').height()+$('#chatArea').position().top+20,
            left:'63%'
        });
        $(window).resize(function() {
            $('#chatArea').css({
                position:'absolute', 
                top: $(window).height() - $('#chatArea').height()*2-56,
                left:'30%'
            });
            $('#chatMessage').css({
                position:'absolute', 
                top:  $('#chatArea').height()+$('#chatArea').position().top+20,
                left:'30%'
            });
            $('#sendMessage').css({
                position:'absolute', 
                top:  $('#chatArea').height()+$('#chatArea').position().top+20,
                left:'63%'
            });
        });
        $('#chatArea').scrollTop($('#chatArea').scrollHeight);
        $('#chatArea').width('40%');
        $('#chatMessage').width('32.5%');
        $('#sendMessage').width('7%');

        try {
          localStream = Erizo.Stream({audio: true, video: true, data: true, attributes:{type:'media'}});
        } catch (error) {
            console.log('erizo error: ' + error);
        }
        
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
                            initVideoInTable(stream,i);
                            currentState = "TABLEVIEW";                         
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
                        initVideoInTable(streamEvent.stream,1);
                        currentState = "TABLEVIEW";
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
                localStream.show("vid1");
            });
            localStream.init();
        });
    }
    //initialize(tableId);
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
    overhearGroup = new THREE.Object3D();
    scene.add(overhearGroup);
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
                //room.publish(overhearStream);
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
                            initVideoTables(stream,i); 
                            return;
                        }
                    }
                    console.log("There is no seat available at this table!");
                } 
            });

            room.addEventListener("stream-removed", function (streamEvent) {
                // Remove stream from DOM
                var stream = streamEvent.stream;
                if (stream.elementID !== undefined) {
                    $('#'+stream.elementID).remove();
                }
            });
            room.connect();
        });
        overhearStream.init();
    });  
}; 