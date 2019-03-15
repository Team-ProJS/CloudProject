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
           setProfilePicture();
           completeTransfer();
           var emailStuff = document.getElementById('userEmailDetails');
           emailStuff.innerHTML=email;
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
var SCOPE ='https://www.googleapis.com/auth/drive';//Google drive scope
var CLIENT_ID ='1qwuqul2z1v27e1';//DropBox Client ID
var dbx;//DropBox Client
var clientEnum ={ //Client Enumeration
          DROPBOX: 1,
          GOOGLEDRIVE: 2,
          ONEDRIVE: 3,
};
var currentClient;//Used to tell which Client is currently Active
var FOLDER_NAME = "";
var FOLDER_ID = "root";
var FOLDER_PERMISSION = true;
var FOLDER_LEVEL = 0;
var NO_OF_FILES = 1000;
var DRIVE_FILES = [];
var FILE_COUNTER = 0;
var FOLDER_ARRAY = [];
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

var authorizeButton = document.getElementById('authorize-button');
var signoutButton = document.getElementById('signout-button');

function handleClientLoad() {
          // Load the API client and auth2 library
          gapi.load('client:auth2', initClient);
}

var discoveryUrl = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];
function initClient() {
          gapi.client.init({
              apiKey: 'AIzaSyD0DDd42dvcvFR0zb4ZsSFcBnHy3kUemoU',
              discoveryDocs: discoveryUrl,
              clientId: '684132652830-gofob1h0fnmfcusfmq7lrhu9j5t0ek6p.apps.googleusercontent.com',
              scope: SCOPE
          }).then(function () {
            // Listen for sign-in state changes.
            gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
            // Handle the initial sign-in state.
            updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
            authorizeButton.onclick = handleAuthClick;
            signoutButton.onclick = handleSignoutClick;
          });
}

function updateSigninStatus(isSignedIn) {
          if (isSignedIn) {
            authorizeButton.style.display = 'none';
            signoutButton.style.display = 'block';
            makeApiCall();
          } else {
            authorizeButton.style.display = 'block';
            signoutButton.style.display = 'none';
          }
}

function handleAuthClick(event) {
          gapi.auth2.getAuthInstance().signIn();
 }
function handleSignoutClick(event) {
          gapi.auth2.getAuthInstance().signOut();
 }

function makeApiCall() {
         console.log("Got to API call");
         gapi.client.load('drive', 'v2', function(){
          var query = "trashed=false and '" + FOLDER_ID + "' in parents";
          var request = gapi.client.drive.files.list({
                    'maxResults': 1000,
                    'q': query
          });
          request.execute(function(resp){
                    if(!resp.error){
                     DRIVE_FILES = resp.files;
                     console.log(DRIVE_FILES);
                    buildFiles();   
                    }else{
                     showErrorMessage("Error: " + resp.error.message);   
                    }
          });
         });
}

function buildFiles(){
          if(DRIVE_FILES.length > 0){
          var location = $('#files');
          location.empty();
          location.append($('<div class="fileTitle pt-3 pl-5 ml-2"> <p> View Google Drive items.. </p></div>'));
          location.append($('<div class="greyFileSec" />').append($('<a href="javascript:;">...</a>').on('click',function(e){
                    makeApiCall();
          })
          ));
          var counter = 1;
          console.log(DRIVE_FILES);
          console.log(DRIVE_FILES[0]);
          console.log(DRIVE_FILES[0].name);
          for (var i = 0; i < DRIVE_FILES.length; i++) {
                    if ((counter%2) == 1) {
                              var count = "whiteFileSec";
                    }else {
                              count = "greyFileSec";
                    }

          if(DRIVE_FILES[i].mimeType ==="application/vnd.google-apps.folder"){
          location.append($('<div class="'+count+'"/>').append($('<img class=" pl-5 iconImg" src="/images/imgIcon.png"/>')).append($('<span/>').text(DRIVE_FILES[i].name)).append(' | ').append($('<a href="javascript:;">Enter</a>').on('click',function(e){
                    var FOLDER_ID = DRIVE_FILES[i].id;
                  })));
}else{
          location.append($('<div class="'+count+'"/>').append($('<img class=" pl-5 iconImg" src="/images/imgIcon.png"/>')).append($('<span/>').text(DRIVE_FILES[i].name)).append(' | ').append($('<a href="javascript:;">Download</a>').on('click',function(e){
                    
          })).append(' | ').append($('<a href="javascript:;">Delete</a>').on('click',function(e){
                    
          })).append(" | ").append($('<a href="javascript:;">Rename</a>').on('click', function(e){
                   
          })).append(" | ").append($('<a href="javascript:;">Transfer</a>').on('click',function(e){
                    
          }))
          );
}
          counter++;
}

}
}
/*************************************************************************** */
//                        DropBox API                                        //
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
          location.append($('<div class="greyFileSec" />').append($('<a class="pl-3" href="javascript:;">...</a>').on('click',function(e){
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
                              location.append($('<div class="'+count+'"/>').append($('<img class=" pl-5 iconImg" src="/images/imgIcon.png"/>')).append($('<span/>').text(item.name)).append($('<a class="float-right actionBtn" href="javascript:;">Download</a>').on('click',function(e){
                                        downloadDBXSFile(item.path_lower);
                              })
                              ).append($('<a class="float-right actionBtn" href="javascript:;">Delete</a>').on('click',function(e){
                                        deleteDBXFile(item.path_lower);
                                        dbx.filesListFolder({path: ''}).then(function(response){
                                                  renderItems(response.entries);
                                        }).catch(function(error){
                                                  console.error(error);
                                        });
                              })).append($('<a class="float-right actionBtn" href="javascript:;">Rename</a>').on('click', function(e){
                                        renameDBXFile(item.path_lower);
                                        dbx.filesListFolder({path: ''}).then(function(response){
                                                  renderItems(response.entries);
                                        }).catch(function(error){
                                                  console.error(error);
                                        });
                              })).append($('<a class="float-right actionBtn" href="javascript:;">Transfer</a>').on('click',function(e){
                                        transferDBXFile(item.path_lower);
                              }))
                              );
                    }else{
                              location.append($('<div class="'+count+'"/>').append($('<img class="pl-5 iconImg" src="/images/folderIcon.png"/>')).append($('<span/>').text(item.name)).append($('<a class="float-right actionBtn" href="javascript:;">Enter Folder</a>').on('click',function(e){
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
                                        var img = document.getElementById('sidebarCollapse');
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