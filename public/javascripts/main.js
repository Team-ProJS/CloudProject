AOS.init();
/*
var GOOGLE_OATH_SCOPES = 'email, https://www.googleapis.com/auth/drive';
var FIREBASE_URL = "https://cloudjs-projs.firebaseapp.com/";

function handleClientLoad(){
	gapi.client.load('drive','v2',handleDriveLoad);
	console.log("Got here");
}

function handleDriveLoad(){
	var ref = new Firebase(FIREBASE_URL);
	ref.onAuth(function(authData){

		if(authData && authData.google){
			return handleFirebaseAuthData(null,authData);
		}

		ref.authWithOAuthPopup(
			"google",
			handleFirebaseAuthData,
			{scope: GOOGLE_OATH_SCOPES}
		);
	});
}

function handleFirebaseAuthData(error, authData){
	if(error){
		return console.log("Login Failed", error);
	}

	console.log("Authenticated successfully with payload:", authData);

	var tokenObject = {
		access_token: authData.google.accessToken
	};

	gapi.auth.setToken(tokenObject);

	retrieveAllFiles();
}

function retrieveAllFiles(){
	var retrievePageOfFiles = function(request){
		request.execute(function(resp){
			handleFileResults(resp.items);
			var nextPageToken = resp.nextPageToken;
			if(nextPageToken){
				request = gapi.client.drive.files.list({
					'maxResults': 50,
					'pageToken': nextPageToken
				});
				retrievePageOfFiles(request);
			}
		});
	};
	var initialRequest = gapi.client.drive.files.list({maxResults: 50});
	retrievePageOfFiles(initialRequest, []);
}

function handleFileResults(result){
	console.log('Got files', result);

	result.forEach(function(file){
		var div = document.createElement('div');
		var link = document.createElement('a');
		link.href = file.alternateLink;

		var icon = document.createElement('img');
		icon.src = file.iconLink;

		var title = document.createElement('span');
		title.innerHTML = file.title;

		link.appendChild(icon);
		link.appendChild(title);
		div.appendChild(link);
		document.body.appendChild(div);
	});
}*/
