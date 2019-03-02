/* *******************************************************************/
//                                                                  //
// This file is the engine. DO NOT ADD ANYTHING WITHOUT             //
// CONSULTATION.                                                    //
// You can add files in routes, and add a link as done so for       //
// index and users.                                                 //
//                                                                  //
/********************************************************************/

const functions = require('firebase-functions');
var express = require('express');
const engines = require('express-handlebars');
var path = require('path');
var cookieParser = require('cookie-parser');
const firebase = require("firebase");
// Required for side-effects
const firestore=require("firebase/firestore");

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();
app.use(cookieParser());

//view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('hbs', engines({
    defaultLayout: 'layout'
}));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// Leave this here for now please. - sofia.
/*
app.get('/', (request, response) => {
    response.set('Cache-Control', 'public, max-age=300, s-maxage=600');
    response.render('home');
});*/



exports.app = functions.https.onRequest(app);
