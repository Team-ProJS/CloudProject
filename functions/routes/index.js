/* *******************************************************************/
//                                                                  //
//          This file you can add links for pages                   //
//                                                                  //
/********************************************************************/

var express = require('express');
var router = express.Router();
const functions = require('firebase-functions');

/* GET home page. */
router.get('/', function (req, res, next) {
    response.set('Cache-Control', 'public, max-age=300, s-maxage=600');
    res.render('index', {
        title: 'Cloud | Home'
    });
});
/*Renders interface page*/
router.get('/interfacePage', function (req, res, next) {
    res.render('interfacePage', {
        title: 'Cloud Page'
    });
});
/*Renders aboutUs page*/
router.get('/aboutUs', function (req, res, next) {
    res.render('aboutUs', {
        title: 'About Us'
    });
});
module.exports = router;
