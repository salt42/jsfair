"use strict";
var config  = require('jsfair/config');
var log     = require('jsfair/log')("autoHeader");
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
    let js_arr = {
        jquery: [],
        core:   [],
        pre:    [],
        common: [],
        post:   [],
    };
    let css_arr = {
        core:   [],
        pre:    [],
        common: [],
        post:   [],
    };
    for(let i = 0; i < compMan.length; i++){
        if(compMan[i].section === "core") {
            js_arr.core.push(compMan[i].js);
            css_arr.core.push(compMan[i].css);
        }
        if(compMan[i].section === "pre") {
            js_arr.pre.push(compMan[i].js);
            css_arr.pre.push(compMan[i].css);
        }
        if(compMan[i].section === "common") {
            js_arr.common.push(compMan[i].js);
            css_arr.common.push(compMan[i].css);
        }
        if(compMan[i].section === "post") {
            js_arr.post.push(compMan[i].js);
            css_arr.post.push(compMan[i].css);
        }
    }
    log(css_arr);
    let constructArrayJS = js_arr.core.concat(js_arr.pre, js_arr.common, js_arr.post);
    let constructArrayCSS = css_arr.core.concat(css_arr.pre, css_arr.common, css_arr.post);
    for (let i = 0; i < constructArrayCSS.length; i++){
        global.headerIncludes += createCssTag(constructArrayCSS[i]);
    }
    for (let i = 0; i < constructArrayJS.length; i++){
        global.headerIncludes += createScriptTag(constructArrayJS[i]);
    }
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