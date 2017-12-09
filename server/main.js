/**
 * Created by salt on 28.10.2017.
 */
"use strict";


var colors = require('colors');
var log = require('./log')('main');
log("Start Helping Hands Server");
try {
    require('./config')(__dirname + "/../conf.json");
    require('./express.js');
} catch(e) {
    log(e.message.red);
    console.log(e);
}
