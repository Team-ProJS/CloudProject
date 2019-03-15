var users;

let uid;
$(document).ready(() => {


    // Check if user is logged in to OneDrive
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            //console.log("USER ", user);
            uid = user.uid;
            //console.log("UID ", uid)

            //Make sure there's a valid token for user, signs out user if he/she has token and it has expired.
            hasToken(uid).then((result) => {                              // Returns a promise
                if (result === true) {
                    //console.log("RESULT OF HASTOKEN : ", result);
                    $("#oneDriveAuth").attr("onclick", "signoutUser('" + uid + "')");
                    $("#oneDriveAuth").text("Sign-Out");
                    hasTokenExpired(uid);
                }
                else {
                    $("#oneDriveAuth").attr("onclick", "window.location.replace('/auth/signin')");
                    $("#oneDriveAuth").text("Sign-In");
                }
            });
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
                            $("#oneDriveAuth").attr("onclick", "signoutUser('" + uid + "')");
                            $("#oneDriveAuth").text("Sign-Out");
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
                    console.log("OneDrive Token has expired.")
                    $.ajax({
                        type: "DELETE",
                        url: "/auth/onedrive/signout",
                        data: { uid: uid },
                        dataType: "text",
                        success: function (response) {
                            if (response.value === true) {
                                console.log("Successfully deleted oneDrive user")
                                // redirect to microsoft logout after deleting token
                                window.location.replace("/auth/signout");
                                resolve(true);
                            }
                            else {
                                console.log("Error. Did not delete oneDrive user.");
                                resolve(false);
                            }
                        }
                    });
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
                    console.log("RESPONSE: ", response);
                    console.log("Response.value: ", response.value);
                    console.log("TRUE! USER HAS TOKEN");
                    resolve(true);
                }
                else {
                    console.log("FALSE! USER HAS NO TOKEN");
                    resolve(false);
                }
            }
        });

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
            if (response.value === true)
                window.location.replace("/auth/signout");
            else {
                console.log("Did not sign out user by deleting token properly.");
            }
        }
    });
}