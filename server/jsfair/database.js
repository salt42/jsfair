/**
 * Created by salt on 28.10.2017.
 */
"use strict";

let log         = require('./log')("Database");
let hook        = require('../hook');
let fs          = require('fs');
let path        = require('path');
let Database    = require('better-sqlite3');
let config      = require('./config');

let dbFilePath  = path.join(rootPath, config.server.database.dbFile);
let sqlPath     = path.join(rootPath, config.server.database.sqlPath);
let sqlCache    = config.server.database.sqCache;
if (!fs.existsSync(dbFilePath)) {
    throw new Error("no database file: " + dbFilePath);
}
let DB                  = new Database(dbFilePath, {});
let sqlQueryRegistry    = new Map();
let dbMethods           = {};




function getStatement(name) {
    let query;

    if (!sqlQueryRegistry.has(name)) {
        //load query from file
        let path = sqlPath + name + ".sql";
        if (fs.existsSync(path)) {
            query = fs.readFileSync(path).toString();
            if(sqlCache) {
                sqlQueryRegistry.set(name, query);
            }
            return query;
        } else {
            throw new Error("sql sql file '"+ name +"' not found!");
        }
    } else {
        return sqlQueryRegistry.get(name);
    }
}
function runStatement(name, opt = {}) {
    let statements = getStatement(name);
    let parts = statements.split("--#");
    let result = [];
    for(let i = 0; i < parts.length; i++) {
        if (!parts[i]) continue;

        let func = parts[i].slice(0, parts[i].indexOf("\r\n")),
            statement = parts[i].slice(parts[i].indexOf("\r\n") + 2)
                .replace(/[\n\r]/g, " ")
                .replace(/[\t]/g, " ")
                .trim();

        let stm = DB.prepare(statement);
        let r = stm[func].call(stm, opt);
        result.push(r);
    }
    return result;
}

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
    hook.getTrigger("db_addObject", function(trigger, args) {
        if (!args || !args[0]) {
            log("ERROR: No object name provided");
            console.trace();
            return;
        }
        dbMethods[args[0]] = trigger(DB);
    });
}

module.exports = new Proxy({}, {
    get: function(target, name) {
        if (name === "init") return init;
        if (name === "runStatement") return runStatement;
        if (dbMethods.hasOwnProperty(name) && typeof dbMethods[name] === "object") {
            return dbMethods[name];
        }
        return function(...args) {
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