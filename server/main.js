/**
 * Created by salt on 28.10.2017.
 */
"use strict";
var fs      = require("fs");
var colors  = require('colors');
var log     = require('./log')('main');
var hook    = require('./hook');

global.jsfairPath = fs.realpathSync(__dirname + "/../");
var conf    = require('./config')(jsfairPath + "/conf.json");
log("Start %s Server", conf.appName);

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
global.hookIn = new Proxy({}, hookProxyHandler);;

try {
    for(let x = 0; x < conf.modulePaths.length; x++) {
        let loadPath = fs.realpathSync(conf.modulePaths);
        let dir = fs.readdirSync(loadPath);
        for (let i = 0; i < dir.length; i++) {
            // try {
            require(loadPath + "/" + dir[i]);
            // } catch(e) {
            //     log("can't load module: '"+ loadPath + "/" + dir[i] +"'  " + e.message.red);
            // }
        }
    }
    require('./express.js');
} catch(e) {
    log(e.message.red);
    console.log(e);
}