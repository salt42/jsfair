/**
 * Created by salt on 20.09.2017.
 */
"use strict";

var util = require('util');
module.exports = function(moduleName) {
    return function(...args) {
        let msg = util.format(...args);
        let a = `[${moduleName}] ${msg}`;

        // process.stdout.write(a.toString());
        console.log(`[${moduleName}] ${msg}`);
    }
};