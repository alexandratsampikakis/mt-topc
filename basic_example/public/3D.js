var scene = new THREE.Scene();

// PerspectiveCamera(field of view,aspect ratio,near,far)
var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var geometry = new THREE.CubeGeometry(1,1,1);
var material = new THREE.MeshBasicMaterial({color: 0x00ff00});
var cube = new THREE.Mesh(geometry, material);
scene.add(cube);

var sphereGeo = new THREE.SpheroGeometry(0.5, 0.5, 0.5);
var sMaterial = new THREE.MeshBasicMaterial({color: 0xe261b7});
var sphere = new THREE.Mesh(sphereGeo, sMaterial);
scene.add(sphere);

camera.position.z = 5;

var render = function () {
	requestAnimationFrame(render);

	//cube.rotation.x += 0.1;
	//cube.rotation.y += 0.1;

	renderer.render(scene, camera);
};

render();