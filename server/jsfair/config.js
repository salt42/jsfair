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
        http: {
            port: 666,
            staticDirs: [],
            viewsDir: "/views",
        },
        database: {
            dbFile: "/testData.db",
            sqlPath: "/sql",
            sqCache: false,
        }
    },
    client: {
        coreModules: {},
        coreComponents: {
            section:    true,
        },
        preCss: [],
        postCss: [],
        preScript: [],
        postScript: []
    },
    registerConfig(newConf) {
        defaults = merge(defaults, newConf, { arrayMerge: overwriteMerge });
        conf = merge(conf, newConf, { arrayMerge: overwriteMerge });
        save();
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
    save();
}
function save() {
    checkConfFile();
    fs.writeFileSync(confPath,
        beautify(JSON.stringify(conf), {
            indent_size: 4
        })
    );
}

function exitHandler(options, err) {
    process.exit();
}

//do something when app is closing
process.on('exit', exitHandler.bind(null,{cleanup:true}));
//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));
//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit:true}));