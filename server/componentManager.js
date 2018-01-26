"use strict";
var core    = require ('jsfair/coreAddOns');
var config  = require('jsfair/config');
var log     = require('jsfair/log')("compManager".yellow);
let fs      = require("fs");
let Path    = require("path");

let items = {
    clientComponents: [],
    clientModules: [],
    clientPreCss: [],
    clientPostCss: [],
    clientPreScript: [],
    clientPostScript: [],
    clientCoreModules: [],
    clientCoreComponents: []
};

// config.registerConfig({
//     client: {
//         deinValue: "default value"
//     }
// });

function  run() {
    /* region create header tags pre section */
    let a;
    a = config.client.coreModules;
    for (let coreItem in a){
        if (a.hasOwnProperty(coreItem) && a[coreItem] === true){
            let cJs  = Path.join(jsfairPath, core.client.components[coreItem].js );
            items.clientCoreModules.push({
                type:    "module",
                section: "core",
                name:    coreItem,
                js:      (cJs  === "" || cJs  === null) ? null : cJs,
                css:     null,
                html:    null,
            });
        }
    }
    a = config.client.coreComponents;
    for (let coreItem in a){
        if (a.hasOwnProperty(coreItem) && a[coreItem] === true){
            let cJs  = Path.join(jsfairPath, core.client.components[coreItem].js );
            let cCss = Path.join(jsfairPath, core.client.components[coreItem].css);
            items.clientCoreComponents.push({
                type:    "module",
                section: "core",
                name:    coreItem,
                js:      (cJs  === "" || cJs  === null) ? null : cJs,
                css:     (cCss === "" || cCss === null) ? null : cCss,
                html:    null,
            });
        }
    }
    a = config.client.preCss;
    if (a.length > 0){
        for(let i = 0; i < a.length; i++){
            items.clientPreCss.push({
                type:    "css",
                section: "pre",
                name:    Path.basename(a[i], ".css"),
                js:      null,
                css:     a[i],
                html:    null,
            });
        }
    }
    a = config.client.preScript;
    if (a.length > 0){
        for(let i = 0; i < a.length; i++){
            items.clientPreScript.push({
                type:    "js",
                section: "pre",
                name:    Path.basename(a[i], ".js"),
                js:      a[i],
                css:     null,
                html:    null,
            });
        }
    }
    /*endregion*/

    /* region create header tags post section */
    a = config.client.postCss;
    if (a.length > 0){
        for(let i = 0; i < a.length; i++){
            items.clientPostCss.push({
                type:    "css",
                section: "post",
                name:    Path.basename(a[i], ".css"),
                js:      null,
                css:     a[i],
                html:    null,
            });
        }
    }
    a = config.client.postScript;
    if (a.length > 0){
        for(let i = 0; i < a.length; i++){
            items.clientPostScript.push({
                type:    "js",
                section: "post",
                name:    Path.basename(a[i], ".js"),
                js:      a[i],
                css:     null,
                html:    null,
            });
        }
    }
    /*endregion*/

    /* region gather data of components and modules */
    a = config.client.componentPaths;
    if (a.length > 0) {
        for (let i = 0; i < a.length; i++) {
            searchComponents(a[i]);
        }
    }
    a = config.client.modulePaths;
    if (a.length > 0) {
        for (let i = 0; i < a.length; i++) {
            searchModules(a[i]);
        }
    }
    /*endregion*/
}

/* region auxiliaries */
function createRelativePath(path){
    let staticDirs = config.server.http.staticDirs;
    path = path
        .replace(ROOT_PATH, "")
        .replace(/\\/g,"/");
    for (let i = 0; i < staticDirs.length; i++){
        staticDirs[i] = staticDirs[i].replace(/\\/g,"/");
        if (path.indexOf(staticDirs[i]) !== -1){
            return path.replace(staticDirs[i], "");
        }
    }
    return path;
}
/*endregion*/

/* region auto read components */
function readCompDirectory(name, path) {
    let noExt = Path.join(path, name);
    let scriptPath = noExt + ".js";
    if (!fs.existsSync(scriptPath)) return null;
    return {
        type:    "component",
        section: "common",
        name:    name,
        js:      createRelativePath(scriptPath),
        css:     (fs.existsSync(noExt + ".css" )) ? noExt + ".css"  : null,
        html:    (fs.existsSync(noExt + ".html")) ? noExt + ".html" : null,
    };
}
function searchComponents(relPath) {
    let path = ROOT_PATH + relPath;
    let comps = [];
    if (!fs.existsSync(path))return;
    let dir = fs.readdirSync(path);// Returns an array of filenames excluding '.' and '..'.
    for (let i = 0; i < dir.length; i++) {
        let fullPath = Path.join(path, dir[i]);
        if (fs.statSync(fullPath).isDirectory()){
            let a = readCompDirectory(dir[i], fullPath);
            if (a !== null) {
                items.clientComponents.push(a);
            }
        } else {
            items.clientComponents.push({
                type:    "component",
                section: "common",
                name:    Path.basename(fullPath, ".js"),
                js:      createRelativePath(fullPath),
                css:     null,
                html:    null,
            });
        }
    }
}
/*endregion*/

/* region auto read modules */
function readModuleDirectory(name, path) {
    let scriptPath = path + "/" + name + ".js";

    if (!fs.existsSync(scriptPath)) return null;
    let dir = fs.readdirSync(path);
    for (let i = 0; i < dir.length; i++) {
        if (name + ".js" === dir[i]) {
            // module.js
            items.clientModules.push({
                type:    "module",
                section: "common",
                name:    name,
                js:      createRelativePath(scriptPath),
                css:     null,
                html:    null,
            });
        } else {
            let subDir = Path.join(path, dir[i]);
            if (!fs.statSync(subDir).isDirectory()) {
                // sub_module.js
                items.clientModules.push({
                    type:    "module",
                    section: "common",
                    name:    Path.basename(subDir, ".js"),
                    js:      createRelativePath(subDir),
                    css:     null,
                    html:    null,
                });
            } else {
                if (dir[i] == "component" || dir[i] == "components") {
                    let relSubDir = subDir.replace(ROOT_PATH, "");
                    searchComponents(relSubDir);
                }
            }
        }
    }
}
function searchModules(relPath) {
    let path = ROOT_PATH + relPath;
    if (!fs.existsSync(path))return null;
    let dir = fs.readdirSync(path);// array of filenames
    let submodule = {
        modules: [],
        components: [],
    };
    for (let i = 0; i < dir.length; i++) {
        if (dir[i] === "exampleWidget") continue; // skip example
        let fullPath = Path.join(path, dir[i]);
        if (!fs.statSync(fullPath).isDirectory() && Path.extname(fullPath) === ".js" ){
            //module name
            items.clientModules.push({
                type:    "module",
                section: "common",
                name:    Path.basename(fullPath, ".js"),
                js:      createRelativePath(fullPath),
                css:     null,
                html:    null,
            });
        } else {
            submodule = readModuleDirectory(dir[i], fullPath);
            if (submodule !== null) {
                items.clientModules    = items.clientModules.concat(submodule.modules);
                items.clientComponents = items.clientComponents.concat(submodule.components);
            }
        }
    }
}
/*endregion*/

hookIn.systemReady(() => {
    log("Search Components");
    run();
});


function makeIterator(type, valueType) {
    let nextIndex = 0;
    let array = items[type];

    return {
        next: function () {
            if (nextIndex < array.length) {
                if (valueType) {
                    return {value: array[nextIndex++][valueType], done: false};
                } else {
                    return {value: array[nextIndex++], done: false};
                }
            } else {
                return {done: true};
            }
        }
    }
}

for (let path of makeIterator("clientComponents", path)) {

}
module.exports = {
    items: items,
    getIterator: makeIterator,
};
