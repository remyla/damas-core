
/*
 * Polyfill for the native Object.assign() method
 * Source: MDN
 */
if (typeof Object.assign != 'function') {
    Object.assign = function (target) {
        'use strict';
        if (target == null) {
            throw new TypeError('Cannot convert undefined or null to object');
        }

        target = Object(target);
        for (var index = 1; index < arguments.length; index++) {
            var source = arguments[index];
            if (source != null) {
                for (var key in source) {
                    if (Object.prototype.hasOwnProperty.call(source, key)) {
                        target[key] = source[key];
                    }
                }
            }
        }
        return target;
    };
}

/**
 * Tells whether the request contains an array
 * @param {object} req - The Express request to process
 * @return {boolean} - Whether the request contains an array
 */
global.isArray = function (req) {
    if (req.params.id) {
        return 1 < req.params.id.split(',');
    }
    return Array.isArray(req.body);
};

/**
 * Extract the ids from the request body
 * @param {object} req - The Express request to process
 * @return {array|false} - The ids of the request, false on failure
 */
global.getBodyIds = function (req) {
    if (req.body) {
        var ids = Array.isArray(req.body) ? req.body : [req.body];
        if (0 < ids.length && !ids.some(function (id) {
            if ('number' === typeof id) {
                id = id.toString();
            }
            return 'string' !== typeof id;
        })) {
            return ids;
        }
    }
    return false;
};

/**
 * Extract the ids from the request URI or body
 * @param {object} req - The Express request to process
 * @return {array|false} - The ids of the request, false on failure
 */
global.getRequestIds = function (req) {
    if (req.params.id) {
        var ids = req.params.id.split(',');
        if (0 < ids.length) {
            return ids;
        }
    }
    return getBodyIds(req);
};

/**
 * Unfold the _id key of the given nodes
 * @param {array} nodes - The nodes to process
 * @return {array} - The "unfolded" nodes
 */
global.unfoldIds = function (nodes) {
    var array = [];
    for (var i = 0; i < nodes.length; ++i) {
        if (Array.isArray(nodes[i]._id)) {
            array = array.concat(nodes[i]._id.map(function (id) {
                return Object.assign({}, nodes[i], {_id: id});
            }));
        } else {
            array.push(nodes[i]);
        }
    }
    return array;
};

/**
 * Send a JSON document by splitting it if it is an array
 * @param {object} res - The Express response object receiving the data
 * @param {} data - The data to send as JSON
 */
function sendJSON(res, data) {
    if (!Array.isArray(data) || 0 === data.length) {
        res.json(data);
        return;
    }
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.write('[' + JSON.stringify(data.shift()));
    var chunkSize = 100;
    for (var i = 0; i < data.length; i += chunkSize) {
        res.write(',' +
            JSON.stringify(data.slice(i, i + chunkSize))
            .slice(1, -1));
    }
    res.end(']');
    delete data;
}

/**
 * Send the desired HTTP status code
 * @param {object} res - The Express response object receiving the data
 * @param {integer} code - The wanted HTTP status code (< 300 for success)
 * @param {} data - The data to send on success, a error heading otherwise
 */
global.httpStatus = function (res, code, data) {
    res.status(code);
    if (code < 300) {
        sendJSON(res, data);
        return;
    }
    var e = data + ' error: ';
    switch (code) {
        case 400: e += 'Bad request (empty or not well-formed)'; break;
        case 401: e += 'Unauthorized (authentication required)'; break;
        case 403: e += 'Forbidden (permission required)'; break;
        case 404: e += 'Not found'; break;
        case 409: e += 'Conflict'; break;
        case 501: e += 'Not implemented (contact an administrator)'; break;
        default:  e += 'Unknown error code';
    }
    res.send(e);
};

/**
 * Tells whether a response is failed or incomplete (contains null?)
 * @param {array} doc - the database response
 * @return {{fail: boolean, partial: boolean}} - the results to send
 */
global.getMultipleResponse = function (doc) {
    var result = { fail: true, partial: false };
    for (var i in doc) {
        if (null === doc[i]) {
            result.partial = true;
        } else {
            result.fail = false;
        }
    }
    return result;
};


/**
 * Attempt to fire an event, if the given array is valid
 * @param {string} name - Name of the event to fire
 * @param {array} array - Array of elements to transmit to the listeners
 */
var events = require('../events');
global.fireEvent = function (name, array) {
    var clean = array.filter(function (item) { return item !== null; });
    if (0 < clean.length) {
        events.fire(name, clean);
    }
};


