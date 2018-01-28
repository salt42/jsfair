"use strict";
const core    = require ('jsfair/coreAddOns');
const config  = require('jsfair/config');
const log     = require('jsfair/log')("compManager".yellow);
const fs      = require("fs");
const Path    = require("path");

let devMock = false;

let items = {
    clientCoreModules: [],
    clientCoreComponents: [],
    clientPreScript: [],
    clientPreCss: [],
    clientComponents: [],
    clientModules: [],
    clientPostCss: [],
    clientPostScript: [],
};
let inactiveItems = {
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
            items.clientCoreModules.push({
                type:    "client::core::module",
                name:    coreItem,
                js:      core.client.components[coreItem].js,
                css:     null,
                html:    null,
            });
        }
        if (a.hasOwnProperty(coreItem) && a[coreItem] === false){
            inactiveItems.clientCoreModules.push({
                type:    "client::core::module",
                name:    coreItem,
                js:      core.client.components[coreItem].js,
                css:     null,
                html:    null,
            });
        }
    }
    a = config.client.coreComponents;
    for (let coreItem in a){
        if (a.hasOwnProperty(coreItem) && a[coreItem] === true){
            let cCss = core.client.components[coreItem].css;
            items.clientCoreComponents.push({
                type:    "client::core::component",
                name:    coreItem,
                js:      core.client.components[coreItem].js,
                css:     (cCss === null || cCss ==="") ? null : cCss,
                html:    null,
            });
        }
        if (a.hasOwnProperty(coreItem) && a[coreItem] === false){
            let cCss = core.client.components[coreItem].css;
            inactiveItems.clientCoreComponents.push({
                type:    "client::core::component",
                name:    coreItem,
                js:      core.client.components[coreItem].js,
                css:     (cCss === null || cCss ==="") ? null : cCss,
                html:    null,
            });
        }
    }
    a = config.client.preCss;
    if (a.length > 0){
        for(let i = 0; i < a.length; i++){
            items.clientPreCss.push({
                type:    "client::pre::css",
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
                type:    "client::pre::script",
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
                type:    "client::post::css",
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
                type:    "client::post::script",
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
function createAbsolutePath(relPath) {
    let a = config.server.http.staticDirs;
    let result;
    for (let i = 0; i < a.length; i++){
        let b = Path.join(ROOT_PATH, a[i], relPath);
        //@strange des geht nich, da läuft die schleife weiter :) trotz des return's
        // if (fs.existsSync(b)) return  b;
        if (fs.existsSync(b)) {
            result = b;
            break;
        }
    }
    return result;
}
/*endregion*/

/* region auto read components */
function readCompDirectory(name, path) {
    let noExt = Path.join(path, name);
    let scriptPath = noExt + ".js";
    if (!fs.existsSync(scriptPath)) throw new Error("Component path " +path+ " doesn't exist");
    items.clientComponents.push({
        type:    "client::common::component",
        name:    name,
        js:      createRelativePath(scriptPath),
        css:     (fs.existsSync(noExt + ".css" )) ? createRelativePath(noExt + ".css")  : null,
        html:    (fs.existsSync(noExt + ".html")) ? createRelativePath(noExt + ".html") : null,
    });
}
function searchComponents(relPath) {
    let path = createAbsolutePath(relPath);
    if (path === null)throw new Error("Component path " +path+ " doesn't exist");
    let dir = fs.readdirSync(path);// Returns an array of filenames excluding '.' and '..'.
    for (let i = 0; i < dir.length; i++) {
        let fullPath = Path.join(path, dir[i]);
        if (fs.statSync(fullPath).isDirectory()){
            readCompDirectory(dir[i], fullPath);
        } else {
            items.clientComponents.push({
                type:    "client::common::component",
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
                type:    "client::common::module",
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
                    type:    "client::common::module",
                    name:    Path.basename(subDir, ".js"),
                    js:      createRelativePath(subDir),
                    css:     null,
                    html:    null,
                });
            } else {
                if (dir[i] === "component" || dir[i] === "components") {
                    let relSubDir = subDir.replace(ROOT_PATH, "");
                    searchComponents(relSubDir);
                }
            }
        }
    }
}
function searchModules(relPath) {
    let path = createAbsolutePath(relPath);
    if (typeof path !== "string")throw new Error("Module path '" +path+ "' doesn't exist");
    let dir = fs.readdirSync(path);// array of filenames
    for (let i = 0; i < dir.length; i++) {
        if (dir[i] === "exampleWidget") continue; // skip example
        let fullPath = Path.join(path, dir[i]);
        if (!fs.statSync(fullPath).isDirectory() && Path.extname(fullPath) === ".js" ){
            //module name
            items.clientModules.push({
                type:    "client::common::module",
                name:    Path.basename(fullPath, ".js"),
                js:      createRelativePath(fullPath),
                css:     null,
                html:    null,
            });
        } else {
            readModuleDirectory(dir[i], fullPath);
        }
    }
}
/*endregion*/

log.info("Search Components");
run();

if(devMock) items = {
        clientCoreModules:    mock("CCM",  "clientCoreModules:"   ),
        clientCoreComponents: mock("CCC",  "clientCoreComponents:"),
        clientPreScript:      mock("CPrS", "clientPreScript:"     ),
        clientPreCss:         mock("CPrC", "clientPreCss:"        ),
        clientComponents:     mock("CC",   "clientComponents:"    ),
        clientModules:        mock("CM",   "clientModules:"       ),
        clientPostCss:        mock("CPoC", "clientPostCss:"       ),
        clientPostScript:     mock("CpoS", "clientPostScript:"    ),
};
log.info("Found Components, are they yours?");

// hookIn.systemReady(() => {
// });

function makeIterator(type, valueType) {
    let array = items[type];
    return function* () {
        for(let i = 0; i < array.length; i++) {
            if (valueType) {
                yield array[i][valueType];
            } else {
                yield array[i];
            }
        }
    }();
}

/* region mocking */
// function mock (type = "mock", name = "mocking", itemCount = 5) {
//     let c = 1;
//     let mockArray = [];
//     for ( let i = 0; i < itemCount; i++){
//         mockArray.push({
//             type: type,
//             name: type + ":-:" + name + c,
//             js:   type + ":-:" + name + c + ".js",
//             css:  type + ":-:" + name + (c++) + ".css"
//         });
//     }
//     return mockArray;
// }
//
// if (devMock) log("Componets mocked".red);
/*endregion*/
module.exports = {
    items: items,
    inactive: inactiveItems,
    getIterator: makeIterator,
};