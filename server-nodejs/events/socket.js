
var events = require('./');
var debug = require('debug')('app:io:' + process.pid);
var SocketServer = require('socket.io');

module.exports = function (server, options) {
    io = new SocketServer(server, options || {});

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

    events.attach('delete', function (nodes) {
        io.sockets.emit('delete', nodes);
        this.next();
    });

    debug('Socket server listening');
    return io;
};


