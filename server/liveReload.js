"use_strict"
const log = require("jsfair/log")("liveReload");

if (!DEV_MODE) {
    log.error("Only in dev mode!");
    return;
}

module.exports = {};