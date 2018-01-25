"use strict";
var config  = require('jsfair/config');
var log     = require('jsfair/log')("autoHeader");
let fs      = require("fs");
let Path    = require("path");
let tagEnd = '\r\n\t\t';

hookIn.http_init(function(app) {
    let Modules = [];
    let Components = [];

    let preCss = '<!-- stylesheets -->' + tagEnd;
    let postCss = "";
    let componentCss = "";
    let componentAndModuleScript = "";
    let preScript = '<!-- scripts -->' + tagEnd;
    let postScript = "";

    /* region create header tags pre section */
    preScript += '<script src="/jsfair/libsmin.js"></script>' + tagEnd;
    preScript += '<script src="/jsfair/jsfair.js"></script>' + tagEnd;
    if (config.client.preCss.length !== 0){
        for(let i = 0; i < config.client.preCss.length; i++){
            preCss += createCssTag(config.client.preCss[i]);
        }
    }
    if (config.client.preScript.length !== 0){
        for(let i = 0; i < config.client.preScript.length; i++){
            preScript += createScriptTag(config.client.preScript[i]);
        }
    }
    /*endregion*/

    /* region create header tags post section */
    if (config.client.postCss.length !== 0){
        postCss = '<!-- post -->' + tagEnd;
        for(let i = 0; i < config.client.postCss.length; i++){
            postCss += createCssTag(config.client.preCss[i]);
        }
    }
    if (config.client.postScript.length !== 0){
        postScript = '<!-- post -->' + tagEnd;
        for(let i = 0; i < config.client.postScript.length; i++){
            postScript += createScriptTag(config.client.preScript[i]);
        }
    }
    /*endregion*/

    /* region gather data of components and modules */
    if (config.client.componentPaths.length !== 0) {
        for (let i = 0; i < config.client.componentPaths.length; i++) {
            let comp = searchComponents(config.client.componentPaths[i]);
            if (!comp) continue;
            Components = Components.concat(comp);
        }
    }
    if (config.client.modulePaths.length !== 0) {
        for (let i = 0; i < config.client.modulePaths.length; i++) {
            let moduleResult = searchModules(config.client.modulePaths[i]);
            Modules = Modules.concat(moduleResult.modules);
            Components = Components.concat(moduleResult.components);
        }
    }
    /*endregion*/

    /* region create header tags of components and modules */
    // components
    if (Components.length !== 0) {
        componentCss += '<!-- components -->' + tagEnd;
        componentAndModuleScript += '<!-- components -->' + tagEnd;
        for (let i = 0; i < Components.length; i++) {
            componentCss += createCssTag(Components[i].cssPath);
            componentAndModuleScript += createScriptTag(Components[i].scriptPath);
        }
    }
    // modules
    if (Modules.length !== 0) {
        componentAndModuleScript += '<!-- modules -->' + tagEnd;
        for (let i = 0; i < Modules.length; i++) {
            componentAndModuleScript += createScriptTag(Modules[i].scriptPath);
        }
    }
    /*endregion*/

    global.headerIncludes += preCss    + componentCss             + postCss    + tagEnd;
    global.headerIncludes += preScript + componentAndModuleScript + postScript;
});

/* region http_init() auxiliaries */
function createScriptTag(path) {
    let incPath = createIncPath(path);
    return '<script src="' + incPath + '"></script>'+ tagEnd;
}
function createCssTag(path) {
    let incPath = (path === null) ? null : createIncPath(path);
    return (incPath === null) ? "" : '<link href="' + incPath + '" rel="stylesheet">' + tagEnd;
}
function createIncPath(path){
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

function getConfiguredModules() {

}

/* region auto read components */
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

/* region auto read modules */
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
        if (dir[i] === "exampleWidget") continue; // skip example
        let fullPath = Path.join(path, dir[i]);
        if (!fs.statSync(fullPath).isDirectory() && Path.extname(fullPath) === ".js" ){
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