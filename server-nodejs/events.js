/*
 * events.js - from Damas-Core
 * Licensed under the GNU GPL v3
 */

var listeners = {};

module.exports = new EventLayer();

function EventLayer() {
    var self = this;

    /*
     * fire()
     * Fire an event: call all of its listeners
     */
    this.fire = function (hook) {
        var args = [];
        for (var i = 1; i < arguments.length; ++i) {
            args.push(arguments[i]);
        }
        if (hook in listeners) {
            for (var id of Object.keys(listeners[hook])) {
                // Call the listener using itself as a context
                listeners[hook][id].apply(listeners[hook][id], args);
            }
        }
    }; // fire()


    /*
     * afire()
     * Asynchronously fire events
     */
    this.afire = function () {
        var args = arguments;
        setTimeout(function () {
            self.fire.apply(self.fire, args);
        }, 0);
    }; // afire()


    /*
     * attach()
     * Attach an event listener to an event
     */
    this.attach = function (hook, id, callback) {
        if (!(hook in listeners)) {
            listeners[hook] = {};
        }
        // Note that we allow the override of existing listeners
        listeners[hook][id] = callback;
    }; // attach()


    /*
     * detach()
     * Detach an event listener
     */
    this.detach = function (hook, id) {
        if (hook in listeners && id in listeners[hook]) {
            delete listeners[hook][id];
        }
    }; // detach()
}


