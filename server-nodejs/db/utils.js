
global.array_sync = function (array, walker, callback) {
    var iterator = {
        count: array.length,
        out: [],
        next: function (i, res) {
            this.out[i] = res;
            if (0 === --this.count) {
                callback(this.out);
            }
        }
    };
    for (var index = 0; index < array.length; ++index) {
        walker.apply(iterator, [array[index], index]);
    }
};

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


