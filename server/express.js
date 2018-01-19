/**
 * Created by salt on 28.10.2017.
 */
"use strict";
var config = require('./jsfair/config');
var log = require('./jsfair/log')("express");
var hook    = require('./hook');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
// var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();
var PORT = parseInt(config.http.port);

// app.locals.headerIncludes = '<headerincludes></headerincludes>';
// view engine setup
app.set('views', path.join(rootPath, config["http"]["viewsDir"]));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
// app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

for (let i = 0; i < config["http"]["staticDirs"].length; i++) {
    app.use(express.static(path.join(rootPath, config["http"]["staticDirs"][i])));
}
app.use("/jsfair", express.static(path.join(jsfairPath, 'client')));



let isPortTaken = function(port, fn) {
    let net = require('net')
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

module.exports = {};
module.exports.init = function () {
    app.locals.headerIncludes = " ";
    // hook.getTrigger("http_createRoute", function(trigger, args) {
    //     log("create router %s", args[0]);
    //     if (!args || !args[0]) {
    //         log("ERROR: No url defined");
    //         return;
    //     }
    //     let router = express.Router();
    //     trigger(router);
    //     app.use(args[0], router);
    // });
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

    // Handle 404
    app.use(function(req, res) {
        res.status(404).send('404: Page not Found');
    });

    // Handle 500
    app.use(function(error, req, res, next) {
        res.status(500).send('500: Internal Server Error');
    });

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

