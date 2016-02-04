function room(name, io) {
    this.name = name;
    this.users = new Array();
    this.io = io;
}

room.prototype.add = function (user) {
    if (this.users.length < 4) {
	this.users[user.name] = user;

	user.socket.join(this.name);
	this.io.to(this.name).emit('enteredUser', Object.keys(this.users));
	
	return true;
    }

    return false; 
}

function createRoom(name, io) {
    return new room(name, io);
}

module.exports = createRoom;
