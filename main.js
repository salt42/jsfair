"use strict";

module.paths.push(__dirname + "/server");
process.env.NODE_PATH = __dirname + "/server";
require('module').Module._initPaths();

let fs      = require("fs");
let colors  = require('colors');
let log     = require('jsfair/log')('main');
let hook    = require('./server/hook');

let hookProxyHandler = {
    get: function(target, name) {
        return function(...args) {
            if (args.length < 2) {
                throw new Error("At least give me a function, please!");
            }
            let func = args.splice(-1,1)[0];
            hook.in(name, args, func);
        }
    }
};

module.exports = function(rootPath) {
    global.hookIn = new Proxy({}, hookProxyHandler);
    global.rootPath = fs.realpathSync(rootPath);
    global.jsfairPath = fs.realpathSync(__dirname);
    try {
        let conf = require('jsfair/config')(rootPath + "/conf.json");
        let db = require("jsfair/database");
        let express = require("./server/express");
        log("Start %s Server", conf.appName);
        try {
            for (let x = 0; x < conf.modulePaths.length; x++) {
                let loadPath = fs.realpathSync(rootPath + "/" + conf.modulePaths[x]);
                let dir = fs.readdirSync(loadPath);
                for (let i = 0; i < dir.length; i++) {
                    let error = false;
                    try {
                        require(loadPath + "/" + dir[i]);
                    } catch(e) {
                        error = true;
                        log("Error in module: %s (%s)".red, dir[i].yellow, loadPath);
                        // log("%s",  e.message.red);
                        log("%s",  e.stack.red);
                    }
                    if (!error) {
                        log("Module loaded: %s", dir[i].green);
                    }
                }
            }
        } catch (e) {
            log(e.message.red);
            console.log(e);
        }
        db.init();
        express.init();
    } catch (e) {
        console.log(e);
    }
};