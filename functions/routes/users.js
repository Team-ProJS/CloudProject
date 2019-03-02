var express = require('express');
var router = express.Router();/* GET users listing. */
var admin = require("firebase-admin");
var serviceAccount = require("./adminsdk.json");

var firebaseAdmin=admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://cloudjs-projs.firebaseio.com"
});

var db = admin.firestore();

function isAuthenticated(req, res, next){
        try {
        var sessionCookie = req.cookies.__session;
        console.log(sessionCookie);
        admin.auth().verifySessionCookie(sessionCookie, true)
            .then(function(decodedClaims){
                console.log("token verified");
                next();
                    })
            .catch(function(error){
                console.log(error);
                res.redirect('/users/login');
                });
        }catch (err)
        {
            console.log(err);
        }
};

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

router.get('/interfacePage', isAuthenticated,function (req, res, next) {
    //isAuthenticated is called when this get is called. If next() is called from isAuthenticated, then function (req, res, next) is called which renders page
    res.render('interfacePage');
});


router.post('/authIn', function (req, res, next) {
    var token = req.body.token.toString();
    var expiresIn=1000*60*60*24;//sets expiry time to 1 day
    admin.auth().verifyIdToken(token)//verifies token recieved is genuine
        .then(function(decodedToken){//triggers if token is genuine
            admin.auth().createSessionCookie(token,{expiresIn})//creates session cookie
                .then(function(sessionCookie)
                      {//triggers if session cookie created successfuly
                        res.setHeader('Cache-Control', 'private');
                        res.cookie('__session', sessionCookie);//saves cookie
                        res.send("response");
                        })
                .catch(function(error)
                      {//triggers if session cookie not created successfuly
                        res.send("cookie not created");
                        });
            
            })
        .catch(function(error){//triggers if token is not genuine
            res.send("token not verified");
            })
});

router.post('/authOut', function (req, res, next) {
    res.setHeader('Cache-Control', 'private');
    res.clearCookie('__session');//removes cookie named session (that we save in authIn)
    res.send("response");
});

router.post('/createUserInfo', function (req, res, next) {
    let query=db.collection('UserInfo').where('userID','==',req.body.uid);
    query.get().then(
        function(querySnapshot)
            {
                if (querySnapshot.empty)
                {
                    var docRef = db.collection('UserInfo').doc(req.body.uid);
                    var setUser = docRef.set({
                    pCloudTransfer:0,
                    pCloudUpload:0,
                    oneDriveTransfer:0,
                    oneDriveUpload:0,
                    oneDriveDownload:0,
                    gDriveTransfer:0,
                    gDriveUpload:0,
                    gDriveDownload:0,
                    dBoxTransfer:0,
                    dBoxUpload:0,
                    dBoxDownload:0
                    });
                }
            })
    .catch(function(err){console.log(err);});
    res.send("response");
});

/*router.post('/increment', function (req, res, next) {
    var ref = db.collection('UserInfo').doc(req.body.uid);
    //var field=req.body.field;
    var value=req.body.value;
    
    var transaction = db.runTransaction(function(t) {
            return t.get(ref)
        .then(function(doc) {
            var curr = doc.data().(req.body.field) + value;
            t.update(ref, {(req.body.field): (doc.data().(req.body.field) + value)});
            });
    }).then(function(result) {
        console.log('Transaction success!');
    }).catch(function(err) {
        console.log('Transaction failure:', err);
    });
    res.send("response");
});*/

router.post('/getUserInfo', function (req, res, next) {
    const document = db.doc('UserInfo/'+req.body.uid);
    let info=document.get()
        .then(function(documentSnapshot)
            {
                res.send(documentSnapshot.data());
            })
        .catch(function(err){console.log(err);});
        
});

module.exports = router;
