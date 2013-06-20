//Globals
var room, cafe, localStream, dataStream, overhearStream, nameOfUser, urlVideo;
var audioElement;
var knockListYes = new Object();
var knockListNo = new Object();
var tableId = new Array();
var leader;
var knockTimer = 20 * 1000; //20 seconds
var knocker = 0;
var chairImg = new Image();
var currentTable;
var isPingDone = false;