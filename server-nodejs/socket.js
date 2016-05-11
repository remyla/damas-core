
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

    debug('Socket server listening');
    return io;
};


