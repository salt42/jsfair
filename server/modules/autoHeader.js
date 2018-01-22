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
    let comp = [];

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
    app.locals.headerIncludes = '<script src="/jsfair/libsmin.js"></script>';
    app.locals.headerIncludes += '<script src="/jsfair/jsfair.js"></script>';
    // components
    for(let i = 0; i < Components.length; i++){
        console.log(createCssTag(Components[i]));
        console.log(createScriptTag(Components[i]));
        app.locals.headerIncludes += createCssTag(Components[i]);
        app.locals.headerIncludes += createScriptTag(Components[i]);
    }
    // modules
    for(let i = 0; i < Modules.length; i++){
        app.locals.headerIncludes += createScriptTag(Modules[i]);
        console.log(createScriptTag(Modules[i]));
    }

});
function createScriptTag(object) {
    let rootPathPart = Path.join(ROOT_PATH,object.dir);
    let incPath = object.scriptPath.replace(rootPathPart, "");
    return '<script src="' + incPath + '"></script>';
}
function createCssTag(object) {
    let rootPathPart = Path.join(ROOT_PATH,object.dir);
    let incPath = (object.cssPath === null) ? null : object.cssPath.replace(rootPathPart, "");
    return (incPath === null) ? "" : '<link href="' + incPath + '" rel="stylesheet>';
}
function getConfiguredModules() {

}
/* region components */
function readCompDirectory(name, relPath, path) {
    let noExt = Path.join(path, name);
    let scriptPath = noExt + ".js";
    if (!fs.existsSync(scriptPath)) return null;
    let comp = {};
    comp.name = name;
    comp.scriptPath = scriptPath;
    comp.cssPath  = (fs.existsSync(noExt + ".css" )) ? noExt + ".css"  : null;
    comp.htmlPath = (fs.existsSync(noExt + ".html")) ? noExt + ".html" : null;
    comp.dir = relPath;
    return comp;
}
function searchComponents(relPath) {
    let path = ROOT_PATH + relPath;
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
                dir: relPath,
            });
        } else {
            comps.push(readCompDirectory(dir[i], relPath, fullPath));
        }
    }
    return comps;
}
/*endregion*/
/* region modules */
function readModuleDirectory(name, relPath, path) {
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
                dir: relPath,
            });
        } else {
            let subDir = Path.join(path, dir[i]);
            if (!fs.statSync(subDir).isDirectory()) {
                // is file
                subModuleJS.push({
                    name: Path.basename(subDir, ".js"),
                    scriptPath: subDir,
                    dir: relPath,
                });
            } else {
                if (dir[i] == "component" || dir[i] == "components") {
                    let a = searchComponents(Path.join(relPath, dir[i]));
                    if (a){
                        subComponents = subComponents.concat(searchComponents(Path.join(relPath, dir[i])));
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
    //@todo search all module js files to include
    // config["http"]["staticDirs"][i]
    let path = ROOT_PATH + relPath;
    if (!fs.existsSync(path))return;
    let dir = fs.readdirSync(path);// Returns an array of filenames excluding '.' and '..'.
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
                dir: relPath,
            });
        } else {
            submodule = readModuleDirectory(dir[i], relPath, fullPath);
            modules.modules = modules.modules.concat(submodule.modules);
            modules.components = modules.components.concat(submodule.components);
        }
    }
    return modules;
}
/*endregion*/