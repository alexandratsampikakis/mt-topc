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

    //NEW SHIT
    ytScene = new THREE.Scene();

    ytRenderer = new THREE.CSS3DRenderer();
    ytRenderer.setSize( window.innerWidth, window.innerHeight );
    ytRenderer.domElement.style.position = 'absolute';
    ytRenderer.domElement.style.top = 0;
    document.getElementById( 'container' ).appendChild( ytRenderer.domElement );

    //

    var query = document.getElementById( 'query' );
    query.addEventListener( 'keyup', function ( event ) {

        if ( event.keyCode === 13 ) {

            search( query.value );

        }

    }, false );

    var button = document.getElementById( 'button' );
    button.addEventListener( 'click', function ( event ) {

        search( query.value );

    }, false );

    if ( window.location.hash.length > 0 ) {

        query.value = window.location.hash.substr( 1 );

    }

    search( query.value );

    document.body.addEventListener( 'mousewheel', onMouseWheel, false );

    document.body.addEventListener( 'click', function ( event ) {

        auto = true;

        if ( player !== undefined ) {

            player.parentNode.removeChild( player );
            player = undefined;

        }

        new TWEEN.Tween( camera.position )
                .to( { x: 0, y: - 25 }, 1500 )
                .easing( TWEEN.Easing.Exponential.Out )
                .start();

    }, false );

    window.addEventListener( 'resize', onWindowResize, false );
    //END NEW SHIT
};

function search( query ) {

                window.location.hash = query;

                for ( var i = 0, l = objects.length; i < l; i ++ ) {

                    var object = objects[ i ];
                    var delay = Math.random() * 1000;

                    new TWEEN.Tween( object.position )
                            .to( { y: - 3000 }, 1000 )
                            .delay( delay )
                            .easing( TWEEN.Easing.Exponential.In )
                            .start();

                    new TWEEN.Tween( object )
                            .to( {}, 2000 )
                            .delay( delay )
                            .onComplete( function () {

                                ytScene.remove( this );
                                ytRenderer.cameraElement.removeChild( this.element );

                                var index = objects.indexOf( this );
                                objects.splice( index, 1 );

                            } )
                            .start();

                }

                var request = new XMLHttpRequest();
                request.addEventListener( 'load', onData, false );
                request.open( 'GET', 'https://gdata.youtube.com/feeds/api/videos?v=2&alt=json&max-results=50&q=' + query, true );
                request.send( null );

            }

            function onData( event ) {

                var data = JSON.parse( event.target.responseText );
                var entries = data.feed.entry;

                // console.log( entries );

                for ( var i = 0; i < entries.length; i ++ ) {

                    var entry = entries[ i ];

                    var element = document.createElement( 'div' );
                    element.style.width = '480px';
                    element.style.height = '360px';

                    var image = document.createElement( 'img' );
                    image.addEventListener( 'load', function ( event ) {

                        var object = this.properties.object;
                        var button = this.properties.button;

                        button.style.visibility = 'visible';

                        new TWEEN.Tween( object.position )
                            .to( { y: Math.random() * 2000 - 1000 }, 2000 )
                            .easing( TWEEN.Easing.Exponential.Out )
                            .start();

                    }, false );
                    image.style.position = 'absolute';
                    image.style.width = '480px';
                    image.style.height = '360px';
                    image.src = entry.media$group.media$thumbnail[ 2 ].url;
                    element.appendChild( image );

                    var button = document.createElement( 'img' );
                    button.style.position = 'absolute';
                    button.style.left = ( ( 480 - 86 ) / 2 ) + 'px';
                    button.style.top = ( ( 360 - 61 ) / 2 ) + 'px';
                    button.style.visibility = 'hidden';
                    button.style.WebkitFilter = 'grayscale()';
                    button.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFYAAAA9CAYAAAA3ZZ5uAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9wLBQ0uMbsnLZIAAAbXSURBVHja7ZxvbBvlHcc/z/maf4PGg9FtbaZeS2I1iUgP1q7QEmFpmxB7AYxXk/aCvETaC/Zy2qSpk7apL/YCTbCyoU0uUAGdRv8uVCorzsQGSRu4tFoahbYxpEkKayvHaRInvnt+e5HEzb92cez4bHRfyS/ufPbd8/H3vs/vZ99Zkac+erB5OxhhAG1oS4myZp5RYVFi5/PeSpSFwrrd84I4QDLH93RAksusjwM89PH5DgoglcvGZ+ymp8RQTytRliCWUsriyywhCTiiJKFQCaUmXtjRfXk0b7Bnv7211vUq2xSqDaVsAoGII0jMDE3F7gT5tmA/tJue0qiYgnBAczkzkzSQtoed3qMrBvt+y7ZnlTJiAb6VGFi3PXqu78D/Bft+y7ZnhQBqbhPVUrgLwP6rsXGza+IEp3/usWC62HsuXPh0bp05f4NMSGKgwhKwylXhTIgXgB8ucezp5sh2MJyAUR7O1cr67qxrs471kDZF4NW8slbpNuBXC8CKNmxRAZz8LKuiS8BqJBoYNm9FF2Rs+7b6x8CIB1wKIR39Qd/FDnOmyFU2gV0LlbQ2MAPW02Ip5UPAVlXB44/Dxk0zy8NDcOYMDA+XcScmVjZjtWD7URFU79zJzp//gtraWgBGR0cZGBhgsLMT3nyjLAGLYGfBimhbKL5jv7FnTxYqQG1tLbZtE4lE6N+1i5Hjx5n+x7vlBVjkFlitlC8t7Ncbm5ZdX1NTg23bNDc30//MM3wWj5P+66HyADzLUv1ty5bN2lAJP46h9bXXuW/XrhVt29/fT197O96Rw0iJAza0WKYnYkkZdAaRSIRIJMLlJ5+k7+23mTx+vGQBi4hlagiL+FNqrWavW7du5VvPP0//E0+QaG9n4sQJZGiotNIAwqaA7RNXRITVfKimadLU1IRlWfRGowydepfMyZPo0gFsm54mjPKLbH4vr6mpYceOHTQ0NHDu0T1cO3aMqXdOwuSkz1lA2NQitn/7L8wHWltbS2trK4OWRX80SrL9Habicf8AC7apfexkRaCQ+V5XV0ddXR399fVc2rObsTcPkTl/3pcz0dRI2D+wwlpMnA0NDWzatIlPGhsZPHWK1FuH0DduFHNoYVOD7df3L3qNwAJUV1fT0tJCfX09Zx94gKuxA0x1dhVv8tIiPkaBRkSv7fcR1VW0fv97DNTfz5lf/5Z0vKMoYzNmcs6vhxTtYVkWj+z9JcbGjUUZm6+O1SLoIs6eVckUjKYoxph9joK1y9jFutrZyennfkJmbKwo+/O53JI1z9jpVIre2Ks4v3+pqGPzNwq0Rmu9hi7tous3+7hxoa/oYzO1f4ZFa1kTsDevDOG8+AcuHj7q29jMSddzKkOGL22tlsI69ubQEM6L+30FCjDlacesMFTSrzSYiQKvAECHuXj4GD0vvVwSX21VGCo5O3mJj2BX79jp1Bi9rx2k99WDZMZuUkoytXgOGNFyAjudGuOz0+/Rte93JQcUIK11whStkn79MuNpjed5OQG9ePQEPfv/VJJA51SJSpifuy5fM82Sj4Le19+gZ/8rJQ10TtdcF/MejLhfTYKnPTzPvb1Dx8YYfO+f9Lz8Z8aHr1Iuugcjbn7iprnfqPblAEa6urnvwe1LZ/nhET4/+zHn/vgXxkfKB+icLrlpzEtpN7Glwp8D+M/BQ3yzdTdfjTRkgQ78/STnX4lRzrqUdhMK4Gd33SvrlH/XFmx4aMa1X3zUQ7krI8K+m9eVCTCudXK9EfLtJ5qr3eUPdE7jWidh7opuEUeLRAmUv0ScLNgJTydqlBFAKYAmPJ3Igp0UHB1c0F0QTQq3HDuQmXY2hkIBlQJoIDPtwLwb6H687m7ZYJgBmTx0Q3scyKTUrckLmBKJC8EElo9S4mXv7MyC/UJ7RzaoUNRUwV10q9V1rbOdjXGr/pqMXRMvoLNK/Vd7uFqOLAHbDaMj4sZcCcqDXOWKcEUysX+T/nQJWADPY29Cu8kAVW5KaDfpeeydv25BjTWIO3qvClVVoKJfCRqGFemyznAd77kPJN1xW7AAV8TtuAvDAuz1Adw7nv4JcbkmXtuHXnrJf8Is2xVcEffoelQ4KfrhdUpRHQBeAPS6aC5LJpny3B91ytRby213x9rqEaoekxB7K1DRShTzHVyBolIpalB8mUu0lGjGZi+DSolmAo0nxDI6/dNuyP1/t+ZrN1WbBSwxmN9AWCgsEbGVUuEaFKFF8AHuXrTsd7xMiTA1+3P/hGjmF5jjs8sewgQCQgJFQkQchUoqTXyatHMnoDmBXYm+w7rtIULhRfBBsbibK5nuTkQcpVQSIQEkAARJGlo5ChLzy6dc9T9S8wu+HzDbBQAAAABJRU5ErkJggg==';
                    element.appendChild( button );

                    var blocker = document.createElement( 'div' );
                    blocker.style.position = 'absolute';
                    blocker.style.width = '480px';
                    blocker.style.height = '360px';
                    blocker.style.background = 'rgba(0,0,0,0.5)';
                    blocker.style.cursor = 'pointer';
                    element.appendChild( blocker );

                    var object = new THREE.CSS3DObject( element );
                    object.position.x = Math.random() * 4000 - 2000;
                    // object.position.y = Math.random() * 2000 - 1000;
                    object.position.y = 3000;
                    object.position.z = Math.random() * - 5000;
                    ytScene.add( object );

                    objects.push( object );

                    //

                    var properties = { data: entry, blocker: blocker, button: button, object: object }

                    element.properties = properties;
                    image.properties = properties;

                    element.addEventListener( 'mouseover', function () {

                        this.properties.button.style.WebkitFilter = '';
                        this.properties.blocker.style.background = 'rgba(0,0,0,0)';

                    }, false );

                    element.addEventListener( 'mouseout', function () {

                        this.properties.button.style.WebkitFilter = 'grayscale()';
                        this.properties.blocker.style.background = 'rgba(0,0,0,0.75)';

                    }, false );

                    element.addEventListener( 'click', function ( event ) {

                        event.stopPropagation();

                        var data = this.properties.data;
                        var object = this.properties.object;

                        auto = false;

                        if ( player !== undefined ) {

                            player.parentNode.removeChild( player );
                            player = undefined;

                        }

                        player = document.createElement( 'iframe' );
                        player.style.position = 'absolute';
                        player.style.width = '480px';
                        player.style.height = '360px';
                        player.style.border = '0px';
                        player.src = 'http://www.youtube.com/embed/' + data.id.$t.split( ':' ).pop() + '?rel=0&autoplay=1&controls=1&showinfo=0';
                        this.appendChild( player );

                        //

                        var prev = object.position.z + 400;

                        new TWEEN.Tween( camera.position )
                            .to( { x: object.position.x, y: object.position.y - 25 }, 1500 )
                            .easing( TWEEN.Easing.Exponential.Out )
                            .start();

                        new TWEEN.Tween( { value: prev } )
                            .to( { value: 0  }, 2000 )
                            .onUpdate( function () {

                                move( this.value - prev );
                                prev = this.value;

                            } )
                            .easing( TWEEN.Easing.Exponential.Out )
                            .start();

                    }, false );

                }

            }

            function move( delta ) {

                for ( var i = 0; i < objects.length; i ++ ) {

                    var object = objects[ i ];

                    object.position.z += delta;

                    if ( object.position.z > 0 ) {

                        object.position.z -= 5000;

                    } else if ( object.position.z < - 5000 ) {

                        object.position.z += 5000;

                    }

                }

            }

            function onMouseWheel( event ) {

                move( event.wheelDelta );

            }


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

var reflection;
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
    //NEW SHIT
    TWEEN.update();

    if ( auto === true ) {

        move( 1 );

    }

    ytRenderer.render( ytScene, camera );
    //END NEW SHIT
    
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

