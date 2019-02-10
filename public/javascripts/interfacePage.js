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