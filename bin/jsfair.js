#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

//search config file
let workingPath = process.cwd();
let confPath = path.join(workingPath, "conf.json");
if (!fs.existsSync(confPath)) {
    // Do something
    console.log("Config file not found.");
    return;
}
require("../devShell")(workingPath);
