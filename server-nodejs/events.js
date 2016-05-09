/*
 * events.js - from Damas-Core
 * Licensed under the GNU GPL v3
 */

var listeners = {};
module.exports = new EventManager();


/*
 * EventManager()
 * Set of methods to easily and agnostically manage events
 */
function EventManager() {
    var self = this;

    /*
     * fire()
     * Fire an event: call all of its listeners
     */
    this.fire = function (hook) {
        if (hook in listeners) {
            var args = [];
            for (var i = 1; i < arguments.length; ++i) {
                args.push(arguments[i]);
            }
            var next = 0;
            var ctx = {
                data: {},
                name: hook,
                listener: null,

                // Detach the current event listener
                detach: function () {
                    self.detach(hook, listeners[hook][--next]);
                },

                // Attach another listener to the current event
                attach: function (callback) {
                    self.attach(hook, callback);
                },

                // Interrupt the event (don't call other listeners)
                interrupt: function () {
                    next = listeners[hook].length;
                }
            };

            while (next < listeners[hook].length) {
                ctx.listener = listeners[hook][next++];
                ctx.listener.apply(ctx, args);
            }
            return ctx.data;
        }
        return {};
    }; // fire()


    /*
     * afire()
     * Asynchronously fire events
     */
    this.afire = function () {
        var args = arguments; // Doesn't work without this hack
        setTimeout(function () {
            self.fire.apply(self.fire, args);
        }, 0);
    }; // afire()


    /*
     * attach()
     * Attach an event listener to an event
     */
    this.attach = function (hook, callback) {
        if (!(hook in listeners)) {
            listeners[hook] = [];
        }
        listeners[hook].push(callback);
    }; // attach()


    /*
     * detach()
     * Detach an event listener
     */
    this.detach = function (hook, callback) {
        if (hook in listeners) {
            var i = listeners[hook].indexOf(callback);
            if (-1 !== i) {
                listeners[hook].splice(i, 1);
            }
        }
    }; // detach()
}


