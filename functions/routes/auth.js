let https = require("https");
let express = require("express");
let router = express.Router();
let db = require("./users").db
let oneDrive = require("../OneDrive/graph");



// Template URI for Microsoft login 
// https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id={client_id}&scope={scope}&response_type=code&redirect_uri={redirect_uri}
// GET https://login.microsoftonline.com/common/oauth2/v2.0/logout?post_logout_redirect_uri={redirect-uri}

let appID = "e4317eeb-0fbb-491a-9cc7-2e0b13754393";
let scope = 'offline_access user.read calendars.read '
let tempScope = "files.readwrite.all"
let redirectURI = "http://localhost:5000/auth/openid/return"
let base = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=";

let login = encodeURI(base + appID + "&redirect_uri=" + redirectURI + "&response_type=token&scope=" + tempScope);
let logout = encodeURI("https://login.microsoftonline.com/common/oauth2/v2.0/logout?post_logout_redirect_uri=" + redirectURI)

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
        return res.status(200).send({ value: true });
    }).catch((err) => {
        console.log("Encountered error in /onedrive/sign-in", err);
        return res.status(302).send({ value: false });
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
    if (uid === undefined) {
        return res.status(500).send("UID was undefined.");
    }
    db.collection("oneDriveUsers").doc(uid).get().then((doc) => {
        if (!doc.exists) return res.status(200).send({ value: false });
        else return res.status(200).send({ value: true });
    }).catch((err) => {
        console.log("Error encountered in /onedrive/token", err)
        return res.status(500).send("Error");
    });
});

router.get("/onedrive/token/get", (req, res, next) => {
    let uid = req.query.uid;
    if (uid === undefined) {
        return res.status(500).send("UID was undefined.");
    }
    db.collection("oneDriveUsers").doc(uid).get().then((doc) => {
        if (!doc.exists) return res.status(200).send({ value: false });
        else return res.status(200).send(doc.data());
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
        return res.status(200).send({ value: true });
    }).catch((err) => {
        console.log("Error encountered while deleting file", err)
        return res.status(404).send({ value: false });
    });
});

router.get("/onedrive/signout", (req, res, next) => {
    // Remove users oneDrive file when user clicks sign out
    let uid = req.query.uid;
    console.log("GET SIGNOUT UID : ", req.query.uid);
    db.collection("oneDriveUsers").doc(uid).delete().then(() => {
        console.log("Deleted oneDrive user successfully.");
        return res.status(200).send({ value: true })
    }).catch((err) => {
        console.log("Error encountered while deleting file", err)
        return res.status(500).send({ value: false });
    });
});

router.post("/onedrive/getUser", (req, res, next) => {
    let token = req.body.token;
    if (token === undefined) return res.status(500).send("TOKEN WAS UNDEFINED");
    oneDrive.getUserDetails(token).then((profile) => {
        //console.log(profile);
        return res.status(200).send({ value: true, profile: profile });
    }).catch((err) => { return res.status(500).send("ERROR GETING USER DETAILS : /onedrive/getUser") });
});

// router.post("/onedrive/files", (req, res, next) => {
//     let token = req.body.token; 
//     if (token === null ) {
//         res.status(500).send("Error in /onedrive/files. Token was undefined.");
//     }
//     oneDrive.getRootFiles(token).then((files) => {
//         console.log(files);
//         return res.status(200).send({value: true, files: files.value});
//     }).catch((err) => res.status(500).send("Error encountered in getting root files.", err));
// })

router.post("/onedrive/files", (req, res, next) => {
    let token = req.body.token;
    if (token === null) {
        res.status(500).send("Error in /onedrive/files. Token was undefined.");
    }
    oneDrive.getRootFiles(token).then((files) => {
        console.log(files);
        let params = { active: { interfacePage: true } };
        params.odFiles = files.value;
        return res.status(200).render("interfacePage", params);
    }).catch((err) => res.status(500).send("Error encountered in getting root files.", err));
})

// router.post("/onedrive/files/:id", (req, res, next) => {
//     let token = req.body.token;
//     if (token === null ) {
//         res.status(500).send("Error in /onedrive/files/:id. Token was undefined.");
//     }
//     oneDrive.getFilesByPath(token, req.params.id).then((files) => {
//         return res.status(200).send({value: true, files: files.value});
//     }).catch((err) => res.status(500).send("Error encountered in getting root files.", err));
// });

router.post("/onedrive/files/:id", (req, res, next) => {
    let token = req.body.token;
    if (token === null) {
        res.send("Error in /onedrive/files/:id. Token was undefined.");
    }
    oneDrive.getFilesByPath(token, req.params.id).then((files) => {
        params = { active: { interfacePage: true } };
        params.odFiles = files.value;
        return res.status(200).render("interfacePage", params);
    }).catch((err) => {
        res.status(500).send("Error encountered in getting root files.", err)
    });
});

router.post("/onedrive/files/parent/:id", (req, res, next) => {
    let token = req.body.token;
    if (token === null) {
        res.send("Error in /onedrive/files/:id. Token was undefined.");
    }
    oneDrive.getParentFolder(token, req.params.id).then((files) => {
        console.log("Parent ID ",files.parentReference.id);
        return res.status(200).send({id: files.parentReference.id});
        //return res.status(200).render("interfacePage", params);
    }).catch((err) => {
        res.status(500).send("Error encountered in getting root files.", err)
    });
});

module.exports = router;