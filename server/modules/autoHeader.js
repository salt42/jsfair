"use strict";
var config  = require('jsfair/config');
let fs      = require("fs");

hookIn.http_init(function(app) {
    app.locals.headerIncludes = '<script src="/jsfair/libsmin.js"></script>';
    app.locals.headerIncludes += '<script src="/jsfair/jsfair.js"></script>';
});
function getConfiguredModules() {

}
function searchComponents(path) {
    let dir = fs.readdirSync(path);// Returns an array of filenames excluding '.' and '..'.
    for (let i = 0; i < dir.length; i++) {

    }

}
function searchModules(path) {
    //@todo search all module js files to include
    // config["http"]["staticDirs"][i]
}
