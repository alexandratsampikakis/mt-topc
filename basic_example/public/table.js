var room, localStream, serverUrl;
var tableId = "513dcfda07aa2f143700001c";
serverUrl = "http://satin.research.ltu.se:3001/";
var streams = [];

var chairImg = new Image();
var emptyImg = new Image();

var vid, videoTexture, geometry, streamer, videoImageContext, dae, skin;

var reflectionCamera;

var MovingCube, textureCamera;
var screenScene, screenCamera, firstRenderTarget, finalRenderTarget;

var mouse = new THREE.Vector2(), INTERSECTED;
var projector, raycaster;


var placeHolderData;
//YTube
var ytRenderer, ytScene;
var objects = [], player;
var auto = true;

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
    var skyboxGeom = new THREE.CubeGeometry( 80, 40, 80, 1, 1, 1 );
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

function onDocumentMouseMove( event ) {
    if(event.clientY > 41 && event.clientY < window.innerHeight-41) {
        event.preventDefault();
        mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    }
}

var rotationY;
function render() {   
    requestAnimationFrame(render);

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


}

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
    myImage.onload = function(){
        var videoTexture = new THREE.Texture( myImage );
        videoTexture.minFilter = THREE.LinearFilter;
        videoTexture.magFilter = THREE.LinearFilter;
        videoTexture.needsUpdate = true;
        //var x = room.getStreamsByAttribute('type','media').length;
        var movieMaterial = new THREE.MeshBasicMaterial( { map: videoTexture, overdraw: true, side:THREE.DoubleSide } );
        // the geometry on which the movie will be displayed;
        //      movie image will be scaled to fit these dimensions.
        movieGeometry = new THREE.PlaneGeometry(  4, 4);
        var movieScreen = new THREE.Mesh( movieGeometry, movieMaterial );
        movieScreen.position.set(x,y,z);
        scene.add(movieScreen);
        document.body.appendChild(myImage);
    };
    myImage.src = imageData;
    myImage.className = 'centerImage';
}

window.onload = function () {
    chairImg.src="/img/emptyChair.jpg";
    //emptyImg.src="/img/emptyTable.gif";
    loadPlaceholder();
    initScene();
    render();



    getCafeTables("Unik", function (response) {
        var cafes = JSON.parse(response);
        var tc = document.getElementById("tablecontainer");
        if(cafes.hasOwnProperty('error')) {
            console.log(cafes.error);
        } else {
            //updateTitle(cafes.name);
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
  
}

