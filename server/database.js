/**
 * Created by salt on 28.10.2017.
 */
"use strict";

var log = require('./log')("Database");
var fs = require('fs');
var Database = require('better-sqlite3');
var config = require('./config');
var DB = new Database(__dirname + config.dbFile, {});


module.exports = {
    getUser(id) {
        var row = DB.prepare('SELECT * FROM users WHERE "id"=?').get(id);
        return row;
    },
    getAllUsers() {
        return DB.prepare('SELECT * FROM users').get();
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