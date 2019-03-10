/*************************************************************************** */
//                                            Front-end Javascript                                         //
/*************************************************************************** */

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
           getEmailInfo();//Get Ajax Information About User
           completeTransfer();
 });

//Function to show hidden elements
function showPageSection(elementId){
          document.getElementById(elementId).style.display ='block';
}

/*************************************************************************** */
//                                            Global Variables                                                 //
/*************************************************************************** */
    
var locStor; //Cookie Storage
var email;//User email, used for identifying the user
var activeGoogle = false;//Boolean used to identify transfers for Google Drive
var activeDropBox = false;//Boolean used to identify transfer for DropBox
var activeOneDrive = false;//Boolean used to identify transfer
var filename;//Variable used for checking name of file to transfer
var GoogleAuth;//Google drive client
var SCOPE = 'https://www.googleapis.com/auth/drive';//Google drive scope
var CLIENT_ID ='1qwuqul2z1v27e1';//DropBox Client ID
var dbx;//DropBox Client
var clientEnum ={ //Client Enumeration
          DROPBOX: 1,
          GOOGLEDRIVE: 2,
          ONEDRIVE: 3,
};
var currentClient;//Used to tell which Client is currently Active
/*************************************************************************** */
//                                            General Javascript                                             //
/*************************************************************************** */

//Function for uploading files
fileUploadTransfer.addEventListener('change', function(e){
          var file = e.target.files[0];
          if(currentClient == clientEnum.DROPBOX){
                    uploadToDropBox(file);
          }else if(currentClient == clientEnum.GOOGLEDRIVE){

                    
          }else if(currentClient == clientEnum.ONEDRIVE){

          
          }else{
                    alert("Error: No Service Selected");
          }
 });

/*************************************************************************** */
//                                            Ajax Javascript                                                   //
/*************************************************************************** */

//Function to get email from cookie storage from the logged-in user
function getEmailInfo(){ 
          locStor=window.localStorage;
           email = locStor.getItem('email');
}

//Function for testing current details of user
function checkDetails(){
          $.ajax({
                    type: 'POST',
                    url: '/users/getUserInfo',
                    credentials: 'same-origin',
                    data: {
                       'email':email,
                    },
                    success: function(data){
                              console.log(data);
                    },
                    error: function(errMsg)
                    {
                            console.log(errMsg);
                    }
          });
}

/*************************************************************************** */
//                                            Google Drive API                                               //
/*************************************************************************** */

//Function to load Google API client and auth modules
function handleClientLoad() {
          gapi.load('client:auth2', initClient);
 }

 //Function to start Google Drive Client
 function initClient(){
          var discoveryUrl = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
          gapi.client.init({
                    'apiKey':'AIzaSyD0DDd42dvcvFR0zb4ZsSFcBnHy3kUemoU',
                     'discoveryDocs':[discoveryUrl],
                    'clientId':'684132652830-gofob1h0fnmfcusfmq7lrhu9j5t0ek6p.apps.googleusercontent.com',
                    'scope': SCOPE        
                  }).then(function(){
                               GoogleAuth = gapi.auth2.getAuthInstance();
                               GoogleAuth.isSignedIn.listen(updateSigninStatus);
                               var user = GoogleAuth.currentUser.get();
                              setSigninStatus();
                              $('#sign-in-or-out-button').click(function(){
                               handleAuthClick();
                              //retrieveAllFiles();
                     });
          $('revoke-access-button').click(function(){
          revokeAccess();
          });  
          });
 }

 //Function to SIgn in/out of google drive
 function handleAuthClick(){
           if(GoogleAuth.isSignedIn.get()){
                    GoogleAuth.signOut();
                    currentClient = null;
          }else{
                    GoogleAuth.signIn();
                    currentClient = clientEnum.GOOGLEDRIVE;
          }
 }

 //Disconnects Google Api from OAuth
 function revokeAccess(){
          GoogleAuth.disconnect();
 }

 //Function for JQuery display of Buttons
 function setSigninStatus(isSignedIn){
           var user = GoogleAuth.currentUser.get();
           var isAuthorized = user.hasGrantedScopes(SCOPE);
           if(isAuthorized){
                    $('#sign-in-or-out-button').html('Sign out');  //If user logs in, change sign in button to sign out
                     $('#revoke-access-button').css('display', 'inline-block'); //Make button visible
          } else {
                    $('#sign-in-or-out-button').html('Sign In/Authorize'); //If user logs off, change sign out button to sign in
                    $('#revoke-access-button').css('display', 'none'); // make invisble
          }
}

//Function to update SIgn in Status
function updateSigninStatus(isSignedIn){
          setSigninStatus();
}

//Function to get files from google drive
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

 //Function to display files
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

/*************************************************************************** */
//                                            DropBox API                                                      //
/*************************************************************************** */

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
          location.append($('<div class="fileTitle pt-3 pl-5 ml-2"> <p> View Dropbox items.. </p></div>'));
          location.append($('<div class="greyFileSec" />').append($('<a href="javascript:;">...</a>').on('click',function(e){
                    dbx.filesListFolder({path: ''}).then(function(response){
                    renderItems(response.entries);
          }).catch(function(error){
                    console.error(error);
          });
          })
          ));
          var counter = 1;
          items.forEach(function(item){
                    if ((counter%2) == 1) {
                              var count = "whiteFileSec";
                    }else {
                              count = "greyFileSec";
                    }
                    if(item.hasOwnProperty('rev')){
                              location.append($('<div class="'+count+'"/>').append($('<img class=" pl-5 iconImg" src="/images/imgIcon.png"/>')).append($('<span/>').text(item.name)).append(' | ').append($('<a href="javascript:;">Download</a>').on('click',function(e){
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
                              })).append(" | ").append($('<a href="javascript:;">Transfer</a>').on('click',function(e){
                                        transferDBXFile(item.path_lower);
                              }))
                              );
                    }else{
                              location.append($('<div class="'+count+'"/>').append($('<img class="pl-5 iconImg" src="/images/folderIcon.png"/>')).append($('<span/>').text(item.name)).append(' | ').append($('<a href="javascript:;">Enter Folder</a>').on('click',function(e){
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

 //Function that is called upon auth
 if(isAuthenticated()){
          dbx = new Dropbox.Dropbox({ accessToken: getAccessTokenFromUrl() });
          currentClient = clientEnum.DROPBOX;
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

 //Function to download a DBX file to the browser
 function downloadDBXSFile(path){
          dbx = new Dropbox.Dropbox({ accessToken: getAccessTokenFromUrl() });
          dbx.filesDownload({path:""+path
          }).then(function(response){
                    console.log(response);
                    console.log(response.size);
          $.ajax({
                    type: 'POST',
                    url: '/users/dbD',
                    credentials: 'same-origin',
                    data: {
                              'email':email,
                              'value':response.size
                  },
                  success: function(data){
                  },
                  error: function(errMsg){
                              console.log(errMsg);
                    }
          });
          checkDetails();
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

//Function to upload file to DB
function uploadToDropBox(file){ 
          var uploadbar = document.getElementById('uploader');
          uploadbar.value = 10;
          const UPLOAD_FILE_SIZE_LIMIT = 150*1024*1024;
          uploadbar.value = 15;
          if(file.size < UPLOAD_FILE_SIZE_LIMIT){
                    $.ajax({
                              type: 'POST',
                              url: '/users/dbU',
                              credentials: 'same-origin',
                              data: {
                                        'email':email,
                                        'value':file.size
                              },
                              success: function(data){
                              },
                              error: function(errMsg){
                                        console.log(errMsg);
                              }
                    });
          checkDetails();
          uploadbar.value = 30;
          dbx.filesUpload({path: '/' + file.name, contents: file}).then(function(response){
                    uploadbar.value = 100;
                    console.log('File Uploaded');
                    console.log(response);
          }).catch(function(error){
                    console.error(error);
          });
          }else{
                    const maxBlob = 8*1000*1000;
                    var workItems = [];
                    var offset = 0;
                    $.ajax({
                              type: 'POST',
                              url: '/users/dbU',
                              credentials: 'same-origin',
                              data: {
                                        'email':email,
                                        'value':file.size
                              },
                  success: function(data){
                  },
                  error: function(errMsg){
                              console.log(errMsg);
                    }
                    });
                    checkDetails();
                    uploadbar.value = 40;
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
                    uploadbar.value = 100;
          }).catch(function(error) {
                    console.error(error);
          });  
          }
          return false;
}

//Function to revoke access Token to DB
function revokeDB(){
          dbx.authTokenRevoke();
          document.getElementById("files").style.display = "none";
          window.history.replaceState({}, document.title, "/" + "users/interfacePage");
          //showPageSection('pre-auth-section');
          dbx = new Dropbox.Dropbox({ clientId: CLIENT_ID });
          var authUrl = dbx.getAuthenticationUrl('https://cloudjs-projs.firebaseapp.com/users/interfacePage');
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
           currentClient = null;
}

  //Function to transfer files from DBX
function transferDBXFile(path){
          dbx = new Dropbox.Dropbox({ accessToken: getAccessTokenFromUrl() });
          dbx.filesDownload({path:""+path
          }).then(function(response){
                    if(activeDropBox){
                              console.log(response);
                              uploadToFirebase(response);
                                        $.ajax({
                                                  type: 'POST',
                                                  url: '/users/dbT',
                                                  credentials: 'same-origin',
                                                  data: {
                                                            'email':email,
                                                            'value':response.size
                                                  },
                                        success: function(data){
                                        },
                                        error: function(errMsg)
                                        {
                                                  console.log(errMsg);
                                        }
                                        });
                              checkDetails();
                              activeDropBox = false;
                              logoutDB();
                    }else if(activeGoogle){

                              activeGoogle = false;
                    }else if(activeOneDrive){

                              activeOneDrive= false;
                    }else{
                              alert("Error: No Service Selected");
                    }
                    }).catch(function(error){
                              console.error(error);
        });
        return false;
}

//Function to complete transfer of DBX 2 DBX
function completeTransfer(){
                    var filename =  locStor.getItem('transfer');
                    if(typeof filename !== 'undefined'){
                     var storageRef = firebase.storage().ref(email+'/' +filename).getDownloadURL().then(function(url){
                               console.log(url);
                              var xhr = new XMLHttpRequest();
                              xhr.open("GET", url);
                              xhr.responseType = 'blob';
                              xhr.onload = function(event){
                                         var blob = xhr.response;
                                         console.log(blob);
                                        var file = new Blob([blob],{type:"application/octet-stream"});
                                        file.name = filename;
                                         console.log(file);
                                         uploadToDropBox(file);
                                         delOldFile();
                               };
                               xhr.send();
                     }).catch(function(error){
                               console.log(error);
                     });
                    }
}

/*************************************************************************** */
//                                            Firebase Storage                                                //
/*************************************************************************** */

//Function to upload file to firebase
function uploadToFirebase(file){
          var storageRef = firebase.storage().ref(email+'/' +file.name);
          localStorage.setItem('transfer', file.name);
          var task = storageRef.put(file.fileBlob);
          task.on('state_changed',
          function progress(snapshot){
             /*var precentage = (snapshot.bytesTransferred/snapshot.totalBytes)*100;
              uploader.value = precentage;*/
          },
          function error(err){
          },
          function complete(){
          }
          );
}

//Function to delete old file from firebase after transfer
function delOldFile(){
          var storage = firebase.storage();
          var storageRef = storage.ref();
          var filename =  locStor.getItem('transfer');
          storageRef.child(email+'/'+filename).delete().then(function(){
                    console.log("Old File Removed Correctly");
                    localStorage.removeItem('transfer');
          }).catch(function(error){
                    console.log("Failed to delete Old File, Reason: "+error);
          });
}

//Gets image from databse and sets it as profile picture
function setProfilePicture(){
          var storage = firebase.storage();
          var storageRef = storage.ref();
          $.ajax({
                    type: 'POST',
                    url: '/users/getUserInfo',
                    credentials: 'same-origin',
                    data: {
                              'email':email
                    },
          success: function(data){
                    console.log(data);
                   if(new String("default").valueOf() == data.pCloudTransfer.valueOf()){
                              console.log("Default Picture loaded");
                    }else{
                              storageRef.child('users/'+email+'/'+data.pCloudTransfer).getDownloadURL().then(function(url) {
                                        var img = document.getElementById('profilepic');
                                        img.src = url;
                                        console.log("Saved picture loaded");
                                      }).catch(function(error) {
                                      });
                    }
          },
          error: function(errMsg)
          {
                     console.log(errMsg);
          }
           });      
}