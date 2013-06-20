//Adds room to knocklist
function addToKnockList(roomId) {
    if(!knockListYes.hasOwnProperty(roomId)) {
        knockListYes[roomId] = 0;
        setTimeout(function () {removeRoomFromKnocklist(roomId)}, knockTimer+7000);
    }
    if(!knockListNo.hasOwnProperty(roomId)) {
        knockListNo[roomId] = 0;
    }
}

//VOTE: adds the number of yes a user gets.
function addYesCount (roomId) {
    if(knockListYes.hasOwnProperty(roomId)) {
        knockListYes[roomId] += 1;
    }
}

function getYesCount(roomId) {
    if(knockListYes.hasOwnProperty(roomId)) {
        return knockListYes[roomId];
    }
}

function getNoCount(roomId) {
    if(knockListNo.hasOwnProperty(roomId)) {
        return knockListNo[roomId];
    }
}

//VOTE: adds the number of no a user gets.
function addNoCount (roomId) {
    if(knockListNo.hasOwnProperty(roomId)) {
        knockListNo[roomId] += 1;
    }
}

//Removes room from knocklist
function removeRoomFromKnocklist(roomId) {
    if(knockListYes.hasOwnProperty(roomId)) {
        delete knockListYes[roomId];
    }
    if(knockListNo.hasOwnProperty(roomId)) {
        delete knockListNo[roomId];
    }
}

var askToJoinTablePopup = function(nameOfUser) {
    knockSound();
    $('#knocking').notify({ type: 'bangTidy', onYes:function () {dataStream.sendData({id:'popup-answer',user:nameOfUser, answer: true})}, onNo:function () {dataStream.sendData({id:'popup-answer',user:nameOfUser, answer: false})}, onClose:function () {dataStream.sendData({id:'popup-answer',user:nameOfUser, answer: false})}, message: { html: '<p style="color: grey"><b>Hey</b>, ' + nameOfUser +' wants to sit down, is that OK?</p>' }, fadeOut: { enabled: true, delay: knockTimer}}).show();
};

//Notifications to the user who wants to join a room.
var deniedNotification = function(whatCase) {
    switch (whatCase) {
        case 1:
            $('#answer').notify({ fadeOut: { enabled: true, delay: 5000 }, type: 'bangTidy', question: false, message: { html: '<p style="color: grey"><b>Hey</b>, seems that the users want some privacy at the moment. Try again later!</p>' }}).show();
            break;
        case 2:
            $('#answer').notify({ fadeOut: { enabled: true, delay: 5000 }, type: 'bangTidy', question: false, message: { html: '<p style="color: grey"><b>Hey</b>, all the seats are taken at the moment. Try again later!</p>' }}).show();
            break;
       default:
    }
}