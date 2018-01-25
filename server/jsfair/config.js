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
        defaultModules: [],
        defaultComponents: [],
        modulePaths: [],
        componentPaths: [],
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

/*

    defaults.registerConfig({client:{test:42} });
* */
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
function merge2(target, conf) {
    let prop;
    for (prop in conf) {
        if (prop in target && Array.isArray( target[ prop ] ) ) {
            // Concat Arrays
            target[ prop ] = target[ prop ].concat( conf[ prop ] );
        } else if (prop in target && typeof target[ prop ] === "object" ) {
            // Merge Objects
            target[ prop ] = merge2(target[prop], conf[prop]);
        } else {
            // Set new values
            target[ prop ] = conf[ prop ];
        }
    }
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