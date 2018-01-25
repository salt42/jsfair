"use strict";

module.paths.push(__dirname + "/server");
process.env.NODE_PATH = __dirname + "/server";
require('module').Module._initPaths();

process.on('uncaughtException', function (err) {
    console.log(err);
});
const DEV_MODE= (process.argv.indexOf('--dev') > -1)? true: false;
const colors  = require('colors');
const fs      = require("fs");
const log     = require('jsfair/log')('main');
const hook    = require('./server/hook');
let rootPath = "";
let hookProxyHandler = {
    get: function(target, name) {
        return function(...args) {
            if (args.length < 1) {
                throw new Error("Hook '" + name + "' not enough arguments -> (" + args.length + ")");
            }
            let func = args.splice(-1,1)[0];
            hook.in(name, args, func);
        }
    }
};
global.hookIn = new Proxy({}, hookProxyHandler);
global.ROOT_PATH = fs.realpathSync(rootPath);
global.jsfairPath = fs.realpathSync(__dirname);

//handle arguments
function helpPage(err) {
    console.log("Error: %s".red, err);
    console.log("Usage: node main.js --root ../pathToProjectFolder [arguments]");
}
if (process.argv.indexOf('--root') > -1) {
    rootPath = process.argv[process.argv.indexOf('--root') + 1];
    if (rootPath === "") {
        helpPage("can't start without root path!");
        return;
    }
} else {
    helpPage("can't start without root path!");
    return;
}

const conf = require('jsfair/config')(rootPath + "/conf.json");
const browser = require("./server/browserBridge");
//dev mode
if (DEV_MODE) {
    log("load browser bridge");
    //stdin
    process.on('message', message => {
        if (!message.hasOwnProperty("com")) return;
        switch(message.com) {
            case "refreshClients":
                try {
                    browser.reload();
                } catch (e) {
                    console.log(e);
                }

                break;
        }
    });
}

try {
    let db = require("jsfair/database");
    let express = require("./server/express");
    log("Start %s Server", conf.appName);
    try {
        //@todo if conf.client.defaultComponent.length > 0 then load this modules
        for (let x = 0; x < conf.server.modulePaths.length; x++) {
            let loadPath = fs.realpathSync(rootPath + "/" + conf.server.modulePaths[x]);
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
    browser.init();

} catch (e) {
    console.log(e);
}
