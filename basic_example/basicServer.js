var express = require('express'),
    net = require('net'),
    N = require('./nuve'),
    fs = require("fs"),
    https = require("https"),
    nodemailer = require('nodemailer'),
    config = require('./../../../lynckia_config');

//Mailing for feedback

var transport = nodemailer.createTransport("Sendmail", "/usr/sbin/sendmail");

//Database
var mongoose = require('mongoose');
var ttl = require('mongoose-ttl');
var Schema = mongoose.Schema;
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

//########################### EMAILFEEDBACK ######################
app.post('/sendFeedback', function (req, res) {
    "use strict";
    var subject = req.body.subject,
        email = req.body.email,
        text = req.body.text;
    var message = {
        from: '<'+email+'>',
        to: 'iDipity <idipity@googlegroups.com>',
        subject: subject, 
        text: text,
        html:'',
        attachments:[]
    };

    transport.sendMail(message, function(error){
        if(error){

            return;
        }
        res.send('Mail sent!');
    });
});

//########################### DATABASE ###########################
//6 tables / room
var cafeSchema = new Schema({
    name: String,
    table1: String,
    table2: String,
    table3: String,
    table4: String,
    table5: String,
    table6: String
});

var tableImgSchema = new Schema({
    roomID: String,
    imageData: String
});
tableImgSchema.plugin(ttl, { ttl: 1000*60*5.2 });

    //########################### IMAGES ######################
    app.post('/api/sendTableImg/:room', function (req, res) {
        "use strict";
        var tableImgModel = mongoose.model('tableImgModel', tableImgSchema);
        var newTableImage = new tableImgModel({
            roomID: req.params.room,
            imageData: req.body.imgData
        });
        newTableImage.update({roomID:req.params.room}, {$set: { imageData: req.body.imgData }}, {upsert: true}, function (err)
        {

        });
        /*newTableImage.save(function (err) {
          if (err) console.log("Failed to create cafe");
        });*/
        res.send(req.params.room);
    });

app.get("/api/getTableImg/:room", function (req, res) {
    var roomID = req.params.room;

    console.log(req.params.room);
    var tableImgModel = mongoose.model('tableImgModel', tableImgSchema);

    tableImgModel.findOne({roomID: roomID }, function (err, records) {
        console.log(err);
        console.log(records);
        if(err) {
            res.json({
                error: 'Database error.'
            });
        } else if(records === null) {
            console.log('no image available');
            res.json({
                //bild för tomt café
                empty:true
            });
        } else {
            res.json({
                imageData: records.imageData
            });
        }
    });
});

/*app.get('/createNewCafe/', function (req, res) {
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
});*/

app.get("/api/getcafes", function (req, res) {
    var cafe = [];

    var cafeModel = mongoose.model('cafeModel', cafeSchema);
    cafeModel.find({}, function (err, records) {
        if(err) {
            res.json({
                error: 'Database error.'
            });
        } else if(records === null) {
            res.json({
                error: 'Café does not exist.'
            });
        } else {
            records.forEach(function (post, i) {
                cafe.push({
                    id: i,
                    name: post.name,
                    table1: post.table1, 
                    table2: post.table2,
                    table3: post.table3, 
                    table4: post.table4, 
                    table5: post.table5, 
                    table6: post.table6
                  });
                });
            res.json({
                cafe: cafe
            });
        }
    });
});

app.get("/api/getcafenames", function (req, res) {
    var cafe = [];

    var cafeModel = mongoose.model('cafeModel', cafeSchema);
    cafeModel.find({}, function (err, records) {
        if(err) {
            res.json({
                error: 'Database error.'
            });
        } else if(records === null) {
            res.json({
                error: 'Café does not exist.'
            });
        } else {
            records.forEach(function (post, i) {
                cafe.push({
                    id: i,
                    name: post.name
                  });
                });
            res.json({
                cafe: cafe
            });
        }
    });
});

app.get("/api/getcafe/:name", function (req, res) {
    var cafeName = req.params.name;

    var cafeModel = mongoose.model('cafeModel', cafeSchema);

    cafeModel.findOne({name: cafeName }, function (err, records) {
        console.log(err);
        console.log(records);
        if(err) {
            res.json({
                error: 'Database error.'
            });
        } else if(records === null) {
            res.json({
                error: 'Café does not exist.'
            });
        } else {
            res.json({
                name: records.name,
                table1: records.table1, 
                table2: records.table2,
                table3: records.table3, 
                table4: records.table4, 
                table5: records.table5, 
                table6: records.table6
            });
        }
    });
});

//################################################################
//db END

app.get('/cafeView.html', function(req, res){
  res.send('cafe: ' + req.query.cafe);
});

N.API.getRooms(function (roomlist) {
    "use strict";
    var rooms = JSON.parse(roomlist);
    console.log(rooms.length);
    /*if (rooms.length === 0) {
        N.API.createRoom('myRoom', function (roomID) {
            myRoom = roomID._id;
            console.log('Created room ', myRoom);
        });
    } else {
        /*var cafeModel = mongoose.model('cafeModel', cafeSchema);
        for (var i = 0; i <= 36; i=i+6) {
            var newCafe = new cafeModel({table1: rooms[i], 
                                         table2: rooms[i+1],
                                         table3: rooms[i+2], 
                                         table4: rooms[i+3], 
                                         table5: rooms[i+4], 
                                         table6: rooms[i+5]
            });
            newCafe.save(function (err) {
              if (err) console.log("Failed to create cafe");
            });
            cafeModel.find(function (err, newCafes) {
              if (err); // TODO handle err
              console.log("antal rum: ", newCafes.length);
            });
        };
        myRoom = rooms[0]._id;
        console.log('Using room ', myRoom);
    }*/
});

app.post('/createToken/:room', function (req, res) {
    "use strict";
    var room = req.params.room,
        username = req.body.username,
        role = req.body.role;
    N.API.createToken(room, username, role, function (token) {
        console.log(token);
        res.send(token);
    });
     var roomId = myRoom;
 
    /*N.API.getUsers(roomId, function(users) {
      var usersList = JSON.parse(users);
      console.log('This room has ', usersList.length, 'users');
     
      for(var i in usersList) {
        console.log('User ', i, ':', usersList[i].name, 'with role: ', usersList[i].role);
      }
    });*/
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