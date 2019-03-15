let https = require("https");
let express = require("express");
let router = express.Router();
let graph = require("@microsoft/microsoft-graph-client");
let db = require("./users").db



// Template URI for Microsoft login 
// https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id={client_id}&scope={scope}&response_type=code&redirect_uri={redirect_uri}
// GET https://login.microsoftonline.com/common/oauth2/v2.0/logout?post_logout_redirect_uri={redirect-uri}

let appID = "e4317eeb-0fbb-491a-9cc7-2e0b13754393";
let scope = 'offline_access user.read calendars.read '
let tempScope = "files.readwrite.all"
let redirectURI = "http://localhost:5000/auth/openid/return"
let base = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=";

let login = encodeURI(base + appID + "&redirect_uri=" + redirectURI + "&response_type=token&scope=" + tempScope);
let logout = encodeURI("https://login.microsoftonline.com/common/oauth2/v2.0/logout?post_logout_redirect_uri="+ redirectURI) 

router.get("/signin", (req, res, next) => {
    res.status(200).redirect(login);
});

router.get("/signout", (req, res, next) => {
    res.status(200).redirect(logout);
});

router.get("/openid/return", (req, res, next) => {
    console.log("Returned to /OPENID/RETURN");
    return res.status(200).redirect("/users/interfacePage");
});

router.post("/onedrive/sign-in", (req, res, next) => {
    //Receives a token + uid from ajax function on interfacePage in req.body
    db.collection("oneDriveUsers").doc(req.body.uid).set({
        token: req.body.token,
        uid: req.body.uid
    }).then(() => {
        console.log("Signed OneDrive user!");
        return res.status(200).send({value: true});
    }).catch((err) => {
        console.log("Encountered error in /onedrive/sign-in", err);
        return res.status(302).send({value: false});
    });
});

router.get("/onedrive/checkExpiry", (req, res, next) => {
    let uid = req.query.uid;
    db.collection("oneDriveUsers").doc(uid).get().then((doc) => {
        if (!doc.exists) return res.send(null);
        let obj = JSON.stringify(doc.data());
        let json = JSON.parse(obj);
        return res.status(200).send(json);
    }).catch((err) => console.log("Error in oneDrive/checkExpiry", err));
});

router.get("/onedrive/token", (req, res, next) => {
    let uid = req.query.uid;
    if (uid === undefined){
        return res.status(500).send("UID was undefined.");
    }
    db.collection("oneDriveUsers").doc(uid).get().then((doc) => {
        if (!doc.exists) return res.status(200).send({value: false});
        else return res.status(200).send({value: true});
    }).catch((err) => {
        console.log("Error encountered in /onedrive/token", err)
        return res.status(500).send("Error");
    });
});

router.delete("/onedrive/signout", (req, res, next) => {
    // Remove users oneDrive file when token has expired
    let uid = req.body.uid;
    db.collection("oneDriveUsers").doc(uid).delete().then(() => {
        console.log("Deleted oneDrive user successfully.");
        return res.status(200).send({value: true});
    }).catch((err) => {
        console.log("Error encountered while deleting file", err)
        return res.status(404).send({value: false});
    });
});

router.get("/onedrive/signout", (req, res, next) => {
    // Remove users oneDrive file when user clicks sign out
    let uid = req.query.uid;
    console.log("GET SIGNOUT UID : ", req.query.uid);
    db.collection("oneDriveUsers").doc(uid).delete().then(() => {
        console.log("Deleted oneDrive user successfully.");
        return res.status(200).send({value: true})
    }).catch((err) => {
        console.log("Error encountered while deleting file", err)
        return res.status(500).send({value: false});
    });
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