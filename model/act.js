var manager = require('./manager.js')();

function act() {
}

act.prototype.fetch = function(io) {
    manager.fetch(io);
    
    io.on("connection", function(socket) {
        socket.on('enter', function(args){
	    args.socket = socket;
	    manager.enterRoom(args);
	});
    });
}


function createAct() {
    return new act();
}

module.exports = createAct;
