
global.array_sync = function (array, walker, callback) {
    var next = 0;
    var results = [];
    (function walk() {
        if (next === array.length) {
            callback(results);
            ++next;
        } else if (next < array.length) {
            walker(array[next++], function (result) {
                results = results.concat(result);
                process.nextTick(walk);
            });
        }
    })();
}

/*
 * Attempt to fire an event, if the given array is valid
 */
var events = require('../events');
global.fireEvent = function (name, array) {
    var clean = array.filter(function (item) { return item !== null; });
    if (0 < clean.length) {
        events.fire(name, clean);
    }
}

