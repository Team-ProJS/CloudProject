var GoogleAuth;
var SCOPE = 'https://www.googleapis.com/auth/drive';
function handleClientLoad() {
    // Load the API's client and auth2 modules.
    // Call the initClient function after the modules load.
    gapi.load('client:auth2', initClient);
  }
function initClient(){

  var discoveryUrl = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';

	gapi.client.init({  //Start up client with credentials
    'apiKey':'AIzaSyD0DDd42dvcvFR0zb4ZsSFcBnHy3kUemoU',
    'discoveryDocs':[discoveryUrl],
		'clientId':'684132652830-gofob1h0fnmfcusfmq7lrhu9j5t0ek6p.apps.googleusercontent.com',
		'scope': SCOPE
		
	}).then(function(){
		GoogleAuth = gapi.auth2.getAuthInstance();

    GoogleAuth.isSignedIn.listen(updateSigninStatus);
    
    var user = GoogleAuth.currentUser.get();
    setSigninStatus();

    $('#sign-in-or-out-button').click(function(){ //Upon Click of button user gets asked for authorisation
      handleAuthClick();
      retrieveAllFiles();
    });
    $('revoke-access-button').click(function(){ //De-authorisation
      revokeAccess();
    });
    
	});

}

function handleAuthClick(){
  if(GoogleAuth.isSignedIn.get()){
    GoogleAuth.signOut();
  }else{
    GoogleAuth.signIn();
  }
}

function revokeAccess(){
  GoogleAuth.disconnect(); //Disconnects user from OAuth
}

function setSigninStatus(isSignedIn){
  var user = GoogleAuth.currentUser.get();
  var isAuthorized = user.hasGrantedScopes(SCOPE);
  if(isAuthorized){
    $('#sign-in-or-out-button').html('Sign out');  //If user logs in, change sign in button to sign out
      $('#revoke-access-button').css('display', 'inline-block'); //Make button visible
      $('#auth-status').html('You are currently signed in and have granted ' +
          'access to this app.');//Status is updated to reflect scopes granted
    } else {
      $('#sign-in-or-out-button').html('Sign In/Authorize'); //If user logs off, change sign out button to sign in
      $('#revoke-access-button').css('display', 'none'); // make invisble
      $('#auth-status').html('You have not authorized this app or you are ' +
          'signed out.');//Status is updated to reflect scopes granted
    }
  }
function updateSigninStatus(isSignedIn){
  setSigninStatus();
}

function retrieveAllFiles(callback){
  var retrievePageOfFiles = function(request, result){
    request.execute(function(resp){
      
      result = result.concat(resp.items);
      var nextPageToken = resp.nextPageToken;
      if(nextPageToken){
        request = gapi.client.drive.files.list({
          'pageToken': nextPageToken
        });
        retrievePageOfFiles(request, result);
      }else{
        callback(result);
      }
    });
    handleFileResults(result);
  }
  var initialRequest = gapi.client.drive.files.list();
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
}