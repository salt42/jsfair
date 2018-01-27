"use_strict"
const log = require("jsfair/log")("liveReload");
const chokidar = require('chokidar');
if (!DEV_MODE) {
    log.error("Only in dev mode!");
    return;
}

module.exports = {};
module.exports.startWatch = function() {

};
module.exports.stopWatch = function() {

};