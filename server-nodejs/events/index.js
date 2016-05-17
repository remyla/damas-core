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
        var toRun = (hook in listeners) ? listeners[hook] : [];

        // Translate arguments
        var args = [];
        for (var i = 1; i < arguments.length; ++i) {
            args.push(arguments[i]);
        }

        // Required for running listeners
        var next = 0;
        var ctx = {
            data: {},
            name: hook,
            listener: null,

            // Detach the current listener
            detach: function () {
                self.detach(hook, --next);
            },

            // Attach another listener to the current event
            attach: function (callback) {
                self.attach(hook, callback);
            },

            // Stop the event
            end: function () {
                next = toRun.length;
                ctx.next();
            },

            // Run asynchronously the next listener
            next: function () {
                process.nextTick(function () {
                    if (next === toRun.length) {
                        then(ctx.data);
                        ++next;
                    } else if (next < toRun.length) {
                        ctx.listener = toRun[next++];
                        ctx.listener.apply(ctx, args);
                    }
                });
            }
        };

        ctx.next();

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


