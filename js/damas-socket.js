(function (root, factory) {
    if (typeof define === 'function' && define.amd) { // AMD
        define(['socket.io-client'], factory);
    } else if (typeof module === 'object' && module.exports) { // Node
        module.exports = factory(require('socket.io-client'));
    } else { // Browser globals
        root.returnExports = factory(root.io);
    }
}(this, function (io) {
    if (typeof window !== 'undefined') {
        var address = location.protocol + '//' + location.host;
        var socket = io.connect(address, { path: '/socket.io' });

        window.addEventListener('beforeunload', function (event) {
            socket.close();
        });
    } else {
        // Suppose a local Socket.io server over TLS
        var address = 'wss://0.0.0.0:8443';
        var socket = io.connect(address, {
            path: '/socket.io',
            rejectUnauthorized: false
        });
    }

    socket.on('connect', function () {
        console.log('Connected to the Socket server ' + address);
    });

    socket.on('disconnect', function (reason) {
        console.log('Disconnected: ' + reason);
    });

    socket.on('create', function (nodes) {
        console.log(nodes.length + ' nodes created');
        console.log(nodes);
    });

    socket.on('update', function (nodes) {
        console.log(nodes.length + ' nodes updated');
        console.log(nodes);
    });

    socket.on('remove', function (nodes) {
        console.log(nodes.length + ' nodes removed');
        console.log(nodes);
    });

    return socket;
}));
