"use strict";
const fs = require('fs');
let config = require('jsfair/config');
let log = require('jsfair/log')("autoHeader".yellow);
let compMan = require('./componentManager');
let tagEnd = '\r\n\t\t';

let templates = "";


// config.registerConfig({
//     client: {
//         deinValue: "default value"
//     }
// });
function build(app) {
    templates = "";
    global.headerIncludes = '<script src="/jsfair/browserBridge.js"></script>' + tagEnd;
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
}
/* region auxiliaries */
function createScriptTag(path) {
    return (path === null) ? "" : '<script src="' + path + '"></script>' + tagEnd;
}
function createCssTag(path) {
    return (path === null) ? "" : '<link href="' + path + '" rel="stylesheet">' + tagEnd;
}
function createHTMLTag(htmlArray, name) {
    let tags = "";
    if (htmlArray === null) return tags;
    let compName = camelToDash(name);
    for (let i = 0; i < htmlArray.length; i++) {
        let obj = htmlArray[i];
        let subName = camelToDash(obj.name);
        if(obj.name === name) subName = "main";
        let html = fs.readFileSync(obj.path, 'utf8');
        // tags +=`<!--<template id="template-${{compName}}-${{subName}}">${{html}}</template>-->${{tagEnd}}`;
        tags +='<template id="template-' + compName + '-' + subName + '">' + html + '</template>' + tagEnd;
    }
    return tags;
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

hookIn.http_init(build);
compMan.onChanged(() => build());
module.exports = {
    reload: build
};