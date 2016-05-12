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
        var then = function () {};
        if (hook in listeners) {
            // Translate arguments
            var args = [];
            for (var i = 1; i < arguments.length; ++i) {
                args.push(arguments[i]);
            }

            // Required objects for running listeners
            var next = 0;
            var ctx = {
                data: {},
                name: hook,
                listener: null
            };

            function call(number) {
                if (number === listeners[hook].length) {
                    then(ctx.data);
                } else if (number < listeners[hook].length) {
                    ctx.listener = listeners[hook][number];
                    ctx.listener.apply(ctx, args);
                }
            }

            /*
             * Add utility functions to the context
             */

            // Detach the current listener
            ctx.detach = function () {
                self.detach(hook, --next);
            };

            // Attach another listener to the current event
            ctx.attach = function (callback) {
                self.attach(hook, callback);
            };

            // Stop the event
            ctx.end = function () {
                next = listeners[hook].length;
                ctx.next();
            };

            // Run asynchronously the next listener
            ctx.next = function () {
                process.nextTick(function () { call (next++); });
            };
            ctx.next();
        }
        return {
            then: function (callback) {
                then = callback;
            }
        };
    }; // fire()


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
    this.detach = function (hook, listener) {
        if (hook in listeners) {
            if (typeof listener === 'number') {
                var i = listener;
            } else {
                var i = listeners[hook].indexOf(listener);
            }
            if (-1 < i && i < listeners[hook].length) {
                listeners[hook].splice(i, 1);
            }
        }
    }; // detach()
}


