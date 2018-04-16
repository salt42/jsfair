/**
 * Created by salt on 20.09.2017.
 */
"use strict";
const C         = require('chalk');
const util      = require('util');
const Reset     = "\x1b[0m";
const Bright    = "\x1b[1m";
const Dim       = "\x1b[2m";
const Underscore= "\x1b[4m";
const Blink     = "\x1b[5m";
const Reverse   = "\x1b[7m";
const Hidden    = "\x1b[8m";

const FgBlack   = "\x1b[30m";
const FgRed     = "\x1b[31m";
const FgGreen   = "\x1b[32m";
const FgYellow  = "\x1b[33m";
const FgBlue    = "\x1b[34m";
const FgMagenta = "\x1b[35m";
const FgCyan    = "\x1b[36m";
const FgWhite   = "\x1b[37m";

const BgBlack   = "\x1b[40m";
const BgRed     = "\x1b[41m";
const BgGreen   = "\x1b[42m";
const BgYellow  = "\x1b[43m";
const BgBlue    = "\x1b[44m";
const BgMagenta = "\x1b[45m";
const BgCyan    = "\x1b[46m";
const BgWhite   = "\x1b[47m";

let loggers = {};
module.exports = function(name, debug = false) {
    if (loggers.hasOwnProperty(name)) return loggers[name];
    let logger = function(...args) {
        if (!logger.debug) return;
        let msg = util.format(...args);
        process.stdout.write(util.format(FgMagenta + "[%s]" + Reset +" %s\n", name, msg) );
    };
    logger.debug = debug;
    logger.error = function(...args) {
        let msg = util.format(...args);
        process.stdout.write(util.format(FgRed + "[%s]" + Reset +" %s\n", name, msg) );
    };
    logger.warn = function(...args) {
        let msg = util.format(...args);
        process.stdout.write(util.format(FgYellow + "[%s]" + Reset +" %s\n", name, msg) );
    };
    logger.info = function(...args) {
        let msg = util.format(...args);
        process.stdout.write(util.format(FgBlue + "[%s]" + Reset +" %s\n", name, msg) );
    };
    return logger;
};