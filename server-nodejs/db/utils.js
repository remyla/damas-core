
/*
 * Attempt to fire an event, if the given array is valid
 */
var events = require('../events');
global.fireEvent = function (name, array) {
    var clean = array.filter(function (item) { return item !== null; });
    if (0 < clean.length) {
        events.fire(name, clean);
    }
};

/*
 * Unfold the _id key of a node
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


