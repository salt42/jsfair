/**
 * Created by salt on 28.10.2017.
 */
"use strict";
var config          = require('./jsfair/config');
var log             = require('./jsfair/log')("express");
var hook            = require('./hook');
var express         = require('express');
var path            = require('path');
var favicon         = require('serve-favicon');
var cookieParser    = require('cookie-parser');
var bodyParser      = require('body-parser');
var hbs             = require('express-hbs');

var app = express();
var PORT = parseInt(config.server.http.port);

// view engine setup
global.headerIncludes = "";
hbs.registerHelper('headerIncludes', function(text, options) {
    return new hbs.SafeString(headerIncludes);
});
// Use `.hbs` for extensions and find partials in `views/partials`.
app.engine('hbs', hbs.express4({
    // partialsDir: __dirname + '/views/partials'
    beautify: false,
}));
//aber mit den helper funcs eventuel noch
//eventuel einfach ein anderes plugin versuchen,
app.set('view engine', 'hbs');
app.set('views', path.join(ROOT_PATH, config.server.http.viewsDir));

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
// app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

for (let i = 0; i < config.server.http.staticDirs.length; i++) {
    app.use(express.static(path.join(ROOT_PATH, config.server.http.staticDirs[i])));
}
app.use("/jsfair", express.static(path.join(jsfairPath, 'client')));



let isPortTaken = function(port, fn) {
    let net = require('net');
    let tester = net.createServer()
        .once('error', function (err) {
            if (err.code !== 'EADDRINUSE') return fn(err)
            fn(null, true)
        })
        .once('listening', function() {
            tester.once('close', function() { fn(null, false) })
                .close()
        })
        .listen(port)
};
function logErrors(err, req, res, next) {
    console.error(err.stack);
    next(err);
}
function clientErrorHandler(err, req, res, next) {
    if (req.xhr) {
        res.status(500).send({ error: 'Something failed!' });
    } else {
        next(err);
    }
}
function errorHandler(err, req, res, next) {
    res.status(500);
    res.render('error', { error: err });
}
module.exports = {};
module.exports.init = function () {
    hook.trigger("http_init", app);
    // ****************** routes *************************
    hook.getTrigger("http_createRoute", function(trigger, args) {
        log("create router %s", args[0]);
        if (!args || !args[0]) {
            log("ERROR: No url defined");
            return;
        }
        let router = express.Router();
        trigger(router);
        app.use(args[0], router);
    });
    //@todo trigger route setup hook
    // ***************************************************

    app.use(logErrors);
    app.use(clientErrorHandler);
    app.use(errorHandler);

    isPortTaken(PORT, function(err, taken) {
        if (err) {
            log(err);
            return;
        }
        if (taken) {
            log("port '" + PORT + "' is not free");
            return;
        }
        app.listen(PORT, function () {
            log('HTTP'.magenta + ' listening on port ' + PORT.toString().magenta);
        });
    });
};

