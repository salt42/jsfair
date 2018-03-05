"use strict";
const fs    = require('fs');
let config  = require('jsfair/config');
let log     = require('jsfair/log')("autoHeader".yellow);
let compMan = require('./componentManager');
let tagEnd = '\r\n\t\t';

let templates ="";


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
    }
    for (let comp of compMan.getIterator("clientCoreComponents")) {
        global.headerIncludes += createScriptTag(comp.js);
        global.headerIncludes += createCssTag(comp.css);
        templates += createHTMLTag(comp.html, comp.name);
    }
    for (let comp of compMan.getIterator("clientPreCss")) {
        global.headerIncludes += createCssTag(comp.css);
    }
    for (let comp of compMan.getIterator("clientPreScript")) {
        global.headerIncludes += createScriptTag(comp.js);
    }
    for (let comp of compMan.getIterator("clientModules")) {
        global.headerIncludes += createScriptTag(comp.js);
    }
    for (let comp of compMan.getIterator("clientComponents")) {
        global.headerIncludes += createScriptTag(comp.js);
        global.headerIncludes += createCssTag(comp.css);
        templates += createHTMLTag(comp.html, comp.name);
    }
    for (let comp of compMan.getIterator("clientPostCss")) {
        global.headerIncludes += createCssTag(comp.css);
    }
    for (let comp of compMan.getIterator("clientPostScript")) {
        global.headerIncludes += createScriptTag(comp.js);
    }
    global.headerIncludes += templates;
});
/* region auxiliaries */
function createScriptTag(path) {
    return (path === null) ? "" : '<script src="' + path + '"></script>'+ tagEnd;
}
function createCssTag(path) {
    return (path === null) ? "" : '<link href="' + path + '" rel="stylesheet">' + tagEnd;
}
function createHTMLTag(path, name) {
    if (path === null) return "";
    let html =  fs.readFileSync(path,'utf8');
    let compName = camelToDash(name);
    return '<template id="template-' + compName + '-main">' + html + '</template>' + tagEnd;
}

function camelToDash(str) {
    str = str.replace(/\W+/g, '-')
        .replace(/([a-z\d])([A-Z])/g, '$1-$2');
    return str.toLowerCase();
}

function dashToCamel(str) {
    return str.replace(/\W+(.)/g, function (x, chr) {
        return chr.toUpperCase();
    })
}
/*endregion*/