#!/usr/bin/env node --use_strict
let fs = require("fs");
require('../main.js')(fs.realpathSync(__dirname + "/../test"));
