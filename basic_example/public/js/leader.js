var pingArray = new Array(3); //privat
var groupLatency; //privat

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

//Pings the server
//Server responds with "OK"
var pingServer = function(callback) {
    var req = new XMLHttpRequest();
    var url = serverUrl + 'api/ping';

    req.onreadystatechange = function () {
        if (req.readyState === 4) {
            callback(req.responseText);
        }
    };

    req.open('GET', url, true);
    req.send();
};

//Pings the server, stores time before sending and after receiving "OK" from server.
function pingNow(pingNumber) {
    var pingTime = 0;
    var prePingTime = new Date().getTime();
    pingServer(function(response) {
        pingTime = new Date().getTime() - prePingTime;
        pingArray[pingNumber] = pingTime;
        if(pingArray[0] != undefined && pingArray[1] != undefined && pingArray[2] != undefined ) {
            var ms = (pingArray[0] +  pingArray[1] +  pingArray[2])/3;
            dataStream.sendData({id:'ping', latency:ms, streamId:localStream.getID()});
            addPingResult(ms, localStream.getID());
        }
    });
}

//Pings the server three times in order to get a mean value.
function pingForLeader() {
    isPingDone = false;
    pingArray = new Array(3);
    groupLatency = new Array(room.getStreamsByAttribute('type','media').length);    
    pingNow(0);
    pingNow(1);
    pingNow(2);
}

//Adds ping result to group latency array.
function addPingResult(latency, streamId) {
    for (var i = 0; i < groupLatency.length; i++) {
        if(groupLatency[i] == undefined) {
            groupLatency[i] = [latency,streamId];
            if(i === (groupLatency.length-1)) {
                isPingDone = true;
                decideNewLeader();
            }
            break;
        }        
    }
}

//Checks for lowest mean value in the group.
function decideNewLeader() {
    var lowestPing = groupLatency[0];
    for (var i = 1; i < groupLatency.length; i++) {
        if(groupLatency[i][0] < lowestPing[0]) {
            lowestPing = groupLatency[i];
        }
    }
    setLeader(lowestPing[1], lowestPing[0]);
}