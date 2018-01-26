"use strict";
var core    = require ('jsfair/coreAddOns');
var config  = require('jsfair/config');
var log     = require('jsfair/log')("autoHeader");
let fs      = require("fs");
let Path    = require("path");
let tagEnd = '\r\n\t\t';

config.registerConfig({
    client: {
        deinValue: "default value"
    }
});

let component = {
    name: "",
    scriptPath: "",
    cssPath:    "",
};
let module = {
    name: "",
    scriptPath: ""
};

let _components = {
    components: {
        core: [],
        pre: [],
        post: []
    },
    modules: {
        core: [],
        pre: [],
        post: []
    },
};

let _componentsHash; //dann eher

let Components = {};
let Modules = {};

let coreCss = '<!-- stylesheets -->' + tagEnd;
let preCss = "";
let commonCss = "";
let postCss = "";

let coreScript = '<!-- scripts -->' + tagEnd;
let preScript = "";
let commonScript = "";
let postScript = "";

hookIn.systemReady(() => {
    log("Search Components");
    //init module
    //search all comps an push in lists
});

module.exports = {};
//da bau ich halt immer ganz gerne objects mit funcs die dem wortlaut entsprechen...
// ich will ne liste, von tieren mit dem namen XX => list.animal.byName(XX);  ja hier köönnen wir es uns leicht machen wei wir eigentlich immer ein array von einem typen haben wollen
//in der main.js brauch ich [path] :) von activen (in der config) server modulen
module.exports.testApiFunc = () => {
    //datten aus den listen wieder zurückgeben ah ok also
};

function get compPaths(){

    /* region jquery */
    let a = config.client.jquery;
    if (a.length > 1) {
        if (!Components.core) Components.core = [];
        for (let i = 0; i < a.length; i++) {

            Components.core.push({
                name: "jquery part " + (i + 1),
                scriptPath: a[i],
                cssPath: null
            });
        }
    }
    /*endregion*/
    /* region core comps */
    a = config.client.coreComponents;
    if (a.length > 1) {
        if (!Components.core) Components.core = [];
        for (let coreName in a) {
            if (a.hasOwnProperty(coreName) && a[coreName] === true) {
                a = core.client.components[coreName];
                if (a) Components.core.push({
                    name: coreName,
                    scriptPath: a.js,
                    cssPath: a.css
                });
            }
        }
    }
    /*endregion*/
    /* region pre comps */
    /*endregion*/
    /* region common comps */
    a = config.client.componentPaths;
    if (a.length > 1) {
        if (!Components.common) Components.common = [];
        if (a.length !== 0) {
            for (let i = 0; i < a.length; i++) {
                let comp = searchComponents(a[i]);
                if (!comp) continue;
                Components.common = Components.common.concat(comp);
            }
        }
    }
    /*endregion*/
    /* region post comps */
    /*endregion*/
}

function get modulePaths(){
    /* region core modules */
    let a = config.client.coreModules;
    if (a.length > 1) {
        if (!Modules.core) Modules.core = [];
        for (let coreName in a) {
            if (a.hasOwnProperty(coreName) && a[coreName] === true) {
                if (core.client.modules[coreName]) Modules.core.push({
                    name: coreName,
                    scriptPath: core.client.modules[coreName]
                });
            }
        }
    }
    /*endregion*/
    /* region pre modules */
    a = [];
    if (a.length > 1) {
        if (!Modules.pre) Modules.pre = [];
    }
    /*endregion*/
    /* region common modules */
    a = config.client.modulePaths;
    if (a.length > 1) {
        if (!Modules.common) Modules.common = [];
        for (let i = 0; i < config.client.modulePaths.length; i++) {
            let moduleResult = searchModules(config.client.modulePaths[i]);
            Modules.pre = Modules.concat(moduleResult.modules);
            Components.pre = Components.concat(moduleResult.components);
        }
    }
    /*endregion*/
    /* region post modules */
    a = [];
    if (a.length > 1) {
        if (!Modules.post) Modules.post = [];
    }
    /*endregion*/

}
hookIn.http_init(function(app) {
    // let Modules = [];
    // let Components = [];
    //
    // let coreCss = '<!-- stylesheets -->' + tagEnd;
    // let preCss = "";
    // let componentCss = "";
    // let postCss = "";
    //
    // let coreScript = '<!-- scripts -->' + tagEnd;
    // let preScript = "";
    // let componentAndModuleScript = "";
    // let postScript = "";

    /* region create header tags pre section */
    coreScript += '<script src="/jsfair/libsmin.js"></script>' + tagEnd;
    coreScript += '<script src="/jsfair/jsfair.js"></script>' + tagEnd;

    for (let coreModule in config.client.coreModules){
        if (config.client.coreModules.hasOwnProperty(coreModule) && coreModule === true){
            let corePath = Path.join(jsfairPath, core.modules[coreModule]);
            coreScript += createScriptTag(corePath);
        }
    }
    for (let coreComponents in config.client.coreComponent){
        if (config.client.coreComponent.hasOwnProperty(coreComponents) && coreComponents === true){
            let coreComponent = core.components[coreComponents];
            let corePath = Path.join(jsfairPath, coreComponent.js);
            coreScript += createScriptTag(corePath);
            corePath = (coreComponent.css === "") ? null : Path.join(jsfairPath, coreComponent.css);
            coreScript += (corePath === null) ? "" : createCssTag(corePath);
        }
    }

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

    global.headerIncludes += coreCss    + preCss    + componentCss             + postCss    + tagEnd;
    global.headerIncludes += coreScript + preScript + componentAndModuleScript + postScript;
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