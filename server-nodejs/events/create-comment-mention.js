/*
 * Licensed under the GNU GPL v3
 */

var events = require('./');

// TODO replace with a proper function
function sendMail(email, message) {
    console.log('Mail to ' + email);
    console.log(message);
}

function notifyUser(nodes) {
    this.next(); // Non-blocking; call the next listener
    var regExp = /(?:^|\s)@(\w+)/gim; // Find "user" in "Hello @user!"
    nodes.forEach(function (node) {
        if (!node.comment || !regExp.test(node.comment)) {
            return;
        }
        var users = [];
        var match;
        while (match = regExp.exec(string)) {
            users.push(match[1]);
        }
        users.forEach(function (name) {
            db.searchOne({username: name}, function (err, user) {
                if (!err && null !== user && user.email) {
                    sendMail(user.email, node.comment);
                }
            });
        });
    });
}

events.attach('create', notifyUser);


