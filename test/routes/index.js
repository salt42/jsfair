/**
 * Created by salt on 28.10.2017.
 */
"use strict";

hookIn.createRoute("/", function(router) {
    /* GET home page. */
    router.get('/', function(req, res) {
        res.render('index', {});
    });
});