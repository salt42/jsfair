/**
 * Created by salt on 20.09.2017.
 */
"use strict";

var fs = require("fs");
var beautify = require('js-beautify').js_beautify;
var confPath = "";
var conf = {};
var defaults = {
    appName: "jsFair",
    server: {
        modulePaths: ["/server/routes"],
        http: {
            port: 666,
            staticDirs: ["/client"],
            viewsDir: "/views",
        },
        database: {
            dbFile: "/testData.db",
            sqlPath: "/sql",
            sqCache: false,
        }
    },
    client: {
        defaultModules: [],
        defaultComponent: ["sections"],
        modulePaths: ["/server/routes"],
        componentPaths: ["/client/component"],
    },
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
    conf = {};
    Object.assign(conf, defaults, content);
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
    save();
    process.exit();
}

//do something when app is closing
process.on('exit', exitHandler.bind(null,{cleanup:true}));
//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));
//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit:true}));