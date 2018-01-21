"use strict";
var config = require('jsfair/config');

hookIn.http_init(function(app) {
    app.locals.headerIncludes = '<script src="/jsfair/libsmin.js"></script>';
    app.locals.headerIncludes += '<script src="/jsfair/jsfair.js"></script>';
});
function getConfiguredModules() {

}
function searchModules() {
    //@todo search all module js files to include
    // config["http"]["staticDirs"][i]
}
function searchComponents() {}