var users;

$(document).ready(() =>{

    let url = window.location.toString();
    let index = url.indexOf("#");
    if (index >= 0){
        let token = parseToken(url, index);
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                let uid = user.uid;
                firebase.firestore().collection("oneDriveUsers").get().then((collection) =>{
                    console.log("Got docs from client SDK")
                    console.log(collection.docs);
                }).catch((err) => console.log("ENCOUNTERED ERROR IN oneDriveAuth.js\n" + err));

                $.ajax({
                    type: "POST",
                    url: "/auth/onedrive/addToken",
                    data: {token, uid},
                    dataType: "json",
                    success: function (response) {
                        console.log("Passed token to /users/onedrive/addToken")
                    }
                });
            }
            else console.log("NO USER SIGNED IN.");
        });
    }
});

function parseToken(url, startIndex){
    let trimmed = url.substr(startIndex+1)
    let split = trimmed.split("&");
    for(var string in split) {
        index = split[string].indexOf("=");
        split[string] = decodeURI(split[string].substr(index+1));

    }
    let token = {
        access_token: split[0],
        token_type : split[1],
        expires_in : split[2],
        scope: split[3]
    }

    console.log(token);
    return token;
}