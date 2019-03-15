
var oneDriveUsers;

let uid;
$(document).ready(() => {
    //jQuery(".loading").hide();

    // Check if user is logged in to OneDrive
    firebase.auth().onAuthStateChanged((user) => {
        //jQuery(".loading").show();
        if (user) {
            uid = user.uid;

            //Make sure there's a valid token for user, signs out user if he/she has token and it has expired.
            //Welcome to callback hell.
            hasToken(uid).then((result) => {                              // Returns a promise
                if (result === true) {

                    userLoggedIn();                                 // Sets OD button text and link to log out
                    hasTokenExpired(uid).then((result) => {
                        if (result === false) {             //Token was still valid
                            loadPage();
                            jQuery(".loading").hide();
                        }
                    }).catch((err) => console.error("Error in hasTokenExpired(uid) method.", err));
                }
                else {
                    //User does not have a token 
                    userLoggedOut();
                    // If redirected back to interface page from oneDrive auth, get token
                    let url = window.location.toString();
                    let index = url.indexOf("#");

                    if (index >= 0) {
                        let token = parseToken(url, index);
                        console.log("UID : ", uid);
                        $.ajax({
                            type: "POST",
                            url: "/auth/onedrive/sign-in",
                            data: { token, uid },
                            dataType: "json",
                            success: function (response) {
                                if (response.value === true) {
                                    console.log("Signed OneDrive user in...")
                                    //window.location = "/users/interfacePage";
                                    userLoggedIn();
                                    loadPage();
                                }
                                else {
                                    console.log("Failed to sign OneDrive user in...");
                                }
                            },
                            error: (err) => {

                            }
                        });
                    }
                }
            }).catch((err) => console.log("Error in hasToken(uid) method.", err));
        }
        else console.log("NO USER SIGNED IN.");
    });

});


function parseToken(url, startIndex) {
    let trimmed = url.substr(startIndex + 1)
    let split = trimmed.split("&");
    for (var string in split) {
        index = split[string].indexOf("=");
        split[string] = decodeURI(split[string].substr(index + 1));

    }
    let issued = Math.floor(new Date().getTime() / 1000);
    let expires = issued + parseInt(split[2]) - 60; // 3540 seconds ish / 59 mins ish


    let token = {
        access_token: split[0],
        token_type: split[1],
        expires_in: split[2],
        scope: split[3],
        issued: issued,
        expires: expires
    }

    //console.log(token);
    return token;
}
function hasTokenExpired(uid) {
    return new Promise((resolve, reject) => {

        // Use uid to query database and check oneDriveUsers docs for id
        $.ajax({
            type: "GET",
            url: "/auth/onedrive/checkExpiry",
            data: { uid: uid },
            dataType: "json",
            success: function (response) {
                // Access expiry time in seconds, if current time > expiry time delete user from db
                //console.log(response);

                let currentTime = Math.floor(new Date().getTime() / 1000);
                let string = JSON.stringify(response);
                let file = JSON.parse(string);

                if (currentTime > parseInt(file.token.expires)) {
                    // TOKEN HAS EXPIRED
                    signoutExpiredUser(uid);
                    resolve(true);
                }
                else {
                    //Still valid 
                    resolve(false);
                }
            },
            error: (err) => {
                console.log("DID NOT SUCCEED", err)
            }
        });
    })
}
function hasToken(uid) {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "GET",
            url: "/auth/onedrive/token",
            data: { uid: uid },
            dataType: "json",
            success: function (response) {
                if (response.value === true) {
                    console.log("OneDrive user is currently signed in.");
                    resolve(true);
                }
                else {
                    console.log("There is not a OneDrive user signed in.");
                    resolve(false);
                }
            }
        });

    });
}
function signoutExpiredUser(uid) {
    // TOKEN HAS EXPIRED
    console.log("OneDrive Token has expired.")
    $.ajax({
        type: "DELETE",
        url: "/auth/onedrive/signout",
        data: { uid: uid },
        dataType: "json",
        success: function (response) {
            if (response.value === true) {
                console.log("Successfully deleted oneDrive user")
                swal({
                    title: "Session Expired",
                    text: "Your OneDrive session has expired.\nPlease sign-in again.",
                    icon: "info"
                });
                userLoggedOut();
                jQuery("#files").html("");
            }
            else {
                console.log("Error. Did not delete oneDrive user.");
            }
        }
    });
}
function signoutUser(uid) {
    console.log("SIGN OUT USER ", uid);
    $.ajax({
        type: "GET",
        credentials: "",
        url: "/auth/onedrive/signout",
        data: { uid: uid },
        dataType: "json",
        success: function (response) {
            if (response.value === true) {
                userLoggedOut();
                swal("Success!", "You have signed out of OneDrive", "success");
                console.log("Signed OneDrive user out..");
                jQuery("#files").html("");

                //window.location.replace("/auth/signout");         // Takes you to microsoft sign out but has issues
            }
            else {
                console.log("Did not sign out user by deleting token properly.");
            }
        }
    });
}
function userLoggedOut() {
    $("#oneDriveAuth").attr("onclick", "window.location.replace('/auth/signin')");
    $("#oneDriveAuth").text("Sign-In");
    jQuery("#files").html("");
}
function userLoggedIn() {
    $("#oneDriveAuth").attr("onclick", "signoutUser('" + uid + "')");
    $("#oneDriveAuth").text("Sign-Out");
}

function getToken(uid) {
    // Make AJAX call to our server, get access token from database, store it locally for fast access
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "GET",
            url: "/auth/onedrive/token/get",
            data: { uid: uid },
            dataType: "json",
            success: function (response) {
                if (response.value === false) {          // User file did not exist
                    console.log("Could not get token from db. : getToken(uid)");
                    resolve(null);
                }
                console.log("Response", response);
                resolve(JSON.parse((JSON.stringify(response))));
            },
            error: (err) => {
                console.log("Error in getToken(uid)", err);
                resolve(null);
            }
        });
    });
}
function getProfile(token) {
    // Make call to user, send token and then make microsoft graph request 
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "POST",
            url: "/auth/onedrive/getUser",
            data: { token: token },
            dataType: "json",
            success: function (response) {
                if (response.value === false) {
                    console.log("Error : Did not get user details : oneDriveAuth.js -> getUser(token).");
                    resolve(null);
                }
                else {
                    resolve(response.profile);
                }
            },
            error: (err) => {
                console.log("Error in getUser(token)", err);
                resolve(null);
            }
        });
    });
}
function displayProfile() {
    jQuery("#files").html("<h2>Logged in as: " + oneDriveUsers.profile.displayName || oneDriveUsers.profile.userPrincipalName + "</h2>");
}
function loadPage() {
    getToken(uid).then((result) => {
        oneDriveUsers = result;
        getProfile(oneDriveUsers.token.access_token).then((profile) => {
            oneDriveUsers.profile = profile;
            console.log(oneDriveUsers);
            displayProfile();
            jQuery(".loading").hide();

        });
    });
}
