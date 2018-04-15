/**
 * Created by salt on 20.09.2017.
 */
"use strict";

const fs = require("fs");
const beautify = require('js-beautify').js_beautify;
const merge = require('deepmerge');

let confPath = "";
let conf = {};
let defaults = {
    appName: "jsFair",
    server: {
        modulePaths: [],
        database: {
            dbFile: "/testData.db",
            sqlPath: "/sql",
            sqCache: false,
        }
    },
    client: {
        coreModules: {},
        coreComponents: {
            section: true,
        },
        preCss: [],
        postCss: [],
        preScript: [],
        postScript: []
    },
    registerConfig(newConf) {
        defaults = merge(defaults, newConf, { arrayMerge: overwriteMerge });
        conf = merge(defaults, conf, { arrayMerge: overwriteMerge });
        saveConfig();
    },
    save(overwrite) {
        if (overwrite) {
            conf = merge(conf, overwrite, { arrayMerge: overwriteMerge });
        }
        console.log("do save");
        console.log(conf);
        saveConfig();
    }
};
function overwriteMerge(destinationArray, sourceArray, options) {
    for (let i = 0; i < sourceArray.length; i++) {
        if (destinationArray.indexOf(sourceArray[i]) < 0 ) destinationArray.push(sourceArray[i]);
    }
    return destinationArray
}
module.exports = function(path) {
    load(path);
    module.exports = conf;
    return conf;
};
function checkConfFile() {
    if (!fs.existsSync(confPath)) {
        fs.writeFileSync(confPath, JSON.stringify(defaults));
    }
}
function load(path) {
    confPath = path;
    checkConfFile();
    let content = fs.readFileSync(path);
    content = JSON.parse(content);
    conf = merge(defaults, content, { arrayMerge: overwriteMerge });
    saveConfig();
}
function saveConfig() {
    checkConfFile();
    fs.writeFileSync(confPath,
        beautify(JSON.stringify(conf), {
            indent_size: 4
        })
    );
}