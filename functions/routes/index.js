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
/*Renders a verification page to google that tells it that we are the owners of this site DO NOT REMOVE*/
router.get('/googlee5811be4d44f6a39.html',function(req,res,next){
	res.render('googlee5811be4d44f6a39', {
		title: 'Verification of Ownership'
	});
});

module.exports = router;
