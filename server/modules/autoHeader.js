"use strict";
var config  = require('jsfair/config');
var log     = require('jsfair/log')("autoHeader");
let fs      = require("fs");
let Path    = require("path");
let Components = [];
let Modules = [];

hookIn.http_init(function(app) {
    app.locals.headerIncludes = '<script src="/jsfair/libsmin.js"></script>';
    app.locals.headerIncludes += '<script src="/jsfair/jsfair.js"></script>';
    Modules = searchModules(ROOT_PATH + "/src/client/modules");
    searchComponents(ROOT_PATH + "/src/client/components", Components);
});
function getConfiguredModules() {

}
function readCompDirectory(name, path) {
    let scriptPath = path + "/" + name + ".js";
    if (!fs.existsSync(scriptPath)) return null;
    let comp = {};
    comp.name = name;
    comp.scriptPath = scriptPath;
    comp.cssPath = (fs.existsSync(path + "/" + name + ".css"))? path + "/" + name + ".css" : null;
    comp.htmlPath = (fs.existsSync(path + "/" + name + ".html"))? path + "/" + name + ".html" : null;
    return comp;
}
function searchComponents(path, comps) {
    if (!fs.existsSync(path))return;
    let dir = fs.readdirSync(path);// Returns an array of filenames excluding '.' and '..'.
    for (let i = 0; i < dir.length; i++) {
        let fullPath = Path.join(path, dir[i]);
        if (!fs.statSync(fullPath).isDirectory()){
            comps.push({
                name: Path.basename(fullPath, ".js"),
                scriptPath: fullPath,
                cssPath: null,
                htmlPath: null,
            });
        } else {
            comps.push(readCompDirectory(dir[i], fullPath));
        }
    }
    return comps;
}

function readModuleDirectory(name, path) {
    let scriptPath = path + "/" + name + ".js";
    let moduleJS = [];
    let subModuleJS = [];

    if (!fs.existsSync(scriptPath)) return null;
    let dir = fs.readdirSync(path);
    for (let i = 0; i < dir.length; i++) {
        if (name + ".js" === dir[i]) {
            moduleJS.push({
                name: name,
                scriptPath: scriptPath,
            });
        } else {
            let subDir = path + "/" + dir[i];
            if (!fs.statSync(subDir).isDirectory()) {
                // is file
                subModuleJS.push({
                    name: Path.basename(subDir, ".js"),
                    scriptPath: subDir,
                });
            } else {
                if (dir[i] == "component" || dir[i] == "components") {
                    searchComponents(subDir, Components);
                }
            }
        }
    }
    return moduleJS;
}
function searchModules(path) {
    //@todo search all module js files to include
    // config["http"]["staticDirs"][i]
    if (!fs.existsSync(path))return;
    let dir = fs.readdirSync(path);// Returns an array of filenames excluding '.' and '..'.
    let modules = [];
    for (let i = 0; i < dir.length; i++) {
        let fullPath = Path.join(path, dir[i]);
        if (!fs.statSync(fullPath).isDirectory()){
            modules.push({
                name: Path.basename(fullPath, ".js"),
                scriptPath: fullPath,
            });
        } else {
            modules.push(readModuleDirectory(dir[i], fullPath));
        }
    }
    return modules;
}
