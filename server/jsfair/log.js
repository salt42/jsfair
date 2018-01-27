/**
 * Created by salt on 20.09.2017.
 */
"use strict";

var util = require('util');
module.exports = function(moduleName) {
    let logger = function(...args) {
        let msg = util.format(...args);
        process.stdout.write(util.format("[%s]".magenta + " %s\n", moduleName, msg) );
    };
    logger.error = function(...args) {
        let msg = util.format(...args);
        process.stdout.write(util.format("[%s]".red + " %s\n", moduleName, msg) );
    };
    logger.warn = function(...args) {
        let msg = util.format(...args);
        process.stdout.write(util.format("[%s]".yellow + " %s\n", moduleName, msg) );
    };
    logger.info = function(...args) {
        let msg = util.format(...args);
        process.stdout.write(util.format("[%s] %s\n", moduleName, msg));
    };
    return logger;
};
