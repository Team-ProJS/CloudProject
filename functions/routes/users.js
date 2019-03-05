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

/*{
    "email":email
}*/
router.post('/createUserInfo', function (req, res, next) {
    let documentRef = db.doc('UserInfo/'+req.body.email);

documentRef.get().then(function(documentSnapshot){
  if (!documentSnapshot.exists) {
                    var docRef = db.collection('UserInfo').doc(req.body.email);
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
        });
    res.send("response");
});

/*{
    "email":email
}*/
router.post('/getUserInfo', function (req, res, next) {
    const document = db.doc('UserInfo/'+req.body.email);
    let info=document.get()
        .then(function(documentSnapshot)
            {
                res.send(documentSnapshot.data());
            })
        .catch(function(err){console.log(err);});
        
});


/*{
    "email":email,
    "value":13.5(this is an example, put any num)
}*/
router.post('/pcT', function (req, res, next) {
    var ref = db.collection('UserInfo').doc(req.body.email);
    var value=req.body.value;
    
    var transaction = db.runTransaction(function(t) {
            return t.get(ref)
        .then(function(doc) {
            var curr = doc.data().pCloudTransfer + value;
            t.update(ref, {pCloudTransfer: curr});
            });
    }).then(function(result) {
        console.log('Transaction success!');
    }).catch(function(err) {
        console.log('Transaction failure:', err);
    });
    res.send("response");
});
router.post('/pcU', function (req, res, next) {
    var ref = db.collection('UserInfo').doc(req.body.email);
    var value=req.body.value;
    
    var transaction = db.runTransaction(function(t) {
            return t.get(ref)
        .then(function(doc) {
            var curr = doc.data().pCloudUpload + value;
            t.update(ref, {pCloudUpload: curr});
            });
    }).then(function(result) {
        console.log('Transaction success!');
    }).catch(function(err) {
        console.log('Transaction failure:', err);
    });
    res.send("response");
});

router.post('/odT', function (req, res, next) {
    var ref = db.collection('UserInfo').doc(req.body.email);
    var value=req.body.value;
    
    var transaction = db.runTransaction(function(t) {
            return t.get(ref)
        .then(function(doc) {
            var curr = doc.data().oneDriveTransfer + value;
            t.update(ref, {oneDriveTransfer: curr});
            });
    }).then(function(result) {
        console.log('Transaction success!');
    }).catch(function(err) {
        console.log('Transaction failure:', err);
    });
    res.send("response");
});
router.post('/odU', function (req, res, next) {
    var ref = db.collection('UserInfo').doc(req.body.email);
    var value=req.body.value;
    
    var transaction = db.runTransaction(function(t) {
            return t.get(ref)
        .then(function(doc) {
            var curr = doc.data().oneDriveUpload + value;
            t.update(ref, {oneDriveUpload: curr});
            });
    }).then(function(result) {
        console.log('Transaction success!');
    }).catch(function(err) {
        console.log('Transaction failure:', err);
    });
    res.send("response");
});
router.post('/odD', function (req, res, next) {
    var ref = db.collection('UserInfo').doc(req.body.email);
    var value=req.body.value;
    
    var transaction = db.runTransaction(function(t) {
            return t.get(ref)
        .then(function(doc) {
            var curr = doc.data().oneDriveDownload + value;
            t.update(ref, {oneDriveDownload: curr});
            });
    }).then(function(result) {
        console.log('Transaction success!');
    }).catch(function(err) {
        console.log('Transaction failure:', err);
    });
    res.send("response");
});

router.post('/gdT', function (req, res, next) {
    var ref = db.collection('UserInfo').doc(req.body.email);
    var value=req.body.value;
    
    var transaction = db.runTransaction(function(t) {
            return t.get(ref)
        .then(function(doc) {
            var curr = doc.data().gDriveTransfer + value;
            t.update(ref, {gDriveTransfer: curr});
            });
    }).then(function(result) {
        console.log('Transaction success!');
    }).catch(function(err) {
        console.log('Transaction failure:', err);
    });
    res.send("response");
});
router.post('/gdU', function (req, res, next) {
    var ref = db.collection('UserInfo').doc(req.body.email);
    var value=req.body.value;
    
    var transaction = db.runTransaction(function(t) {
            return t.get(ref)
        .then(function(doc) {
            var curr = doc.data().gDriveUpload + value;
            t.update(ref, {gDriveUpload: curr});
            });
    }).then(function(result) {
        console.log('Transaction success!');
    }).catch(function(err) {
        console.log('Transaction failure:', err);
    });
    res.send("response");
});
router.post('/gdD', function (req, res, next) {
    var ref = db.collection('UserInfo').doc(req.body.email);
    var value=req.body.value;
    
    var transaction = db.runTransaction(function(t) {
            return t.get(ref)
        .then(function(doc) {
            var curr = doc.data().gDriveDownload + value;
            t.update(ref, {gDriveDownload: curr});
            });
    }).then(function(result) {
        console.log('Transaction success!');
    }).catch(function(err) {
        console.log('Transaction failure:', err);
    });
    res.send("response");
});

router.post('/dbT', function (req, res, next) {
    var ref = db.collection('UserInfo').doc(req.body.email);
    var value=req.body.value;
    
    var transaction = db.runTransaction(function(t) {
            return t.get(ref)
        .then(function(doc) {
            var curr = doc.data().dBoxTransfer + value;
            t.update(ref, {dBoxTransfer: curr});
            });
    }).then(function(result) {
        console.log('Transaction success!');
    }).catch(function(err) {
        console.log('Transaction failure:', err);
    });
    res.send("response");
});
router.post('/dbU', function (req, res, next) {
    var ref = db.collection('UserInfo').doc(req.body.email);
    var value=req.body.value;
    
    var transaction = db.runTransaction(function(t) {
            return t.get(ref)
        .then(function(doc) {
            var curr = doc.data().dBoxUpload + value;
            t.update(ref, {dBoxUpload: curr});
            });
    }).then(function(result) {
        console.log('Transaction success!');
    }).catch(function(err) {
        console.log('Transaction failure:', err);
    });
    res.send("response");
});
router.post('/dbD', function (req, res, next) {
    var ref = db.collection('UserInfo').doc(req.body.email);
    var value=req.body.value;
    
    var transaction = db.runTransaction(function(t) {
            return t.get(ref)
        .then(function(doc) {
            var curr = doc.data().dBoxDownload + value;
            t.update(ref, {dBoxDownload: curr});
            });
    }).then(function(result) {
        console.log('Transaction success!');
    }).catch(function(err) {
        console.log('Transaction failure:', err);
    });
    res.send("response");
});

module.exports = router;
