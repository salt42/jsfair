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
        jquery: ["/jsfair/libsmin.js", "/jsfair/jsfair.js"],
        coreModules: {
        },
        coreComponents: {
            section:    true,
        },
        modulePaths: ["/server/routes"],
        componentPaths: ["/client/component"],
        preCss: [],
        postCss: [],
        preScript: [],
        postScript: []
    },
    registerConfig(newConf) {
        defaults = merge(defaults, newConf);
        conf = merge(conf, newConf);
        save();
    }
};

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
    conf = merge(defaults, content);
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