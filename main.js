"use strict";
/* region hacks */
module.paths.push(__dirname + "/server");
process.env.NODE_PATH = __dirname + "/server";
require('module').Module._initPaths();
process.stdout.setEncoding( 'utf8' );
process.on('uncaughtException', function (err) {
    console.log(err);
});
/*endregion*/
/* region read console arguments */
//handle arguments
let rootPath = "";
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
const DEV_MODE= (process.argv.indexOf('--dev') > -1);
const DEV_MODE_INSPECTOR= (process.argv.indexOf('--inspect') > -1);
/* endregion*/
const colors  = require('colors');
const fs      = require("fs");
const log     = require('jsfair/log')('#', false);
const hook    = require('jsfair/hook');

/* region hookSystem */
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
/* endregion */

global.DEV_MODE= (process.argv.indexOf('--dev') > -1);
global.hookIn = new Proxy({}, hookProxyHandler);
global.ROOT_PATH = fs.realpathSync(rootPath);
global.jsfairPath = fs.realpathSync(__dirname);
const conf = require('jsfair/config')(rootPath + "/conf.json");
const compMan = require('./server/componentManager');
const autoHeader = require("./server/autoHeader");

/* region dev mode */
//dev mode
if (DEV_MODE) {
    if (DEV_MODE_INSPECTOR) {
        let wait = process.argv.indexOf('--inspectWait') > -1;
        const inspector = require('inspector');
        // let aa = new inspector.Session();
        if (wait) log.warn("waiting on inspector connection".yellow);
        inspector.open(null, null, wait);
    }
    //inject js for browser bride
    conf.client.preScript.push("/jsfair/browserBridge.js");
    //stdin
    process.on('message', message => {
        if (!message.hasOwnProperty("com")) return;
        switch(message.com) {
            case "refreshClients":
                try {
                    compMan.reload();
                    autoHeader.reload();
                } catch (e) {
                }
                break;
            // case "startInspector":
            //     try {
            //         // browser.reload();
            //     } catch (e) {
            //         console.log(e);
            //     }
            //     break;
        }
    });
}

/* endregion */
//so und hier werden einfach alle server module geladen und dannach fehlt noch der init hook
try {
    log.info("Starting %s Server", conf.appName);
    let db = require("jsfair/database");
    let express = require("jsfair/express");
    try {
        //@todo load server modules -> from componentManager->getActiveServerModuleIDs
        for (let x = 0; x < conf.server.modulePaths.length; x++) {
            let loadPath = fs.realpathSync(rootPath + "/" + conf.server.modulePaths[x]);
            let dir = fs.readdirSync(loadPath);
            for (let i = 0; i < dir.length; i++) {
                let error = false;
                try {
                    require(loadPath + "/" + dir[i]);
                } catch(e) {
                    error = true;
                    let Log = require('jsfair/log')(dir[i]);
                    if (!e.stack) {
                        Log.error("%s", e.toString().red);
                    } else {
                        Log.error("Error in module: %s (%s)".red, dir[i].yellow, loadPath);
                        if (e.stack)
                            Log.error("%s", e.stack.red);
                    }
                }
                if (!error) {
                    log("Module loaded: %s", dir[i].green);
                }
            }
        }
    } catch (e) {
        log.error(e.message.red);
        console.log(e);
    }
    db.init(); //use init hook
    express.init();//use init hook
    // browser.init();//use init hook
    //@todo add init hook
    hook.trigger("systemReady");
} catch (e) {
    log.error(e);
    log.info("Restart with 'W', Quit with 'Q'");
}
