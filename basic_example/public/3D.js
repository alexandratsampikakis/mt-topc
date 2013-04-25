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

var render = function () {
	requestAnimationFrame(render);

	cube.rotation.x += 0.1;
	cube.rotation.y += 0.1;

	renderer.render(scene, camera);
};

render();*/

window.onload = function() {

    // create and initialize a 3D renderer
    var r = new X.renderer3D();
    r.init();

    // create a cube and a sphere
    cube = new X.cube();
    sphere = new X.sphere();
    sphere.center = [-20, 0, 0];

    r.interactor.onMouseMove = function() {

        // grab the current mouse position
        var _pos = r.interactor.mousePosition;

        // pick the current object
        var _id = r.pick(_pos[0], _pos[1]);

        if (_id != 0) {

            // grab the object and turn it red
            r.get(_id).color = [1, 0, 0];

        } else {

            // no object under the mouse
            cube.color = [1, 1, 1];
            sphere.color = [1, 1, 1];

        }

        r.render();

    }

    r.interactor.onMouseDown = function(left, middle, right) {

        // only observe right mouse clicks        
        if (!right) return;

        // grab the current mouse position
        var _pos = r.interactor.mousePosition;

        // pick the current object
        var _id = r.pick(_pos[0], _pos[1]);

        if (_id == sphere.id) {

            // turn the sphere green
            sphere.color = [0, 1, 0];
            r.render();

        }

    }

    r.add(cube); // add the cube to the renderer
    r.add(sphere); // and the sphere as well
    r.render(); // ..and render it
};