"use strict";
var config  = require('jsfair/config');
var log     = require('jsfair/log')("autoHeader");
let fs      = require("fs");
let Path    = require("path");
let Components = [];

hookIn.http_init(function(app) {
    /* region gather data*/
    let Modules = [];
    let Components = [];
    let moduleResult ={};
    let comp= [];

    for(let i = 0; i < config.client.componentPaths.length; i++){
        comp = searchComponents(ROOT_PATH + config.client.componentPaths[i]);
        Components = Components.components.concat(comp);
    }
    for (let i = 0; i < config.client.modulePaths.length; i++){
        moduleResult = searchModules(ROOT_PATH + config.client.modulePaths[i]);
        Modules = Components.concat(moduleResult.modules);
        Components = Components.concat(moduleResult.components);
    }
    /*endregion*/
    app.locals.headerIncludes = '<script src="/jsfair/libsmin.js"></script>';
    app.locals.headerIncludes += '<script src="/jsfair/jsfair.js"></script>';
    // components
    for(let i = 0; i < Components.length; i++){
        app.locals.headerIncludes += createCssTag(Components[i]);
        app.locals.headerIncludes += createScriptTag(Components[i]);
    }
    // modules
    for(let i = 0; i < Modules.length; i++){
        app.locals.headerIncludes += createScriptTag(Modules[i]);
    }

});
function createScriptTag(object) {
    let incPath = object.scriptPath.replace(ROOT_PATH, "");
    return '<script src="' + incPath + '"></script>';
}
function createCssTag(object) {
    let incPath = (object.cssPath === null) ? null : object.cssPath.replace(ROOT_PATH, "");
    return (incPath === null) ? "" : '<link href="' + incPath + '" rel="stylesheet>';
}
function getConfiguredModules() {

}
/* region components */
function readCompDirectory(name, path) {
    let noExt = Path.join(path, name);
    let scriptPath = noExt + ".js";
    if (!fs.existsSync(scriptPath)) return null;
    let comp = {};
    comp.name = name;
    comp.scriptPath = scriptPath;
    comp.cssPath  = (fs.existsSync(noExt + ".css" )) ? noExt + ".css"  : null;
    comp.htmlPath = (fs.existsSync(noExt + ".html")) ? noExt + ".html" : null;
    return comp;
}
function searchComponents(path) {
    let comps = [];
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
/*endregion*/
/* region modules */
function readModuleDirectory(name, path) {
    let scriptPath = path + "/" + name + ".js";
    let moduleJS = [];
    let subModuleJS = [];
    let subComponents = [];

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
                    subComponents = subComponents.concat(searchComponents(subDir));
                }
            }
        }
    }
    return {
        modules: moduleJS.concat(subModuleJS),
        components: subComponents,
    }
}
function searchModules(path) {
    //@todo search all module js files to include
    // config["http"]["staticDirs"][i]
    if (!fs.existsSync(path))return;
    let dir = fs.readdirSync(path);// Returns an array of filenames excluding '.' and '..'.
    let modules = {
        modules: [],
        components: []
    };
    let submodule = modules;
    for (let i = 0; i < dir.length; i++) {
        let fullPath = Path.join(path, dir[i]);
        if (!fs.statSync(fullPath).isDirectory()){
            //module name
            modules.modules.push({
                name: Path.basename(fullPath, ".js"),
                scriptPath: fullPath,
            });
        } else {
            submodule = readModuleDirectory(dir[i], fullPath);
            modules.modules = modules.modules.concat(submodule.modules);
            modules.components = modules.components.concat(submodule.components);
        }
    }
    return modules;
}
/*endregion*/