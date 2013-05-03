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


function render() {   
    requestAnimationFrame(render);
    renderer.render( scene, camera );
}

window.onload = function () {

    var loader = new THREE.ColladaLoader();
    loader.options.convertUpAxis = true;
    //loader.load( 'models/collada/monster/monster.dae', function ( collada ) {
    loader.load( '/lib/three.js/mrdoob-three.js-28136e7/examples/models/simple-laptop/hans_erickson_simple_laptop.dae', function ( collada ) {
    //loader.load( '/lib/three.js/mrdoob-three.js-28136e7/examples/models/collada/monster/monster.dae', function ( collada ) {
        dae = collada.scene;
        skin = collada.skins[ 0 ];

        dae.scale.x = dae.scale.y = dae.scale.z = 0.002;
        dae.position.x = 0;
        dae.position.z = 0;
        dae.updateMatrix();

        scene.add(dae);
        render();
    } );

    
}
//render();*/

