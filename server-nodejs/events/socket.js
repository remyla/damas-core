
var events = require('./');
var debug = require('debug')('app:io:' + process.pid);
var SocketServer = require('socket.io');

module.exports = io = new SocketServer();

/*
 * Socket management
 */
io.on('connection', function (socket) {
    debug('Socket client connected');

    socket.on('disconnect', function (reason) {
        debug('Socket client disconnected: ' + reason);
    });
});

/*
 * Listen for write operations on the database
 */
events.attach('create', function (nodes) {
    io.sockets.emit('create', nodes);
    this.next();
});

events.attach('update', function (nodes) {
    io.sockets.emit('update', nodes);
    this.next();
});

events.attach('remove', function (nodes) {
    io.sockets.emit('remove', nodes);
    this.next();
});

debug('Running socket.io server');

