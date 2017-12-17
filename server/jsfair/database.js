/**
 * Created by salt on 28.10.2017.
 */
"use strict";

let log         = require('./log')("Database");
let hook        = require('./hook');
let fs          = require('fs');
let path        = require('path');
let Database    = require('better-sqlite3');
let config      = require('./config');

let dbFilePath          = path.join(rootPath, config.dbFile);
if (!fs.existsSync(dbFilePath)) {
    throw new Error("no database file: " + dbFilePath);
}
let DB                  = new Database(dbFilePath, {});
let sqlQueryRegistry    = new Map();
let dbMethods           = {};


function init() {
    log("Init");
    hook.trigger("db_prepare", DB);
    hook.getTrigger("db_addMethod", function(trigger, args) {
        if (!args || !args[0]) {
            log("ERROR: No method name provided");
            console.trace();
            return;
        }
        dbMethods[args[0]] = trigger(DB);
    });
}

module.exports = new Proxy({}, {
    get: function(target, name) {
        return function(...args) {
            if (name === "init") return init(...args);
            if (dbMethods.hasOwnProperty(name) && typeof dbMethods[name] === "function") {
                return dbMethods[name].call(dbMethods, ...args);
            } else {
                let e = new Error(("No function registered with name: " + name).red);
                log(e.stack);
            }
        }
    }
});

function exitHandler(options, err) {
    DB.close();
}
//do something when app is closing
process.on('exit', exitHandler);
//catches ctrl+c event
process.on('SIGINT', exitHandler);
//catches uncaught exceptions
process.on('uncaughtException', exitHandler);