var scene = new THREE.Scene();
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

render();

window.onload = function () {

    //Creates token for the chosen café
    var createToken = function(roomId, userName, role, callback) {
        console.log(getQueryString('cafe'));
        console.log(roomId);
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

        localStream.addEventListener("access-accepted", function () {
            if (room.getStreamsByAttribute('type','media').length < 6) {

                var subscribeToStreams = function (streams) {
                    if (!localStream.showing) {
                        localStream.show();
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

                room.addEventListener("stream-subscribed", function(streamEvent) {
                    console.log('HÄÄÄÄÄÄÄR FÖRST: ' + room.getStreamsByAttribute('type','media'));
                    var stream = streamEvent.stream;
                    if (stream.getAttributes().type === 'media') {
                        for (var i = 2; i <= 6; i++) {
                            if ($('#vid'+i).children().length === 0) {
                                $('<div></div>', {
                                        id: 'test'+stream.getID()
                                    }).appendTo('#vid'+i);
                                stream.show("test" + stream.getID());
                                $(window).resize(function() {
                                    var videoheight = $('#vid'+1).width()/1.33;
                                    $(stream.getID()).height(videoheight);
                                });
                                return;
                            }
                        }
                        console.log("There is no seat available at this table!");
                    }
                    if(leader === localStream.getID()) {
                        getSnapshots();
                    } 
                    console.log('HÄÄÄÄÄÄÄR TVÅ: ' + room.getStreamsByAttribute('type','media'));
                });

                room.addEventListener("stream-added", function (streamEvent) {
                    if(room.getStreamsByAttribute('type','media').length > 6 && streamEvent.stream.getID() === localStream.getID()) {
                    } else {
                        // Subscribe to added streams
                        var streams = [];
                        streams.push(streamEvent.stream);
                        subscribeToStreams(streams);
                        if(streamEvent.stream.getAttributes().type === "media"){
                            hasJoinedTheRoom(streamEvent.stream.getAttributes().username);
                        }
                        //If table is empty, become the leader
                        var currStreams = room.getStreamsByAttribute('type','media');
                        if(currStreams.length === 1 && parseInt(currStreams[0].getID()) === localStream.getID()) {
                            console.log('Snapshot sent at ' + Date.now());
                            leader = localStream.getID();
                            getSnapshots();
                            setInterval(function(){
                                console.log('Snapshot sent at ' + Date.now());
                                getSnapshots();
                            },1000*60*5);
                        } else if(leader === localStream.getID()) {
                            broadcastLeader();
                            sendNapkinToNewUser();
                        }  
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
                            leader = calculateLeader();
                            if(leader === localStream.getID()) {
                                console.log('Snapshot sent at ' + Date.now());
                                getSnapshots();
                                setInterval(function(){
                                    console.log('Snapshot sent at ' + Date.now());
                                    getSnapshots();
                                },1000*60*5);
                            }
                            console.log(calculateLeader());
                        } else if (leader === localStream.getID()) {
                            getSnapshots();
                        }
                        
                        console.log("Removing " + stream.elementID);
                        var streamToRemove = $('#'+stream.elementID);
                        var vidElementNr = parseInt(streamToRemove.parent()[0].id[3])+1;
                        streamToRemove.remove();
                        
                        streams = room.getStreamsByAttribute('type','media');                    
                        while($('#vid'+vidElementNr).children().length != 0) {
                            var prevStream = '#vid'+(vidElementNr-1);
                            var nextStream = '#vid'+(vidElementNr);
                            for (var i = 0; i < streams.length; i++) {

                                if(streams[i].elementID == $(nextStream).children()[0].id) {
                                    
                                    var streamID = $(nextStream).children()[0].id;
                                    streams[i].hide(streamID);
                                    $('#'+streamID).remove();
                                    $('<div></div>', {
                                        id: 'test'+streams[i].getID()
                                    }).appendTo(prevStream);
                                    streams[i].show("test" + streams[i].getID());
                                    break;
                                }
                            }
                            vidElementNr++;
                        }
                    }
                }); 

                localStream.show("myVideo");
                


                // Publish my stream
                room.publish(localStream);
                // Subscribe to other streams
                subscribeToStreams(room.getStreamsByAttribute('type','media'));
            } else {
                resetConnection();
                $('#enterNameRow').toggle();
                $('#inTableRow').toggle();
                deniedNotification(2);
            } 
        }); 
        localStream.init();  
    }
};
