 var pathToSend = [];

// LOCAL USER VARIABLES
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

 
// DRAWING VARIABLES
// The HTML5 drawing canvas
var canvas;

// The drawing canvas's context, through which drawing commands are performed
var context;

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
 
// MOUSE-INPUT EVENT LISTENERS
// Triggered when the mouse is pressed down
function paintOnMouseDown(e) {

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
  // if (event.preventDefault) {
  //   if (event.target.nodeName != "SELECT") {
  //     event.preventDefault();
  //   }
  // }
} 

function paintOnMoveListener (e) {
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
 
// CONTROL PANEL MENU-INPUT EVENT LISTENERS
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
 
// PEN
// Places the pen in the specified location without drawing a line. If the pen
// subsequently moves, a line will be drawn.
function penDown (x, y) {
  isPenDown = true;
  localPen.x = x;
  localPen.y = y;
  pathToSend.push(x);
  pathToSend.push(y);
}
 
// Draws a line if the pen is down.
function penMove (x, y) {
  if (isPenDown) {
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
    var c = $('#canvasNapkin')[0];
    var context = c.getContext("2d");
    context.strokeStyle = color;
    context.lineWidth   = thickness;

    context.beginPath();
    context.moveTo(x1, y1)
    context.lineTo(x2, y2);
    context.stroke();
}

//The leader sends the current napkin to a new user who enters the room.
function sendNapkinToNewUser() {
    var c = document.getElementById("canvasNapkin");
    var ctx = c.getContext("2d");
    var napkinImgData = c.toDataURL();
    dataStream.sendData({id:'currentNapkin', napkinImgData: napkinImgData});
}

