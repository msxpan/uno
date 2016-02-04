var room = require('./room.js');
var user = require('./user.js');

function manager() {
    this.rooms = new Array();
    this.users = new Array();
}

manager.prototype.fetch = function(io) {
    this.io = io;
}

manager.prototype.enterRoom = function(args) {
    if (this.rooms[args.room] == null) {
	this.rooms[args.room] = room(args.room, this.io);
    }

    if (this.users[args.user] == null) {
	this.users[args.user] = user(args.user, args.socket);
    } else {
	this.users[args.user].socket = args.socket;
    }

    return this.rooms[args.room].add(this.users[args.user]);
}

function createManager() {
    return new manager();
}

module.exports = createManager;
