/**
 * Created by salt on 28.10.2017.
 */
"use strict";

var fs = require("fs");
var colors = require('colors');
global.jsfairPath = fs.realpathSync(__dirname + "/../");
var log = require('./log')('main');
log("Start Helping Hands Server");
try {
    require('./config')(jsfairPath + "/conf.json");
    require('./express.js');
} catch(e) {
    log(e.message.red);
    console.log(e);
}
