"use strict";
var config  = require('jsfair/config');
var log     = require('jsfair/log')("autoHeader");
let compMan = require('./componentManager');
let tagEnd = '\r\n\t\t';


config.registerConfig({
    client: {
        deinValue: "default value"
    }
});
hookIn.http_init(function(app) {
    log(compMan);
    log(compMan.get);
    global.headerIncludes += '<script src="/jsfair/libsmin.js"></script>' + tagEnd;
    global.headerIncludes += '<script src="/jsfair/jsfair.js"></script>' + tagEnd;
    global.headerIncludes += compMan.get;
});



function wasDerAutoHeaderTunSoll(){
    function createScriptTag(path) {
        let incPath = createIncPath(path);
        return '<script src="' + incPath + '"></script>'+ tagEnd;
    }
    function createCssTag(path) {
        let incPath = (path === null) ? null : createIncPath(path);
        return (incPath === null) ? "" : '<link href="' + incPath + '" rel="stylesheet">' + tagEnd;
    }

    let coreCss = '<!-- stylesheets -->' + tagEnd;
    let preCss = "";
    let componentCss = "";
    let postCss = "";

    let coreScript = '<!-- scripts -->' + tagEnd;
    let preScript = "";
    let componentAndModuleScript = "";
    let postScript = "";

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


    return coreCss    + preCss    + componentCss             + postCss    + tagEnd +
        coreScript + preScript + componentAndModuleScript + postScript;
}