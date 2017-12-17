/**
 * Created by salt on 28.10.2017.
 */
"use strict";
var config = require('./config');
var log = require('./log')("express");
var hook    = require('./hook');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
// var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();
var PORT = parseInt(config.http.port);

module.exports = function() {

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


    // ****************** routes *************************
    hook.getTrigger("createRoute", function(trigger, args) {
        if (!args || !args[0]) {
            log("ERROR: No url defined");
            return;
        }
        let route = express.Router();
        trigger(route);
        app.use(args[0], route);
    });
    // //@todo read all routes from path
    // var indexRoutes = require('./routes/index');
    // var usersRoute = require('./routes/users');
    // var dataRoute = require('./routes/data');

    // app.use('/', indexRoutes);
    app.use(function(req, res, next) {
        //@todo check if user is logged in
        next();
    });

    // app.use('/users', usersRoute);
    // app.use('/data', dataRoute);

    // ***************************************************


    // catch 404 and forward to error handler
    app.use(function(req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

    // error handler
    app.use(function(err, req, res, next) {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};
        if (req.app.get('env') === 'development') {
            log("ERROR: %s. %s".red, err.message, err.stack.split('\n')[1]);
            log(err.stack);
            // log("ERROR: %s".red, err.file + " | line:" + err.line);
        } else {
            log("ERROR: %s".red, err.message);
        }
        // render the error page
        res.status(err.status || 500);
        res.render('error');
    });
};


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
