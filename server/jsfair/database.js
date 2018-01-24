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

let dbFilePath  = path.join(ROOT_PATH, config.server.database.dbFile);
let sqlPath     = path.join(ROOT_PATH, config.server.database.sqlPath);
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
        let path = sqlPath + "/" + name + ".sql";
        if (fs.existsSync(path)) {
            query = fs.readFileSync(path).toString();
            if(sqlCache) {
                sqlQueryRegistry.set(name, query);
            }
            return query;
        } else {
            throw new Error("sql sql file '"+ name +"' not found at: " + path);
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
// DB.prepare('select * from ' + table).all({})
function init() {
    log("Init");
    hook.trigger("db_prepare", DB);
    // hook.getTrigger("db_addMethod", function(trigger, args) {
    //     if (!args || !args[0]) {
    //         log("ERROR: No method name provided");
    //         return;
    //     }
    //     dbMethods[args[0]] = trigger(DB);
    // });
    // hook.getTrigger("db_addObject", function(trigger, args) {
    //     if (!args || !args[0]) {
    //         log("ERROR: No object name provided");
    //         return;
    //     }
    //     dbMethods[args[0]] = trigger(DB);
    // });
}

module.exports = {
    init: init,
    runStatement: runStatement,
    getStatement: getStatement,
};

function exitHandler(options, err) {
    DB.close();
}
//do something when app is closing
process.on('exit', exitHandler);
//catches ctrl+c event
process.on('SIGINT', exitHandler);
//catches uncaught exceptions
process.on('uncaughtException', exitHandler);