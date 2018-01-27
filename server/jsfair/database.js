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
function runStatement(name, opt = {}, select = null) {
    let statements = getStatement(name);
    let parts = statements.split("--#");
    let result = [];
    for(let i = 0; i < parts.length; i++) {
        if (!parts[i]) continue;
        if (select && select.indexOf(i) > 0) continue;

    //
        let func = parts[i].split(/\r?\n/)[0],   //.slice(0, parts[i].indexOf("\n")),
            statement = parts[i].slice(func.length)
                .replace(/[\n\r]/g, " ")
                .replace(/[\t]/g, " ")
                .trim();

        func = func.replace((/  |\r\n|\n|\r/gm),"");
        statement = statement.replace((/  |\r\n|\n|\r/gm),"");
        statement = statement.replace(/!\w*/, function(a, b){
            a = a.substr(1);
            return a;
        });
        let result = [];
        try {
            let stm = DB.prepare(statement);
            result = stm[func].call(stm, opt);
        }catch (e) {
            log.error("runStatement %s from %s.sql  '%s'", i, name, statement);
            log.error("statement variables: ", opt);
            console.log(e);
        }
        result.push(result);
    }
    return result;
}
function init() {
    log.info("Init");
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
    //aber die DB.prepare müssenw ir einbauen
    select(statement, option = {}) {
        console.log("jsfair/database.js: ", option);
        return DB.prepare(statement).all(option);
    }
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