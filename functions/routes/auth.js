let https = require("https");
let express = require("express");
let router = express.Router(); 
let graph = require("@microsoft/microsoft-graph-client");
var admin = require("firebase-admin");
var serviceAccount = require("./adminsdk.json");
var oneDriveAdmin = require("./users");

var admin = require("firebase-admin");
var serviceAccount = require("./OD_Service_Account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://cloudjs-projs.firebaseio.com"
}, "onedrive");
    
var db = admin.firestore();

// Template URI for Microsoft login 
 // https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id={client_id}&scope={scope}&response_type=code&redirect_uri={redirect_uri}

let appID = "e4317eeb-0fbb-491a-9cc7-2e0b13754393";
let scope = 'offline_access user.read calendars.read '
let tempScope = "files.readwrite.all"
let redirectURI = "http://localhost:5000/auth/openid/return"
let base = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=";

let login = encodeURI(base + appID + "&redirect_uri=" + redirectURI + "&response_type=token&scope=" + tempScope);

router.get("/signin", (req, res, next) => {
    https.get(login, (response) => {
        if (response) res.redirect(login);
    });
});

router.get("/openid/return", (req, res, next) => {
    console.log("Returned to /OPENID/RETURN");
    res.status(200);
    return res.redirect("/users/interfacePage");
});

router.post("/onedrive/addToken", (req, res, next) => {
    //Receives a token + uid from ajax function on interfacePage in req.body
    console.log("GOT TO ONEDRIVE ADD TOKEN ROUTE")
    // let odTokenString = JSON.stringify(req.body.token);
    // let odTokenObject = JSON.parse(odTokenString);

    // let uidString = JSON.stringify(req.body.uid);
    // let uidObject = JSON.parse(uidString);

    // db.collection("oneDriveUsers").get().then((doc) => {
    //     if(!doc) console.log("NO DOCUMENT FOUND ")
    //     console.log("COLLECTION EXISTS" );
    // },(rejected) => {
    //     console.log(rejected) 
    // }).catch((err) => console.log(err))

    res.redirect("/")

});


function getAuthenticatedClient(accessToken) {
    // Initialize Graph client
    const client = graph.Client.init({
        // Use the provided access token to authenticate
        // requests
        authProvider: (done) => {
            done(null, accessToken);
        }
    });
    
    return client;
}


module.exports = router;