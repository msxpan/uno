function user(name, socket) {
    this.name = name;
    this.socket = socket;
}

function createUser(name, socket) {
    return new user(name, socket);
}

module.exports = createUser;
