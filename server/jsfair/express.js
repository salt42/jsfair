/**
 * Created by salt on 28.10.2017.
 */
"use strict";
const config          = require('jsfair/config');
let confSecure = config.server.http.secure;

config.registerConfig({
    server: {
        http: {
            port: 666,
            staticDirs: [],
            viewsDir: "/views",
            secure: false
        }
    }
});
if (confSecure === true) {
    config.save({server:{http:{secure: {
        keyFile: "",
        certFile: ""
    }}}});
    throw "Please add TLS key and cert file path to config.json";
}

const log             = require('jsfair/log')("express");
const hook            = require('jsfair/hook');
const express         = require('express');
const path            = require('path');
const favicon         = require('serve-favicon');
const hbs             = require('express-hbs');
const Http            = (config.server.http.secure)? require('https'): require('http');
const app = express();
const PORT = parseInt(config.server.http.port);
const serverOpt = (!config.server.http.secure)? app: {cert:config.server.http.secure.certFile, key:config.server.http.secure.keyFile};
const server = Http.createServer(serverOpt, app);



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
    switch(err.status) {
        case 404:
            log.warn("404 ", err.message);
            break;
        default:
            log.error(err.stack);
    }
    next(err);
}
function clientErrorHandler(err, req, res, next) {
    if (req.xhr) {
        res.status((err.status)? err.status: 500 ).send({ error: err });
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
    //app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
    let g = {};
    module.exports.viewEngine(app, g);
    module.exports.cookieParser(app, g);
    module.exports.bodyParser(app, g);
    module.exports.session(app, g);
    module.exports.afterSession(app, g);
    for (let i = 0; i < config.server.http.staticDirs.length; i++) {
        app.use(express.static(path.join(ROOT_PATH, config.server.http.staticDirs[i])));
    }
    app.use("/jsfair", express.static(path.join(jsfairPath, 'client')));
    hook.trigger("http_init", app, server, g);
    // ****************** routes *************************
    hook.getTrigger("http_createRoute", function(trigger, args) {
        log("create router %s", args[0]);
        if (!args || !args[0]) {
            log.error("No url defined in 'http_createRoute' hook");
            console.trace();
            return;
        }
        let router = express.Router();
        trigger(router);
        app.use(args[0], router);
    });
    //@todo trigger route setup hook
    // ***************************************************
    //error handling
    app.use(function(req, res, next) {
        let url = req.protocol + '://' + req.get('host') + req.originalUrl;
        let err = new Error("Url Not Found '"+ url +"'");
        err.status = 404;
        // res.send("Url Not Found '"+ url +"'");
        next(err);
    });
    app.use(logErrors);
    app.use(clientErrorHandler);
    app.use(errorHandler);
    //start server
    isPortTaken(PORT, function(err, taken) {
        if (err) {
            log.error(err);
            return;
        }
        if (taken) {
            log.error("port '" + PORT + "' is not free");
            return;
        }
        server.listen(PORT, function () {
            log.info('HTTP'.magenta + ' listening on port ' + PORT.toString().magenta);
        });
    });
};
module.exports.viewEngine = (app, g) => {
    // view engine setup
    global.headerIncludes = "";
    hbs.registerHelper('headerIncludes', function(text, options) {
        return new hbs.SafeString(headerIncludes);
    });
    app.engine('hbs', hbs.express4({
        // partialsDir: __dirname + '/views/partials'
        beautify: false,
    }));

    app.set('view engine', 'hbs');
    app.set('views', path.join(ROOT_PATH, config.server.http.viewsDir));

};
module.exports.cookieParser = (app, g) => {
    let cookieParser = require('cookie-parser');
    app.use(cookieParser());
    g.cookieParser = cookieParser;
};
module.exports.bodyParser = (app, g) => {
    let bodyParser = require('body-parser');
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    g.bodyParser = bodyParser;
};
module.exports.session = (app, g) => {
    let session = require('express-session');
    let MemcachedStore = require('connect-memcached')(session);
    g.sessionStore = new MemcachedStore({
        // hosts: ['127.0.0.1:11211'],
        // secret: '123, easy as ABC. ABC, easy as 123' // Optionally use transparent encryption for memcache session data
    });
    g.sessionOptions = {
        key:    process.env.SESSION_KEY || 'express.sid',
        secret: process.env.SESSION_SECRET || 'sessionSecret',
        store:  g.sessionStore,
        saveUninitialized: true,
        resave: true
    };
    g.session = session({
        store: g.sessionStore,
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.ENVIRONMENT !== 'development' && process.env.ENVIRONMENT !== 'test',
            maxAge: 2419200000
        },
        secret: 'secret'
    });
    app.use(g.session);
};
module.exports.afterSession = (app, g) => {};