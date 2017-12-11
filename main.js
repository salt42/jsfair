/**
 * Created by salt on 28.10.2017.
 */
"use strict";
let fs      = require("fs");
let colors  = require('colors');
let log     = require('./server/log')('main');
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
    let conf    = require('./server/config')(rootPath + "/conf.json");
    log("Start %s Server", conf.appName);
    try {
        for(let x = 0; x < conf.modulePaths.length; x++) {
            let loadPath = fs.realpathSync(rootPath + "/" + conf.modulePaths[x]);
            let dir = fs.readdirSync(loadPath);
            for (let i = 0; i < dir.length; i++) {
                // try {
                require(loadPath + "/" + dir[i]);
                // } catch(e) {
                //     log("can't load module: '"+ loadPath + "/" + dir[i] +"'  " + e.message.red);
                // }
            }
        }
        require('./server/express.js');
    } catch(e) {
        log(e.message.red);
        console.log(e);
    }
};