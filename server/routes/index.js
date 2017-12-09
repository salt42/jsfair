/**
 * Created by salt on 28.10.2017.
 */
"use strict";

// var DB = require('../database');
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
    res.render('index', {
        title: "login",
        navBarComp: "navBar",
        mainComp: "welcomePage"
    });
});
router.get('/map', function(req, res) {
    res.render('index', {
        title: "login",
        navBarComp: "navBarMember",
        mainComp: "mapPage"
    });
});
// router.post('/', function(req, res, next) {
//     //do login
//     // reg.post
//     //if fail -> render error else redirect to /dashboard
//     // res.redirect('/');
//     res.render('index', { title: 'Express' });
//
//     if(!req.body.id || !req.body.password){
//         res.render('index', { message: "Please enter both id and password" });
//     } else {
//         //search in database for user id
//         // DB.
//         Users.filter(function(user){
//             if(user.id === req.body.id && user.password === req.body.password){
//                 req.session.user = user;
//                 res.redirect('/protected_page');
//             }
//         });
//         res.render('login', {message: "Invalid credentials!"});
//     }
// });
module.exports = router;
