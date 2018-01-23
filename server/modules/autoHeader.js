"use strict";
var config  = require('jsfair/config');
var log     = require('jsfair/log')("autoHeader");
let fs      = require("fs");
let Path    = require("path");
let Components = [];
let tagEnd = '\r\n\t\t';
hookIn.http_init(function(app) {
    /* region gather data*/
    let Modules = [];
    let Components = [];
    let moduleResult ={};
    let comp = [];
    let preCss = "";
    let postCss = "";
    let preScript = "";
    let postScript = "";

    preScript += '<script src="/jsfair/libsmin.js"></script>' + tagEnd;
    preScript += '<script src="/jsfair/jsfair.js"></script>' + tagEnd;

    for(let i = 0; i < config.client.preCss.length; i++){
        preCss += createCssTag(config.client.preCss[i]);
    }
    for(let i = 0; i < config.client.preScript.length; i++){
        preScript += createScriptTag(config.client.preScript[i]);
    }

    for(let i = 0; i < config.client.componentPaths.length; i++){
        comp = searchComponents(config.client.componentPaths[i]);
        Components = Components.concat(comp);
    }
    for (let i = 0; i < config.client.modulePaths.length; i++){
        moduleResult = searchModules(config.client.modulePaths[i]);
        Modules = Modules.concat(moduleResult.modules);
        Components = Components.concat(moduleResult.components);
    }
    /*endregion*/
    // components
    for(let i = 0; i < Components.length; i++){
        preCss += createCssTag(Components[i].cssPath);
        preScript += createScriptTag(Components[i].scriptPath);
    }
    // modules
    for(let i = 0; i < Modules.length; i++){
        preScript += createScriptTag(Modules[i].scriptPath);
    }
    global.headerIncludes += preCss;
    global.headerIncludes += preScript;

});
function createScriptTag(path) {
    let incPath = createIncPath(path);
    return '<script src="' + incPath + '"></script>'+ tagEnd;
}
function createCssTag(path) {
    let incPath = (path === null) ? null : createIncPath(path);
    return (incPath === null) ? "" : '<link href="' + incPath + '" rel="stylesheet">' + tagEnd; // autsch
}
function createIncPath(path){
    let staticDirs = config.server.http.staticDirs;
    let result;
    path = path
        .replace(ROOT_PATH, "")
        .replace(/\\/g,"/");
    for (let i = 0; i < staticDirs.length; i++){
        staticDirs[i] = staticDirs[i].replace(/\\/g,"/");
        if (path.indexOf(staticDirs[i]) !== -1){
            result = path.replace(staticDirs[i], "");
            return result;
        }
    }
    return path;
}
function getConfiguredModules() {

}
/* region components */
function readCompDirectory(name, path) {
    let comp = {};
    let noExt = Path.join(path, name);
    let scriptPath = noExt + ".js";
    if (!fs.existsSync(scriptPath)) return null;
    comp.name = name;
    comp.scriptPath = scriptPath;
    comp.cssPath  = (fs.existsSync(noExt + ".css" )) ? noExt + ".css"  : null;
    comp.htmlPath = (fs.existsSync(noExt + ".html")) ? noExt + ".html" : null;
    return comp;
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
                comps.push(a);
            }
        } else {
            comps.push({
                name: Path.basename(fullPath, ".js"),
                scriptPath: fullPath,
                cssPath: null,
                htmlPath: null,
            });
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
            let subDir = Path.join(path, dir[i]);
            if (!fs.statSync(subDir).isDirectory()) {
                // is file
                subModuleJS.push({
                    name: Path.basename(subDir, ".js"),
                    scriptPath: subDir,
                });
            } else {
                if (dir[i] == "component" || dir[i] == "components") {
                    let relSubDir = subDir.replace(ROOT_PATH, "");
                    let a = searchComponents(relSubDir);
                    if (a !== null){
                        subComponents = subComponents.concat(a);
                    }
                }
            }
        }
    }
    return {
        modules: moduleJS.concat(subModuleJS),
        components: subComponents,
    }
}
function searchModules(relPath) {
    let path = ROOT_PATH + relPath;
    if (!fs.existsSync(path))return;
    let dir = fs.readdirSync(path);// array of filenames
    let modules = {
        modules: [],
        components: [],
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
            if (submodule !== null) {
                modules.modules = modules.modules.concat(submodule.modules);
                modules.components = modules.components.concat(submodule.components);
            }
        }
    }
    return modules;
}
/*endregion*/