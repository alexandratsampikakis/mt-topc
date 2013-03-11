var express = require('express'),
    net = require('net'),
    N = require('./nuve'),
    fs = require("fs"),
    https = require("https"),
    config = require('./../../../lynckia_config');

//Database
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  // yay!
});

var options = {
    key: fs.readFileSync('cert/key.pem').toString(),
    cert: fs.readFileSync('cert/cert.pem').toString()
};

var app = express();

app.use(express.bodyParser());

app.configure(function () {
    "use strict";
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
    app.use(express.logger());
    app.use(express.static(__dirname + '/public'));
    //app.set('views', __dirname + '/../views/');
    //disable layout
    //app.set("view options", {layout: false});
});

app.all('/', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With');
    if (req.method == 'OPTIONS') {
        res.send(200);
    }
    else {
        next();
    }
});

N.API.init(config.nuve.superserviceID, config.nuve.superserviceKey, 'http://localhost:3000/');

var myRoom;

//########################### DATABASE ###########################
//6 tables / room
var cafeSchema = mongoose.Schema({
    table1: String,
    table2: String,
    table3: String,
    table4: String,
    table5: String,
    table6: String
});

app.get('/createNewCafe/', function (req, res) {
    "use strict";
    var tables = new Array();
    for (var i = 0; i <= 5; i++) {
        N.API.createRoom('myRoom', function (roomID) {
            myRoom = roomID._id;
            console.log('Created room ', myRoom);
            tables[i] = myRoom;
        });
    }
    var cafeModel = mongoose.model('cafeModel', cafeSchema);
    var newCafe = new cafeModel({table1: tables[0], 
                                 table2: tables[1],
                                 table3: tables[2], 
                                 table4: tables[3], 
                                 table5: tables[4], 
                                 table6: tables[5]
    });
    newCafe.save(function (err) {
      if (err) console.log("Failed to create cafe");
    });
    cafeModel.find(function (err, newCafes) {
      if (err) // TODO handle err
      console.log(newCafes)
    });
});
//################################################################
//db END



N.API.getRooms(function (roomlist) {
    "use strict";
    var rooms = JSON.parse(roomlist);
    console.log(rooms.length);
    if (rooms.length === 0) {
        N.API.createRoom('myRoom', function (roomID) {
            myRoom = roomID._id;
            console.log('Created room ', myRoom);
        });
    } else {
        var cafeModel = mongoose.model('cafeModel', cafeSchema);
        for (var i = 0; i <= 36; i=i+6) {
            var newCafe = new cafeModel({table1: rooms[i], 
                                         table2: rooms[i+1],
                                         table3: rooms[i+2], 
                                         table4: rooms[i+3], 
                                         table5: rooms[i+4], 
                                         table6: rooms[i+5]
            });
            newCafe.save(function (err) {
                console.log("hej");
              if (err) console.log("Failed to create cafe");
            });
            newCafe.findSimilarTypes(function (err, newCafes) {
              if (err) // TODO handle err
              console.log(newCafes)
            });
        };
        myRoom = rooms[0]._id;
        console.log('Using room ', myRoom);
    }
});

app.post('/createToken/', function (req, res) {
    "use strict";
    var room = myRoom,
        username = req.body.username,
        role = req.body.role;
    N.API.createToken(room, username, role, function (token) {
        console.log(token);
        res.send(token);
    });
     var roomId = myRoom;
 
    N.API.getUsers(roomId, function(users) {
      var usersList = JSON.parse(users);
      console.log('This room has ', usersList.length, 'users');
     
      for(var i in usersList) {
        console.log('User ', i, ':', usersList[i].name, 'with role: ', usersList[i].role);
      }
    });
});

app.get('/getRooms/', function (req, res) {
    "use strict";
    N.API.getRooms(function (rooms) {
        res.send(rooms);
    });
});

app.get('/getUsers/:room', function (req, res) {
    "use strict";
    var room = req.params.room;
    N.API.getUsers(room, function (users) {
        res.send(users);
        console.log('users: ', users);
    });
});


app.listen(3001);

var server = https.createServer(options, app);
server.listen(3004);