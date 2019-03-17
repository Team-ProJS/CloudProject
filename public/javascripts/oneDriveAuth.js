
var oneDriveUsers = "";
let loggedIn = true;
jQuery("#files").hide();

let uid;
$(document).ready(() => {

    // Check if user is logged in to OneDrive
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            uid = user.uid;
            if (hasODToken()) {
                if (hasODTokenExpired()) {
                    sessionExpired();
                }
                else {
                    //Hasn't expired. Can make calls to OneDrive API with token 
                    isLoggedIn();
                    // Get Profile; 
                    let oneDrive = JSON.parse(localStorage.getItem("OneDrive"));
                    //console.log(oneDrive.access_token);
                    getRootFiles(oneDrive.access_token);
                    //console.log(oneDrive.access_token);
                    //getRootFiles(oneDrive.access_token).then((files) => {
                    //  oneDriveUsers.files = files;
                    //displayFiles(oneDrive.profile, files);
                    //getClickedFileID(oneDrive.access_token);
                    // getClickedFileID(oneDrive.access_token).then((idFiles) => {
                    //     displayFiles(oneDrive.profile, idFiles);
                    // }).catch((err) => console.log("Error in GetClickedFileID promise", err))    

                    //}).catch((err) => console.log("Error getting root files.", err));
                }
            }
            else {
                // User is not signed in to OneDrive
                isLoggedOut();
                // If redirected back to interface page from oneDrive auth, get token
                let url = window.location.toString();
                let index = url.indexOf("#");

                if (index >= 0) {
                    let token = parseToken(url, index);
                    oneDriveUsers = token;
                    //console.log("UID : ", uid);
                    //window.location = "/users/interfacePage";
                    getProfile(token.access_token).then((profile) => {
                        oneDriveUsers.profile = profile;
                        localStorage.setItem("OneDrive", JSON.stringify(oneDriveUsers));
                        getRootFiles(token.access_token);
                        isLoggedIn();
                        console.log("Signed OneDrive user in...")
                        // getRootFiles(token.access_token).then((files) => {
                        //     oneDriveUsers.files = files;
                        //     //displayFiles(profile, files);
                        //     isLoggedIn();
                        //     console.log("Signed OneDrive user in...")
                        // })
                    });
                    //loadPage();
                }

            }
        }


        //Make sure there's a valid token for user, signs out user if he/she has token and it has expired.
        //Welcome to callback hell.
        //     hasToken(uid).then((result) => {                              // Returns a promise
        //         if (result === true) {
        //             isLoggedIn();                                 // Sets OD button text and link to log out
        //             hasTokenExpired(uid).then((result) => {
        //                 if (result === false) {             //Token was still valid
        //                     loadPage();
        //                     jQuery(".loading").hide();
        //                 }
        //                 jQuery(".loading").hide();
        //             }).catch((err) => console.error("Error in hasTokenExpired(uid) method.", err));
        //         }
        //         else {
        //             //User does not have a token 
        //             isLoggedOut();
        //             // If redirected back to interface page from oneDrive auth, get token
        //             let url = window.location.toString();
        //             let index = url.indexOf("#");

        //             if (index >= 0) {
        //                 let token = parseToken(url, index);
        //                 console.log("UID : ", uid);
        //                 $.ajax({
        //                     type: "POST",
        //                     url: "/auth/onedrive/sign-in",
        //                     data: { token, uid },
        //                     dataType: "json",
        //                     success: function (response) {
        //                         if (response.value === true) {
        //                             console.log("Signed OneDrive user in...")
        //                             //window.location = "/users/interfacePage";
        //                             isLoggedIn();
        //                             loadPage();
        //                         }
        //                         else {
        //                             console.log("Failed to sign OneDrive user in...");
        //                         }
        //                     },
        //                     error: (err) => {

        //                     }
        //                 });
        //             }
        //         }
        //     }).catch((err) => console.log("Error in hasToken(uid) method.", err));
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
function hasODTokenExpired() {
    // Check if it is valid.
    let token = JSON.parse(localStorage.getItem("OneDrive"));
    let expiryTime = token.expires;
    let currentTime = Math.floor(new Date().getTime() / 1000);

    if (currentTime > parseInt(expiryTime)) {
        // TOKEN HAS EXPIRED
        //signoutExpiredUser(uid);
        return true;
    }
    else {
        //Still valid 
        return false;
    }
}
function signOutOneDrive() {
    localStorage.removeItem("OneDrive");
    isLoggedOut();
    swal("Success!", "You have signed out of OneDrive", "success");
    console.log("Signed OneDrive user out..");
    jQuery("#driveTitle").html("");
    //document.getElementById("tableFiles").innerHTML = "";
    jQuery("#files").hide();
    //window.location.replace("/auth/signout");         // Takes you to microsoft sign out but has issues
}
function sessionExpired() {
    localStorage.removeItem("OneDrive");
    swal({
        title: "Session Expired",
        text: "Your OneDrive session has expired.\nPlease sign-in again.",
        icon: "info"
    });
    isLoggedOut();
    //document.getElementById("tableFiles").innerHTML = "";
    jQuery("#files").hide();
    //jQuery("#files").html("");
}

function hasODToken() {
    // Check local storage for OneDrive entry, if it exists, try to retrieve accessToken
    if (localStorage.getItem("OneDrive")) {
        return true;
    }
    else { // Local storage empty, hasn't been signed in yet.
        return false;
    }
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
                isLoggedOut();
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
                isLoggedOut();
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
function isLoggedOut() {
    $("#oneDriveAuth").attr("onclick", "window.location.replace('/auth/signin')");
    $("#oneDriveAuth").text("Sign-In");
    jQuery(".loading").hide();
    //jQuery("#files").hide();

    //jQuery("#files").html("");
}
function isLoggedIn() {
    // $("#oneDriveAuth").attr("onclick", "signoutUser('" + uid + "')");
    $("#oneDriveAuth").attr("onclick", "signOutOneDrive()")
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
function displayFiles(profile, files) {
    //jQuery("#files").html("<h2>" + (profile.displayName || profile.userPrincipalName) + "\'s files: </h2>" );
    jQuery("#driveTitle").html("<h1>" + (profile.givenName || profile.userPrincipalName) + "\'s OneDrive: </h1>");
    //jQuery("#files").load("/templates/fileTemplate.hbs");
    jQuery(".loading").hide();
    jQuery("#files").show();
    console.log(files);


    // Creating HTML for each file and calculating creation date and size
    let html = "<tr id='" + files[0].parentReference.id + "' class='files'><td><a href='#'>../</td><td></td><td></td><td></td></tr>";
    for (var file = 0; file < files.length; file++) {
        let tempSize = Math.floor((files[file].size / 1024) / 1024);        // originally bytes, now in MB
        let sizeSuffix = "";

        if (tempSize < 1024) {
            sizeSuffix = " MB"
        }
        else {
            sizeSuffix = " GB"
            tempSize /= 1024;
            tempSize = Math.round(tempSize * 10) / 10
        }
        html += "<tr id='" + files[file].id + "' class='files'>" +
            "<td>" + files[file].name + "</td>" +
            "<td>" + files[file].createdDateTime + "</td>" +
            "<td>" + tempSize + sizeSuffix + "</td>" +
            "<td><a href='" + files[file].webUrl + "'>Link</td>" +
            "</tr>"
    }
    try {
        document.getElementById("tableFiles").innerHTML = html;
        console.log(document.getElementById("tableFiles"))
    }
    catch (error) {
        console.log("Error getting table ID", error)
    }
}
function loadDetails() {

}
function loadPage() {
    getToken(uid).then((token) => {
        oneDriveUsers = token;
        getProfile(oneDriveUsers.token.access_token).then((profile) => {
            oneDriveUsers.profile = profile;
            localStorage.setItem("OneDrive", JSON.stringify(oneDriveUsers));
            console.log(oneDriveUsers);
            displayFiles(profile);
            jQuery(".loading").hide();
        });
    });
}
function getRootFiles(token) {
    if (hasODTokenExpired(token)) {
        sessionExpired();
    }
    else {
        $.ajax({
            type: "POST",
            url: "/auth/onedrive/files",
            data: { token: token },
            async: false,
            success: function (response) {
                if (response.value === false) {
                    // Could not get files
                    console.log(response)
                }
                else {
                    let responseTable = document.createElement("html");
                    responseTable.innerHTML = response;
                    let rawTable = responseTable.getElementsByClassName("table")[0].innerHTML;
                    document.getElementsByTagName("table")[0].innerHTML = rawTable;
                    $(".loading").hide();
                    jQuery("#files").show();
                    getClickedFileID(token);
                }
            },
            error: (err) => {
                console.log("ERROR! Something went wrong in /auth/onedrive/files.", err);
            }
        });
    }
}

function getParentFIle(token) {
    //Make ajax call to get parentReference for selected file
    $(".parentID").dblclick(() => {
        let parentID = $(".parentID").attr('id');
        if (parentID !== undefined) {
            $.ajax({
                type: "POST",
                url: "/auth/onedrive/files/parent/" + parentID,
                data: { token: token },
                dataType: "json",
                async: false,
                success: function (response) {

                    parentID = response.id;
                    if (parentID === undefined) return console.log("ParentID is undefined.");
                    console.log(response);
                    getClickedFileID(token, parentID);

                }
            });
        }
    });
}

function getClickedFileID(token, parentID) {
    if(hasODTokenExpired(token)){
        return sessionExpired();
    }
    $(".loading").show();
    if (parentID === undefined) {
        $(".files").dblclick(function () {
            let fileID = $(this).attr('id');
            console.log(fileID);
            $.ajax({
                type: "POST",
                url: "/auth/onedrive/files/" + fileID,
                data: { token: token, id: fileID },
                async: false,
                success: function (response) {
                    if (response.value === false) {
                        console.log("Could not get files by ID");
                    }
                    else {
                        //creating new html element so that I can access properties
                        let responseTable = document.createElement("html")
                        // Full HTML page that was return in AJAX call
                        responseTable.innerHTML = response;
                        // Just getting the bit that was changed
                        let rawTable = responseTable.getElementsByClassName("table")[0].innerHTML;
                        // Replacing existing HTML with new data 
                        document.getElementsByTagName("table")[0].innerHTML = rawTable;
                        $(".loading").hide();
                        jQuery("#files").show();
                        getClickedFileID(token);
                        getParentFIle(token);
                    }
                },
                error: (error) => {
                    console.log("Error getting files by ID function ", error);
                }
            });
        })
    }
    else if (parentID) {
        $.ajax({
            type: "POST",
            url: "/auth/onedrive/files/" + parentID,
            data: { token: token, id: parentID },
            async: false,
            //dataType: "html",
            success: function (response) {
                if (response.value === false) {
                    console.log("Could not get files by ID");
                }
                else {
                    //creating new html element so that I can access properties
                    let responseTable = document.createElement("html")
                    // Full HTML page that was return in AJAX call
                    responseTable.innerHTML = response;
                    // Just getting the bit that was changed
                    let rawTable = responseTable.getElementsByClassName("table")[0].innerHTML;
                    // Replacing existing HTML with new data 
                    document.getElementsByTagName("table")[0].innerHTML = rawTable;
                    jQuery("#files").show();
                    $(".loading").hide();
                    getClickedFileID(token);
                    getParentFIle(token);
                }
            },
            error: (error) => {
                console.log("Error getting files by ID function ", error);
            }
        });
    }
    $(".loading").hide();

}
