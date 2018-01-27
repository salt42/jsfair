/**
 * Created by salt on 28.10.2017.
 */
"use strict";
hookIn.http_createRoute("/", function(router) {
    /* GET home page. */
    router.get('/', function(req, res) {
        try {
            // res.send("sers");
            res.render('layout', {});
        }catch (e) {
            console.log(e);
        }
        // res.send();
    });
});