 var pathToSend = [];
//==============================================================================
// LOCAL USER VARIABLES
//==============================================================================
// A flag to track whether the user is drawing or not
var isPenDown = false;
 
// Line defaults
var defaultLineColor = "#61b7e2";
var defaultLineThickness = 3;
var maxLineThickness = 30;
 
// Tracks the current location of the user's drawing pen
var localPen = {};
 
// The user's line styles
var localLineColor = defaultLineColor;
var localLineThickness = defaultLineThickness;
 
// A list of points in a path to send to other connected users
var bufferedPath = [];
// A timestamp indicating the last time a point was added to the bufferedPath
var lastBufferTime = new Date().getTime();
 
//==============================================================================
// REMOTE USER VARIABLES
//==============================================================================
// A hash of pen positions for remote users, in the following
// format ("2345" is an example client ID):
//  {"2345": {x:10, y:10}}
var userCurrentPositions = {};
// A hash of pending drawing commands sent by remote users, the following format:
//  {"2345": [{commandName:moveTo, arg:{x:10, y:10}}, {commandName:lineTo, arg:{x:55, y:35}}]};
var userCommands = {};
// A hash of line colors for remote users, in the following format:
//  {"2345": "#CCCCCC"};
var userColors = {};
// A hash of line thicknesses for remote users, in the following format:
//  {"2345": 5};
var userThicknesses = {};
 
//==============================================================================
// DRAWING VARIABLES
//==============================================================================
// The HTML5 drawing canvas
var canvas;
// The drawing canvas's context, through which drawing commands are performed
var context;
// A hash of drawing commands executed by UnionDraw's rendering process
var DrawingCommands = {LINE_TO:       "lineTo",
                       MOVE_TO:       "moveTo",
                       SET_THICKNESS: "setThickness",
                       SET_COLOR:     "setColor"};
 
//==============================================================================
// TIMER VARIABLES
//==============================================================================
// The ID for a timer that sends the user's drawing path on a regular interval
// var broadcastPathIntervalID;
// // The ID for a timer that executes drawing commands sent by remote users
// var processDrawingCommandsIntervalID;
 
//==============================================================================
// INITIALIZATION
//==============================================================================
// Trigger init() when the document finishes loading
//window.onload = init;
addOnloadHandler(init);
 
// Main initialization function
function init () {
  initCanvas();
  registerInputListeners();
}

function addOnloadHandler (newFunction) {
 var oldevent = window.onload;
 if (typeof oldevent == "function") {
  window.onload = function() {
      if (oldevent) {
          oldevent();
      }
   newFunction();
  };
 }
 else {
      window.onload = newFunction;
 }
}
 
// Set up the drawing canvas
function initCanvas () {
  // Retrieve canvas reference
  canvas = document.getElementById("canvasNapkin");
 
  // If IE8, do IE-specific canvas initialization (required by excanvas.js)
  if (typeof G_vmlCanvasManager != "undefined") {
    this.canvas = G_vmlCanvasManager.initElement(this.canvas);
  }
 
  // Size canvas
  canvas.width  = 600;
  canvas.height = 400;
 
  // Retrieve context reference, used to execute canvas drawing commands
  context = canvas.getContext('2d');
  context.lineCap = "round";
 
  // Set control panel defaults
  document.getElementById("thickness").selectedIndex = 0;
  document.getElementById("color").selectedIndex = 1;
}
 
// Register callback functions to handle user input
function registerInputListeners () {
  canvas.onmousedown = pointerDownListener;
  document.onmousemove = pointerMoveListener;
  document.onmouseup = pointerUpListener;
  document.getElementById("thickness").onchange = thicknessSelectListener;
  document.getElementById("color").onchange = colorSelectListener;
}
 
 
// Triggered when one of the clients in the drawing room changes an attribute
// value. When an attribute value changes, check to see whether it was either
// the "thickness" attribute or the "color" attribute.
function clientAttributeUpdateListener (attrScope,
                                        clientID,
                                        userID,
                                        attrName,
                                        attrVal,
                                        attrOptions) {
  if (attrScope == roomID) {
    processClientAttributeUpdate(clientID, attrName, attrVal);
  }
}
 
//==============================================================================
// MOUSE-INPUT EVENT LISTENERS
//==============================================================================
// Triggered when the mouse is pressed down
function pointerDownListener (e) {
  console.log('fehruia');
  // Retrieve a reference to the Event object for this mousedown event.
  // Internet Explorer uses window.event; other browsers use the event parameter
  var event = e || window.event;
  // Determine where the user clicked the mouse.
  var mouseX = event.clientX - $('#canvasNapkin').offset().left;//canvas.offsetLeft;
  var mouseY = event.clientY - $('#canvasNapkin').offset().top;//canvas.offsetTop;
 
  // Move the drawing pen to the position that was clicked
  penDown(mouseX, mouseY);
 
  // We want mouse input to be used for drawing only, so we need to stop the
  // browser from/ performing default mouse actions, such as text selection.
  // In Internet Explorer, we "prevent default actions" by returning false. In
  // other browsers, we invoke event.preventDefault().
  if (event.preventDefault) {
    if (event.target.nodeName != "SELECT") {
      event.preventDefault();
    }
  }
}
 
// Triggered when the mouse moves
function pointerMoveListener (e) {
  var event = e || window.event; // IE uses window.event, not e
  var mouseX = event.clientX - $('#canvasNapkin').offset().left;// - canvas.offsetLeft;
  var mouseY = event.clientY - $('#canvasNapkin').offset().top;// - canvas.offsetTop;
 
  // Draw a line if the pen is down
  penMove(mouseX, mouseY);
 
  // Prevent default browser actions, such as text selection
  if (event.preventDefault) {
    event.preventDefault();
  }
}
 
// Triggered when the mouse button is released
function pointerUpListener (e) {
  // "Lift" the drawing pen
  penUp();
}
 
//==============================================================================
// CONTROL PANEL MENU-INPUT EVENT LISTENERS
//==============================================================================
// Triggered when an option in the "line thickness" menu is selected
function thicknessSelectListener (e) {
  // Determine which option was selected
  var newThickness = this.options[this.selectedIndex].value;
  // Locally, set the line thickness to the selected value
  localLineThickness = getValidThickness(newThickness);
}
 
// Triggered when an option in the "line color" menu is selected
function colorSelectListener (e) {
  // Determine which option was selected
  var newColor = this.options[this.selectedIndex].value;
  // Locally, set the line color to the selected value
  localLineColor = newColor;
}
 
//==============================================================================
// PEN
//==============================================================================
// Places the pen in the specified location without drawing a line. If the pen
// subsequently moves, a line will be drawn.
function penDown (x, y) {
  isPenDown = true;
  localPen.x = x;
  localPen.y = y;
  pathToSend.push(x);
  pathToSend.push(y);
  // Send this user's new pen position to other users.
  //broadcastMove(x, y);
 
  // Begin sending this user's drawing path to other users every 500 milliseconds.
  //broadcastPathIntervalID = setInterval(broadcastPath, 500);
}
 
// Draws a line if the pen is down.
function penMove (x, y) {
  if (isPenDown) {
    // Buffer the new position for broadcast to other users. Buffer a maximum
    // of 100 points per second.
    if ((new Date().getTime() - lastBufferTime) > 10) {
      bufferedPath.push(x + "," + y);
      lastBufferTime = new Date().getTime();
    }
    pathToSend.push(x);
    pathToSend.push(y);
    // Draw the line locally.
    drawLine(localLineColor, localLineThickness, localPen.x, localPen.y, x, y);
 
    // Move the pen to the end of the line that was just drawn.
    localPen.x = x;
    localPen.y = y;
  }
}
 
// "Lifts" the drawing pen, so that lines are no longer draw when the mouse or
// touch-input device moves.
function penUp () {
  isPenDown = false;
  if(pathToSend.length > 0) {
    dataStream.sendData({id:'paint', color:localLineColor, thickness:localLineThickness,path:pathToSend, width:$('#canvasNapkin')[0].width, height:$('#canvasNapkin')[0].height});
    pathToSend = [];
  }
  
}
 
//==============================================================================
// DRAWING
//==============================================================================
// Draws a line on the HTML5 canvas
function drawLine (color, thickness, x1, y1, x2, y2) {
  context.strokeStyle = color;
  context.lineWidth   = thickness;
 
  context.beginPath();
  context.moveTo(x1, y1)
  context.lineTo(x2, y2);
  context.stroke();
}
 
//==============================================================================
// STATUS
//==============================================================================
// Updates the text of the on-screen HTML "status" div tag
function setStatus (message) {
  document.getElementById("status").innerHTML = message;
}
 
//==============================================================================
// DATA VALIDATION
//==============================================================================
function getValidThickness (value) {
  value = parseInt(value);
  var thickness = isNaN(value) ? defaultLineThickness : value;
  return Math.max(1, Math.min(thickness, maxLineThickness));
}

function redrawNapkin() {
    var c = $('#canvasNapkin')[0];
    var imgData = c.toDataURL();
    var ctx = c.getContext("2d");
    var myImage = new Image();
    myImage.onload = function() {
        ctx.drawImage(myImage, 0, 0,c.width,c.height);
    };

    $('.tabbable').css({
        position:'absolute'
    });

    myImage.src = imgData;
    c.height = $(window).height() - 550; //415;
    c.width = 1.5*c.height;
}

function drawPath(color, thickness, path, width, height) {
    var widthRatio = $('#canvasNapkin')[0].width/width;
    var heightRatio = $('#canvasNapkin')[0].height/height;
    for (var i = 0; i < path.length; i+=2) {
        drawLine(color, thickness, path[i]*widthRatio, path[i+1]*heightRatio, path[i+2]*widthRatio, path[i+3]*heightRatio);
    };
}

function drawLine (color, thickness, x1, y1, x2, y2) {
    context.strokeStyle = color;
    context.lineWidth   = thickness;

    context.beginPath();
    context.moveTo(x1, y1)
    context.lineTo(x2, y2);
    context.stroke();
}

function sendNapkinToNewUser() {
    var c = document.getElementById("canvasNapkin");
    var ctx = c.getContext("2d");
    var napkinImgData = c.toDataURL();
    dataStream.sendData({id:'currentNapkin', napkinImgData: napkinImgData});
}

