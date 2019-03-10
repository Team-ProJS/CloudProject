/***********************************************************************************************
 * 
 *            This section contains the front-end dependant JAVASCRIPT
 * 
 ************************************************************************************************/

$(document).ready(function () {
  /* This on click the button, will expand navbar, and change the
  profile size */

  $('#sidebarCollapse').on('click', function () {
      $('#sidebar').toggleClass('active');
  });
  $('#toolbarBtn, #toolbarsBtn').on('click',function() {
      $('.toolSection').toggleClass('remove');
      $('.header').toggle();
  })

  /* tooltip */
  $('[data-toggle="tooltip"]').tooltip();
  

});

/***********************************************************************************************
 * 
 *            This section contains the SDK interaction. :
 *                                                          Google
 *                                                          Firebase
 *                                                          Dropbox                 
 * 
 ************************************************************************************************/

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
    } else {
      $('#sign-in-or-out-button').html('Sign In'); //If user logs off, change sign out button to sign in
      $('#revoke-access-button').css('display', 'none'); // make invisble
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
//Client ID of the Dropbox App
var CLIENT_ID ='1qwuqul2z1v27e1';
//Dropbox Object used for api calls
var dbx;

 //Function to call parser for access token
function getAccessTokenFromUrl(){
  return utils.parseQueryString(window.location.hash).access_token;
}
 //Function to check Auth
function isAuthenticated(){
  return !!getAccessTokenFromUrl();
}
//Function for rendering files in DB
function renderItems(items){ 
  var location = $('#files');
  location.empty();
  location.append($('<div class="fileTitle pt-3 pl-5 ml-2"> <p> View Dropbox items.. </p></div>')); // header
    location.append($('<div class="greyFileSec" />').append($('<a href="javascript:;">...</a>').on('click',function(e){   // routing ' ...'
      dbx.filesListFolder({path: ''}).then(function(response){
        renderItems(response.entries);
      }).catch(function(error){
        console.error(error);
      });
    })
    ));
    var counter = 1; 
  items.forEach(function(item){
    console.log(item);
    if ( (counter%2) == 1) {
      var count = "whiteFileSec";
    }
    else {
      count = "greyFileSec";
    }
    //
    if(item.hasOwnProperty('rev')){
      console.log("I AM A FILE");
      //
      location.append($('<div class="'+ count+'"/>').append($('<img class=" pl-5 iconImg" src="/images/imgIcon.png"/>')).append($('<span/>').text(item.name)).append(' | ').append($('<a href="javascript:;">Download</a>').on('click',function(e){
        console.log('Clicked on: ', item.path_lower);
        downloadDBXSFile(item.path_lower);
      })
      ).append(' | ').append($('<a href="javascript:;">Delete</a>').on('click',function(e){
        deleteDBXFile(item.path_lower);
        dbx.filesListFolder({path: ''}).then(function(response){
          renderItems(response.entries);
        }).catch(function(error){
          console.error(error);
        });
      })).append(" | ").append($('<a href="javascript:;">Rename</a>').on('click', function(e){
        renameDBXFile(item.path_lower);
        dbx.filesListFolder({path: ''}).then(function(response){
          renderItems(response.entries);
        }).catch(function(error){
          console.error(error);
        });
      }))
      );
    }else{
      console.log("I AM A FOLDER");
      //
      location.append($('<div class="'+ count +'"/>').append($('<img class="pl-5 iconImg" src="/images/folderIcon.png"/>')).append($('<span/>').text(item.name)).append(' | ').append($('<a href="javascript:;">Enter Folder</a>').on('click',function(e){
        console.log('Clicked on: ', item.path_lower);
        dbx.filesListFolder({path: ''+item.path_lower}).then(function(response){
          renderItems(response.entries);
        }).catch(function(error){
          console.error(error);
        });
      })
      )
      );
    }
    counter++;
  });
}
 /*Temp Function to add listener to Files
var currPath ="/mystuff/graph.fig";
files.addEventListener('click', function(e){
  currPath = e.target.innerText;
  console.log(currPath);
});
*/
 //Function to show hidden elements
function showPageSection(elementId){
  document.getElementById(elementId).style.display ='block';
}
 //Function that is called upon auth
if(isAuthenticated()){
   dbx = new Dropbox.Dropbox({ accessToken: getAccessTokenFromUrl() });
  dbx.filesListFolder({path: ''}).then(function(response){
    renderItems(response.entries);
  }).catch(function(error){
    console.error(error);
  });
}else{
   dbx = new Dropbox.Dropbox({ clientId: CLIENT_ID });
      var authUrl = dbx.getAuthenticationUrl('https://cloudjs-projs.firebaseapp.com/users/interfacePage');
      document.getElementById('authlink').href = authUrl;
}
//Function to delete DB file that is at specified path
function deleteDBXFile(path){ 
  dbx = new Dropbox.Dropbox({ accessToken: getAccessTokenFromUrl() });
  dbx.filesDelete({path:""+path});
  alert("File at: "+path +" has been deleted");
}
//Function to rename DB file that is at specified path
function renameDBXFile(path){
var dest = prompt("Enter the new name", ""+path);
alert(dest);
if(dest == null || dest == ""){
  alert("Got error");
  return;
}
dbx.filesMoveV2({from_path:path, to_path:dest});
}
 //Function to download a DB file to the browser
function downloadDBXSFile(path){
  dbx = new Dropbox.Dropbox({ accessToken: getAccessTokenFromUrl() });
  alert("Current pathfile: "+path);
  dbx.filesDownload({path:""+path
}).then(function(response){
  console.log(response);
  if(navigator.msSaveBlob){
    return navigator.msSaveBlob(response.content, response.name);
  }else{
    let link = document.createElement('a');
    link.href = window.URL.createObjectURL(response.fileBlob);
    link.download = response.name;
    document.body.appendChild(link);
    link.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true, view: window}));
    link.remove();
    window.URL.revokeObjectURL(link.href);
  }
}).catch(function(error){
  console.error(error);
});
return false;
}
 //Function to transfer files from DB to Firebase
function transferFile(){
  dbx = new Dropbox.Dropbox({ accessToken: getAccessTokenFromUrl() });
  alert("Current pathfile: "+currPath);
  dbx.filesDownload({path:""+currPath
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
 //Function to upload file to firebase
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
//Function to upload file to DB
function uploadToDropBox(file){ 
  const UPLOAD_FILE_SIZE_LIMIT = 150*1024*1024;
  if(file.size < UPLOAD_FILE_SIZE_LIMIT){
    dbx.filesUpload({path: '/' + file.name, contents: file}).then(function(response){
      console.log('File Uploaded');
      console.log(response);
      alert("File with name: "+file.name+" has been uploaded to your dropbox account!\nRe-Auth to view updated list of files.");
    }).catch(function(error){
      console.error(error);
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
//Starts upload to DB through uploader
uploadToDB.addEventListener('change', function(e){ 
  var file = e.target.files[0];
uploadToDropBox(file);
});
//Function to revoke access Token to DB
function revokeDB(){
  dbx.authTokenRevoke();
 document.getElementById("files").style.display = "none";
 window.history.replaceState({}, document.title, "/" + "interfacePage");
    showPageSection('pre-auth-section');
     dbx = new Dropbox.Dropbox({ clientId: CLIENT_ID });
        var authUrl = dbx.getAuthenticationUrl('https://cloudjs-projs.firebaseapp.com/interfacePage');
        document.getElementById('authlink').href = authUrl;
  }
//Function to bring user to logout screen in DB
  function logoutDB(){
   let link = document.createElement('a');
    link.href = "https://www.dropbox.com/logout";
    link.target = "_blank";
    document.body.appendChild(link);
    link.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true, view: window}));
    link.remove();
    revokeDB();
  }



