/*                                                                                          Google Drive API                                                                                          */

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
      //retrieveAllFiles();
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
  GoogleAuth.disconnect(); //Disconnects Google Api  from OAuth
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

/*                                                                                          Firebase Storage                                                                                          */
var uploader = document.getElementById('uploader');
var fileButton = document.getElementById('fileButton');

fileButton.addEventListener('change', function(e){

  var file = e.target.files[0];
  var storageRef = firebase.storage().ref('test/' +file.name);
  var task = storageRef.put(file);

  task.on('state_changed',
    function progress(snapshot){
      var precentage = (snapshot.bytesTransferred/snapshot.totalBytes)*100;
      uploader.value = precentage;
    },
    function error(err){

    },
    function complete(){

    }
  );
});
/*                                                                                         DropBox API                                                                                         */
var CLIENT_ID ='1qwuqul2z1v27e1';
var dbx;

function getAccessTokenFromUrl(){
  return utils.parseQueryString(window.location.hash).access_token;
}

function isAuthenticated(){
  return !!getAccessTokenFromUrl();
}
var StringOutput = " ";
function renderItems(items){
  
  items.forEach(function(item){
    console.log(item);
    if(item.hasOwnProperty('rev')){
      console.log("I AM A FILE");
    }else{
      console.log("I AM A FOLDER");
      dbx.filesListFolder({path: ''+item.path_lower+''}).then(function(response){
        renderItems(response.entries);
      }).catch(function(error){
        console.error(error);
      });
    }
    var name = JSON.stringify(item.path_lower);
        StringOutput += "<li class = 'derp'  name='" +name+" '  >" + item.name + "</li>";
        StringOutput +="<li >"+item.path_lower+"</li>";
  });

  var fileContainer = document.getElementById('files');
  fileContainer.innerHTML = StringOutput;
 
}


var currPath;

document.addEventListener('click', function(e) {
  e = e || window.event;
  var target = e.target || e.srcElement,
   currPath = target.textContent || target.innerText;   
    //text = target.name;
      console.log(currPath);
}, false);

function showPageSection(elementId){
  document.getElementById(elementId).style.display ='block';
}

if(isAuthenticated()){
  showPageSection('authed-section');
   dbx = new Dropbox.Dropbox({ accessToken: getAccessTokenFromUrl() });
  dbx.filesListFolder({path: ''}).then(function(response){
    renderItems(response.entries);
  }).catch(function(error){
    console.error(error);
  });
}else{
  showPageSection('pre-auth-section');
   dbx = new Dropbox.Dropbox({ clientId: CLIENT_ID });
      var authUrl = dbx.getAuthenticationUrl('https://cloudjs-projs.firebaseapp.com/interfacePage');
      document.getElementById('authlink').href = authUrl;
}

function downloadFile(){
  dbx = new Dropbox.Dropbox({ accessToken: getAccessTokenFromUrl() });
  dbx.filesDownload({path:'/new page.txt'
}).then(function(response){
  var results = document.getElementById('results');
  results.appendChild(document.createTextNode('File Downloaded!'));
  console.log(response);
  uploadToFirebase(response);

}).catch(function(error){
  console.error(error);
});
return false;
}

function uploadToFirebase(file){
  var storageRef = firebase.storage().ref('test/' +file.name);
  var task = storageRef.put(file.fileBlob);

  task.on('state_changed',
  function progress(snapshot){
     var precentage = (snapshot.bytesTransferred/snapshot.totalBytes)*100;
      uploader.value = precentage;
  },
  function error(err){

  },
  function complete(){

  }
  );

}

function uploadToDropBox(file){
  const UPLOAD_FILE_SIZE_LIMIT = 150*1024*1024;

  if(file.size < UPLOAD_FILE_SIZE_LIMIT){
    dbx.filesUpload({path: '/' + file.name, contents: file}).then(function(response){
      console.log('File Uploaded');
      console.log(response);
    }).catch(function(error){
      console.eroor(error);
    });
  }else{
    const maxBlob = 8*1000*1000;
    var workItems = [];
    var offset = 0;
    while(offset < file.size){
      var chunkSize = Math.min(maxBlob, file.size - offset);
      workItems.push(file.slice(offset, offset + chunkSize));
      offset += chunkSize;
    }
    const task = workItems.reduce((acc, blob, idx, items) => {
      if (idx == 0) {
        // Starting multipart upload of file
        return acc.then(function() {
          return dbx.filesUploadSessionStart({ close: false, contents: blob})
                    .then(response => response.session_id)
        });          
      } else if (idx < items.length-1) {  
        // Append part to the upload session
        return acc.then(function(sessionId) {
         var cursor = { session_id: sessionId, offset: idx * maxBlob };
         return dbx.filesUploadSessionAppendV2({ cursor: cursor, close: false, contents: blob }).then(() => sessionId); 
        });
      } else {
        // Last chunk of data, close session
        return acc.then(function(sessionId) {
          var cursor = { session_id: sessionId, offset: file.size - blob.size };
          var commit = { path: '/' + file.name, mode: 'add', autorename: true, mute: false };              
          return dbx.filesUploadSessionFinish({ cursor: cursor, commit: commit, contents: blob });           
        });
      }          
    }, Promise.resolve());
    
    task.then(function(result) {
      var results = document.getElementById('results');
      results.appendChild(document.createTextNode('File uploaded!'));
    }).catch(function(error) {
      console.error(error);
    });
    
  }
  return false;
  
}
fileButton2.addEventListener('change', function(e){

  var file = e.target.files[0];
uploadToDropBox(file);
});