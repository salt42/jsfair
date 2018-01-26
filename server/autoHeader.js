"use strict";
var config  = require('jsfair/config');
var log     = require('jsfair/log')("autoHeader".yellow);
let compMan = require('./componentManager');
let tagEnd = '\r\n\t\t';


// config.registerConfig({
//     client: {
//         deinValue: "default value"
//     }
// });
hookIn.http_init(function(app) {
    global.headerIncludes += '<script src="/jsfair/libsmin.js"></script>' + tagEnd;
    global.headerIncludes += '<script src="/jsfair/jsfair.js"></script>' + tagEnd;

    for (let comp of compMan.getIterator("clientCoreModules")) {
        global.headerIncludes += createScriptTag(comp.js);
        global.headerIncludes += createCssTag(comp.css);
    }
    for (let comp of compMan.getIterator("clientCoreComponents")) {
        global.headerIncludes += createScriptTag(comp.js);
        global.headerIncludes += createCssTag(comp.css);
    }
    for (let comp of compMan.getIterator("clientPreCss")) {
        global.headerIncludes += createScriptTag(comp.js);
        global.headerIncludes += createCssTag(comp.css);
    }
    for (let comp of compMan.getIterator("clientPreScript")) {
        global.headerIncludes += createScriptTag(comp.js);
        global.headerIncludes += createCssTag(comp.css);
    }
    for (let comp of compMan.getIterator("clientModules")) {
        global.headerIncludes += createScriptTag(comp.js);
        global.headerIncludes += createCssTag(comp.css);
    }
    for (let comp of compMan.getIterator("clientComponents")) {
        global.headerIncludes += createScriptTag(comp.js);
        global.headerIncludes += createCssTag(comp.css);
    }
    for (let comp of compMan.getIterator("clientPostCss")) {
        global.headerIncludes += createScriptTag(comp.js);
        global.headerIncludes += createCssTag(comp.css);
    }
    for (let comp of compMan.getIterator("clientPostScript")) {
        global.headerIncludes += createScriptTag(comp.js);
        global.headerIncludes += createCssTag(comp.css);
    }
    log("Knitted your Header");
});
/* region auxiliaries */
function createScriptTag(path) {
    let incPath = (path === null) ? null : path;
    return (incPath === null) ? "" : '<script src="' + incPath + '"></script>'+ tagEnd;
}
function createCssTag(path) {
    let incPath = (path === null) ? null : path;
    return (incPath === null) ? "" : '<link href="' + incPath + '" rel="stylesheet">' + tagEnd;
}
/*endregion*/