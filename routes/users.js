var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});
/*Renders register page*/
router.get('/register', function (req, res, next) {
    res.render('register');
});
/*Renders login page*/
router.get('/login', function (req, res, next) {
    res.render('login');
});
/*Renders privacy policy page*/
router.get('/policy', function (req, res, next) {
    res.render('policy');
});
router.get('/interfacePage', function (req, res, next) {
    res.render('interfacePage');
});
module.exports = router;
