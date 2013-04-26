/*var scene = new THREE.Scene();

// PerspectiveCamera(field of view,aspect ratio,near,far)
var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var geometry = new THREE.CubeGeometry(1,1,1);
var material = new THREE.MeshBasicMaterial({color: 0x00ff00});
var cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;

//var render = function () {
	//requestAnimationFrame(render);

	cube.rotation.x += 0.1;
	cube.rotation.y += 0.1;

	renderer.render(scene, camera);
//};

//render();*/

navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.getUserMedia;
window.URL = window.URL || window.webkitURL;

var camvideo = document.getElementById('monitor');

	if (!navigator.getUserMedia) 
	{
		document.getElementById('errorMessage').innerHTML = 
			'Sorry. <code>navigator.getUserMedia()</code> is not available.';
		return;
	}
	navigator.getUserMedia({video: true}, gotStream, noStream);

function gotStream(stream) 
{
	if (window.URL) 
	{   camvideo.src = window.URL.createObjectURL(stream);   } 
	else // Opera
	{   camvideo.src = stream;   }

	camvideo.onerror = function(e) 
	{   stream.stop();   };

	stream.onended = noStream;
}

function noStream(e) 
{
	var msg = 'No camera available.';
	if (e.code == 1) 
	{   msg = 'User denied access to use camera.';   }
	document.getElementById('errorMessage').textContent = msg;
}

/*
	Three.js "tutorials by example"
	Author: Lee Stemkoski
	Date: March 2013 (three.js v56)
 */
	
// MAIN

// standard global variables
var container, scene, camera, renderer, controls, stats;
var keyboard = new THREEx.KeyboardState();

// custom global variables
var video, videoImage, videoImageContext, videoTexture;

init();
animate();

// FUNCTIONS 		
function init() 
{
	// SCENE
	scene = new THREE.Scene();
	// CAMERA
	var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
	var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
	camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
	scene.add(camera);
	camera.position.set(0,150,400);
	camera.lookAt(scene.position);	
	// RENDERER
	if ( Detector.webgl )
		renderer = new THREE.WebGLRenderer( {antialias:true} );
	else
		renderer = new THREE.CanvasRenderer(); 
	renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
	container = document.createElement( 'div' );
	// CSS added so the hidden HTML elements do not reposition this one
	container.style.cssText = "position:absolute;top:0px;left:0px;";
	document.body.appendChild( container );
	container.appendChild( renderer.domElement );
	// CONTROLS
	controls = new THREE.TrackballControls( camera );
	// EVENTS
	THREEx.WindowResize(renderer, camera);
	//THREEx.FullScreen.bindKey({ charCode : 'm'.charCodeAt(0) });
	// STATS
	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.bottom = '0px';
	stats.domElement.style.zIndex = 100;
	container.appendChild( stats.domElement );
	// LIGHT
	var light = new THREE.PointLight(0xffffff);
	light.position.set(0,250,0);
	scene.add(light);
	// FLOOR
	var floorTexture = new THREE.ImageUtils.loadTexture( 'images/checkerboard.jpg' );
	floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping; 
	floorTexture.repeat.set( 10, 10 );
	var floorMaterial = new THREE.MeshBasicMaterial( { map: floorTexture, side: THREE.DoubleSide } );
	var floorGeometry = new THREE.PlaneGeometry(1000, 1000, 10, 10);
	var floor = new THREE.Mesh(floorGeometry, floorMaterial);
	floor.position.y = -0.5;
	floor.rotation.x = Math.PI / 2;
	scene.add(floor);
	// SKYBOX/FOG
	scene.fog = new THREE.FogExp2( 0x9999ff, 0.00025 );
	
	///////////
	// VIDEO //
	///////////

	video = document.getElementById( 'monitor' );
	
	videoImage = document.getElementById( 'videoImage' );
	videoImageContext = videoImage.getContext( '2d' );
	// background color if no video present
	videoImageContext.fillStyle = '#000000';
	videoImageContext.fillRect( 0, 0, videoImage.width, videoImage.height );

	videoTexture = new THREE.Texture( videoImage );
	videoTexture.minFilter = THREE.LinearFilter;
	videoTexture.magFilter = THREE.LinearFilter;
	
	var movieMaterial = new THREE.MeshBasicMaterial( { map: videoTexture, overdraw: true, side:THREE.DoubleSide } );
	// the geometry on which the movie will be displayed;
	// 		movie image will be scaled to fit these dimensions.
	var movieGeometry = new THREE.PlaneGeometry( 100, 100, 1, 1 );
	var movieScreen = new THREE.Mesh( movieGeometry, movieMaterial );
	movieScreen.position.set(0,50,0);
	scene.add(movieScreen);
	
	camera.position.set(0,150,300);
	camera.lookAt(movieScreen.position);
				
	
}

function animate() 
{
    requestAnimationFrame( animate );
	render();		
	update();
}

function update()
{		
	if ( keyboard.pressed("p") ) // pause
		video.pause();
	if ( keyboard.pressed("r") ) // resume
		video.play();
	controls.update();
	stats.update();
}

function render() 
{	
	if ( video.readyState === video.HAVE_ENOUGH_DATA ) 
	{
		videoImageContext.drawImage( video, 0, 0, videoImage.width, videoImage.height );
		if ( videoTexture ) 
			videoTexture.needsUpdate = true;
	}

	renderer.render( scene, camera );
}