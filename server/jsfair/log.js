/**
 * Created by salt on 20.09.2017.
 */
"use strict";

var util = require('util');
module.exports = function(moduleName) {
    let logger = function(...args) {
        let msg = util.format(...args);
        // process.stdout.write(a.toString());
        console.log("[%s]".magenta + " %s", moduleName, msg);
    };
    logger.error = function(...args) {
        let msg = util.format(...args);
        // process.stdout.write(a.toString());
        console.log("[%s]".red + " %s", moduleName, msg);
    };
    logger.warn = function(...args) {
        let msg = util.format(...args);
        // process.stdout.write(a.toString());
        console.log("[%s]".yellow + " %s", moduleName, msg);
    };
    logger.info = function(...args) {
        let msg = util.format(...args);
        // process.stdout.write(a.toString());
        console.log("[%s] %s", moduleName, msg);
    };
    return logger;
};
