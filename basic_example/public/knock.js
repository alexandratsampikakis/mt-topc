function knockList(roomID) {
	this.yes = 0;
	this.no = 0;
	this.roomID = roomID;	
}

knockList.prototype.getNumNo = function() {
	return this.no;
};

knockList.prototype.getNumYes = function() {
	return this.yes;
};

knockList.prototype.addNumYes = function() {
	this.yes++;
};

knockList.prototype.addNumNo = function() {
	this.no++;
};