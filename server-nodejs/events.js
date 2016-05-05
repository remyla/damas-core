/*
 * events.js - from Damas-Core
 * Licensed under the GNU GPL v3
 */

var listeners = {};
var manager = module.exports = new EventManager();


/*
 * EventContext()
 * Constructor for a context object for event listeners
 */
function EventContext(name, id, data) {
    this.next = id + 1;
    this.data = data;
    this.name = name;
    this.listener = listeners[name][id];

    /*
     * detach()
     * Detach the current event listener
     */
    this.detach = function () {
        manager.detach(name, listeners[name][id]);
        --this.next;
    };


    /*
     * attach()
     * Attach another listener to the current event
     */
    this.attach = function (callback) {
        manager.attach(name, callback);
    };


    /*
     * interrupt()
     * Interrupt the event (don't call other listeners)
     */
    this.interrupt = function () {
        this.next = listeners[name].length;
    };
}


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
        var data = {};
        if (hook in listeners) {
            var args = [];
            for (var i = 1; i < arguments.length; ++i) {
                args.push(arguments[i]);
            }
            for (var l = 0; l < listeners[hook].length;) {
                var context = new EventContext(hook, l, data);
                listeners[hook][l].apply(context, args);

                data = context.data;
                l = context.next;
            }
        }
        return data;
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


