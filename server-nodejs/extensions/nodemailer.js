module.exports = function (app) {
    var debug = require('debug')('app:nodemailer');
    var nodemailer = require('nodemailer');
    var conf = app.locals.conf.nodemailer;

    debug(conf.transporter);
    debug(conf.from);
    var transporter = nodemailer.createTransport(conf.transporter);

    return transporter;

};

