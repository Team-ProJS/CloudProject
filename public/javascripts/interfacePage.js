/*************************************************************************** */
//                         Front-end Javascript                              //
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
           //completeTransfer();
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
var mywindow;
/*************************************************************************** */
//                                            General Javascript                                             //
/*************************************************************************** */

//Function for uploading files
fileUploadTransfer.addEventListener('change', function(e){
          var file = e.target.files[0];
          if(currentClient == clientEnum.DROPBOX){
                    uploadToDropBox(file);
          }else if(currentClient == clientEnum.GOOGLEDRIVE){
                    uploadToGoogleDrive(file);
          }else if(currentClient == clientEnum.ONEDRIVE){

          
          }else{
                   swal({
                    title: "No Cloud Service Selected!",
                    text: "Please login to a cloud service before you attempt to upload!",
                    icon: "error",
                  });
          }
 });

// will display the box, on click of transfer button for specific file
function transfer(){
          $("#transferModal").modal();
 }

 // function sets booleans for which service is currently active.
function activeService(client){
          // checks which one was called. Then sets variable corresponding to true.
          if(client == "googleTransfer"){
                    if(activeGoogle){
                              activeGoogle = false;
                    }else{
                              activeGoogle = true;
                    }
          }else if(client == "dropBoxTransfer") {
                    if(activeDropBox){
                              activeDropBox = false;
                    }else{
                              activeDropBox = true;
                    }
          }else if(client == "oneDriveTransfer") {
                    if(activeOneDrive){
                              activeOneDrive = false;
                    }else{
                              activeOneDrive = true;
                    }
          }
          // cases for when the activated boolean is the same as the current client. This will activate the link to logout of the specific client
          if(activeGoogle && currentClient == clientEnum.GOOGLEDRIVE){
           document.getElementById('googleLogoutTransferModal').style.display ='block';
          }else if(activeDropBox && currentClient == clientEnum.DROPBOX){
            document.getElementById('dropboxLogoutTransferModal').style.display ='block';       
          }else if(activeOneDrive && currentClient == clientEnum.ONEDRIVE){
            document.getElementById('oneDriveLogoutTransferModal').style.display ='block';
          }
          $("#transferModal").modal("hide");
}

function openWin(website){
          mywindow = window.open(website,"_blank","width=500, height=500");
          setTimeout(function(){ mywindow.close() },2500);
          
}

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
                    //authorizeButton.style.display = 'block';
                    //signoutButton.style.display = 'none';
            if(currentClient == clientEnum.GOOGLEDRIVE){
                    //authorizeButton.style.display = 'none';
                    //signoutButton.style.display = 'block';
                    makeApiCall();
            }
            
          } else {
            //authorizeButton.style.display = 'block';
            //signoutButton.style.display = 'none';
          }
}

function handleAuthClick(event) {
          currentClient = clientEnum.GOOGLEDRIVE;
          gapi.auth2.getAuthInstance().signIn();
          setTimeout(function(){ 
                    makeApiCall();
                    console.log("Got to wait"); },9000);
          
          
 }
function handleSignoutClick(event) {
          gapi.auth2.getAuthInstance().signOut();
          currentClient = null;
          var location = $('#files');
          location.empty();
 }

function makeApiCall() {
          console.log("Makin google api call");
         gapi.client.load('drive', 'v2', function(){
          var query = "trashed=false and '" + FOLDER_ID + "' in parents";
          var request = gapi.client.drive.files.list({
                    'maxResults': 1000,
                    'q': query
          });
          request.execute(function(resp){
                    if(!resp.error){
                     DRIVE_FILES = resp.result.files;
                    buildFiles();   
                    }else{
                     showErrorMessage("Error: " + resp.error.message);   
                    }
          });
         });
}
function setFolder(i){
          FOLDER_ID = DRIVE_FILES[i].id;
          makeApiCall();
}
function buildFiles(){
          if(DRIVE_FILES.length > 0){
          $("#myModal").modal("hide");
          var location = $('#files');
          location.empty();
          location.append($('<div class="fileTitle pt-3 pl-5 ml-2"> <p> View Google Drive items.. </p></div>'));
          location.append($('<div class="greyFileSec" />').append($('<a href="javascript:;" class="pl-3">...</a>').on('click',function(e){
                    FOLDER_ID ="root";
                    makeApiCall();
          })
          ));
          var counter = 1;
          for (var i = 0; i < DRIVE_FILES.length; i++) {
                    if ((counter%2) == 1) {
                              var count = "whiteFileSec";
                    }else {
                              count = "greyFileSec";
                    }
                    
          if(DRIVE_FILES[i].mimeType ==="application/vnd.google-apps.folder"){
          location.append($('<div class="'+count+'"/>').append($('<img class="pl-5 iconImg" src="/images/folderIcon.png"/>')).append($('<span/>').text(DRIVE_FILES[i].name)).append($('<a href="javascript:;" name="'+i+'" onclick="setFolder('+i+')" class="actionBtn float-right">Enter</a>').on('click',function(e){
                    
           })));
}else{
          location.append($('<div class="'+count+'"/>').append($('<img class=" pl-5 iconImg" src="/images/imgIcon.png"/>')).append($('<span/>').text(DRIVE_FILES[i].name)).append($('<a href="javascript:;"onclick="downloadGoogleDriveFile('+i+')" class="actionBtn float-right">Download</a>').on('click',function(e){
                    
          })).append($('<a href="javascript:;" onclick="deleteGoogleDriveFile('+i+');" class="actionBtn float-right">Delete</a>').on('click',function(e){
                    
          })).append($('<a href="javascript:;" class="actionBtn float-right">Rename</a>').on('click', function(e){
                   
          })).append($('<a href="javascript:;" onclick="transferGoogleDriveFile('+i+');" class="actionBtn float-right">Transfer</a>').on('click',function(e){
                    
          }))
          );
}
          counter++;
}
}
}

function uploadToGoogleDrive(file){
          var uploadbar = document.getElementById('uploader');
          uploadbar.value = 10;
          var accessTokenUpload = gapi.auth.getToken().access_token;
          var metadata = {
                    'name': file.name, // Filename at Google Drive
                    'mimeType': file.type, // mimeType at Google Drive
                    'parents': ['root'], // Folder ID at Google Drive
          };
          var form = new FormData();
          form.append('metadata', new Blob([JSON.stringify(metadata)], {type:'application/json'}));
          form.append('file', file);
          var xhr = new XMLHttpRequest();
          xhr.open('post', 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id');
          xhr.setRequestHeader('Authorization', 'Bearer ' + accessTokenUpload);
          xhr.responseType = 'json';
          xhr.onload = () => {
                    console.log(xhr.response.id); // Retrieve uploaded file ID.
                    swal({
                              title: "File Upload!",
                              text:"File has been uploaded to Google Drive",
                              icon: "success",
                            });
                            $.ajax({
                              type: 'POST',
                              url: '/users/gdU',
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
          };
          xhr.send(form);
}

function downloadGoogleDriveFile(i){
          var identifaction = DRIVE_FILES[i].id;
          var typeOFFile ="";
          var typeToEnd ="";
          var accessTokenDownload = gapi.auth.getToken().access_token;
          var xhr = new XMLHttpRequest();
          if(DRIVE_FILES[i].mimeType =="application/vnd.google-apps.document"){
                    typeOFFile = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
                    typeToEnd =".docx";
          }else if(DRIVE_FILES[i].mimeType =="application/vnd.google-apps.presentation"){
                    typeOFFile = "application/vnd.openxmlformats-officedocument.presentationml.presentation";
                    typeToEnd =".pptx";
          }else if(DRIVE_FILES[i].mimeType =="application/vnd.google-apps.spreadsheet"){
                    typeOFFile = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                    typeToEnd =".xlsx";
          }else{
                    downloadGoogleDriveFileBinary(i);
                    return;
          }
          xhr.withCredentials = true;
          xhr.open("GET", "https://www.googleapis.com/drive/v3/files/"+identifaction+'/export?mimeType='+typeOFFile, true);
          xhr.setRequestHeader('authorization','Bearer '+accessTokenDownload);
          xhr.responseType = 'blob';
          xhr.onload = function(){
                    var blob = xhr.response;
                    var file = new Blob([blob],{type:"application/octet-stream"});
                    file.name = DRIVE_FILES[i].name+typeToEnd;
                    swal({
                              title: "Download Started",
                              text: DRIVE_FILES[i].name +" is starting to download!",
                              icon: "success",
                            });
                            $.ajax({
                              type: 'POST',
                              url: '/users/gdD',
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
                    console.log(file);
                              let link = document.createElement('a');
                              link.href = window.URL.createObjectURL(file);
                              link.download = file.name;
                              document.body.appendChild(link);
                              link.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true, view: window}));
                              link.remove();
                              window.URL.revokeObjectURL(link.href);

          }
          xhr.send();
}

function downloadGoogleDriveFileBinary(i){
          var accessTokenDownload = gapi.auth.getToken().access_token;
          var identifaction = DRIVE_FILES[i].id;
          var xhr = new XMLHttpRequest();
          xhr.open("GET", "https://www.googleapis.com/drive/v3/files/"+identifaction+'?alt=media', true);
          xhr.setRequestHeader('authorization','Bearer '+accessTokenDownload);
          xhr.responseType = 'blob';
          xhr.onload = function(){
                    var blob = xhr.response;
                    var file = new Blob([blob],{type:"application/octet-stream"});
                    file.name = DRIVE_FILES[i].name;
                    console.log(file);
                    swal({
                              title: "Download Started",
                              text: DRIVE_FILES[i].name +" is starting to download!",
                              icon: "success",
                            });
                            $.ajax({
                              type: 'POST',
                              url: '/users/gdD',
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
                              let link = document.createElement('a');
                              link.href = window.URL.createObjectURL(file);
                              link.download = file.name;
                              document.body.appendChild(link);
                              link.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true, view: window}));
                              link.remove();
                              window.URL.revokeObjectURL(link.href);
          }
          xhr.send();
}

function transferGoogleDriveFile(i){
          var accessTokenDownload = gapi.auth.getToken().access_token;
          var identifaction = DRIVE_FILES[i].id;
          var typeOFFile ="";
          var typeToEnd ="";
          var xhr = new XMLHttpRequest();
          var file;
          var binary = false;
          if(DRIVE_FILES[i].mimeType =="application/vnd.google-apps.document"){
                    typeOFFile = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
                    typeToEnd =".docx";
                    
          }else if(DRIVE_FILES[i].mimeType =="application/vnd.google-apps.presentation"){
                    typeOFFile = "application/vnd.openxmlformats-officedocument.presentationml.presentation";
                    typeToEnd =".pptx";
                   
          }else if(DRIVE_FILES[i].mimeType =="application/vnd.google-apps.spreadsheet"){
                    typeOFFile = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                    typeToEnd =".xlsx";
                    
          }else{
                    binary = true;
          }

          if(binary){
                    var xhr = new XMLHttpRequest();
                    xhr.open("GET", "https://www.googleapis.com/drive/v3/files/"+identifaction+'?alt=media', true);
                    xhr.setRequestHeader('authorization','Bearer '+accessTokenDownload);
                    xhr.responseType = 'blob';
                    xhr.onload = function(){
                              var blob = xhr.response;
                              file = new Blob([blob],{type:"application/octet-stream"});
                              file.name = DRIVE_FILES[i].name;
                              console.log(file);
                              if(activeDropBox){
                                        uploadToFirebaseGoogle(file,'dropbox');
                                        openWin("https://accounts.google.com/logout");
                                        //alert("Login to your dropbox account to complete transfer");
                                        $.ajax({
                                                  type: 'POST',
                                                  url: '/users/gdT',
                                                  credentials: 'same-origin',
                                                  data: {
                                                            'email':email,
                                                            'value':xhr.response.size
                                                },
                                                success: function(data){
                                                },
                                                error: function(errMsg){
                                                            console.log(errMsg);
                                                  }
                                        });
                                        swal({
                                                  title: "Waiting to complete transfer",
                                                  text: "Login to your dropbox account and then press the complete transfer button to complete",
                                                  icon: "info",
                                                });
                                        currentClient = null;
                                        var location = $('#files');
                                        location.empty();

                              }else if(activeGoogle){
                                        uploadToFirebaseGoogle(file,'google');
                                        openWin("https://accounts.google.com/logout");
                                        handleSignoutClick();
                                        //alert("Login to your google account to complete transfer");
                                        swal({
                                                  title: "Waiting to complete transfer",
                                                  text: "Login to your google account and then press the complete transfer button to complete",
                                                  icon: "info",
                                                });
                                        currentClient = null;
                                        
                              }
                    }
                    xhr.send();
          }else{
          var xhr = new XMLHttpRequest();
          xhr.open("GET", "https://www.googleapis.com/drive/v3/files/"+identifaction+'/export?mimeType='+typeOFFile, true);
          xhr.setRequestHeader('authorization','Bearer '+accessTokenDownload);
          xhr.responseType = 'blob';
          xhr.onload = function(){
                    var blob = xhr.response;
                    file = new Blob([blob],{type:"application/octet-stream"});
                    file.name = DRIVE_FILES[i].name+typeToEnd;
                    console.log(file);
                    $.ajax({
                              type: 'POST',
                              url: '/users/gdT',
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
                    if(activeDropBox){
                              uploadToFirebaseGoogle(file,'dropbox');
                                        openWin("https://accounts.google.com/logout");
                                       // alert("Login to your dropbox account to complete transfer");
                                       swal({
                                        title: "Waiting to complete transfer",
                                        text: "Login to your dropbox account and then press the complete transfer button to complete",
                                        icon: "info",
                                      });
                                        currentClient = null;
                    }else if(activeGoogle){
                              uploadToFirebaseGoogle(file,'google');
                              openWin("https://accounts.google.com/logout");
                              handleSignoutClick();
                              //alert("Login to your google account to complete transfer");
                              swal({
                                        title: "Waiting to complete transfer",
                                        text: "Login to your google account and then press the complete transfer button to complete",
                                        icon: "info",
                                      });
                              currentClient = null;
                    }else{
                              $("#transferModal").modal("show");
                    }
                   
          }
          xhr.send();
          }
         
}

function deleteGoogleDriveFile(i){
          var c = confirm("Are you sure that you want to delete this file?");
          if(c){
                    var identifaction = DRIVE_FILES[i].id;
                    var accessTokenDel = gapi.auth.getToken().access_token;
                    var xhr = new XMLHttpRequest();
                    xhr.open("DELETE", "https://www.googleapis.com/drive/v3/files/"+identifaction, true);
                    xhr.setRequestHeader('authorization','Bearer '+accessTokenDel);
                    xhr.onload = function(){
                    }
                    xhr.send();
                    //alert("File has been deleted");
                    swal({
                              title: "File Deleted",
                              text: "",
                              icon: "info",
                            });
                    buildFiles();
          }else{
                    //alert("Delete cancelled");
                    swal({
                              title: "Delete Cancelled",
                              text: "",
                              icon: "warning",
                            });
          }
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
          $("#myModal").modal("hide");
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
                              location.append($('<div class="'+count+'"/>').append($('<img class=" pl-5 iconImg" src="/images/imgIcon.png"/>')).append($('<span/>').text(item.name)).append($('<a href="javascript:;" class="actionBtn float-right">Download</a>').on('click',function(e){
                                        downloadDBXSFile(item.path_lower);
                              })
                              ).append($('<a href="javascript:;" class="actionBtn float-right">Delete</a>').on('click',function(e){
                                        deleteDBXFile(item.path_lower);
                                        dbx.filesListFolder({path: ''}).then(function(response){
                                                  renderItems(response.entries);
                                        }).catch(function(error){
                                                  console.error(error);
                                        });
                              })).append($('<a href="javascript:;" class="actionBtn float-right">Rename</a>').on('click', function(e){
                                        renameDBXFile(item.path_lower);
                                        dbx.filesListFolder({path: ''}).then(function(response){
                                                  renderItems(response.entries);
                                        }).catch(function(error){
                                                  console.error(error);
                                        });
                              })).append($('<a href="javascript:;" class="actionBtn float-right">Transfer</a>').on('click',function(e){
                                        transferDBXFile(item.path_lower);
                              }))
                              );
                    }else{
                              location.append($('<div class="'+count+'"/>').append($('<img class="pl-5 iconImg" src="/images/folderIcon.png"/>')).append($('<span/>').text(item.name)).append($('<a href="javascript:;" class="actionBtn float-right">Enter Folder</a>').on('click',function(e){
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
          var c = confirm("Are you sure that you want to delete this file?");
          if(c){
                    dbx.filesDelete({path:""+path});
                    //alert("File at: "+path +" has been deleted");
                    swal({
                              title: "Delete Complete",
                              text: "",
                              icon: "success",
                            });
                    dbx.filesListFolder({path: ''}).then(function(response){
                              renderItems(response.entries);
                    }).catch(function(error){
                              console.error(error);
                    });
          }else{
                   // alert("Delete cancelled");
                   swal({
                    title: "Delete Cancelled",
                    text: "",
                    icon: "warning",
                  });
          }
          
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
                    swal({
                              title: "Download Started",
                              text: response.name+" has begun downloading",
                              icon: "success",
                            });
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
                    swal({
                              title: "File Uploaded",
                              text: file.name+" has been uploaded",
                              icon: "success",
                            });
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
                    swal({
                              title: "File Uploaded",
                              text: "file has been uploaded",
                              icon: "success",
                            });
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
           openWin("https://www.dropbox.com/logout");
           revokeDB();
           currentClient = null;
}

  //Function to transfer files from DBX
function transferDBXFile(path){
          dbx = new Dropbox.Dropbox({ accessToken: getAccessTokenFromUrl() });
          dbx.filesDownload({path:""+path
          }).then(function(response){
                    if(activeDropBox){
                              uploadToFirebase(response,'dropbox');
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
                              //alert("Please login to the Dropbox account that you wish to transfer to.");
                              swal({
                                        title: "Waiting to complete transfer",
                                        text: "Please login to your dropbox account and then click complete transfer button to complete transfer",
                                        icon: "info",
                                      });
                    }else if(activeGoogle){
                              console.log(response);
                              uploadToFirebase(response,'google');
                              openWin("https://accounts.google.com/logout");
                              mywindow = null;
                              activeGoogle = false;
                              logoutDB();
                              currentClient = null;
                              handleSignoutClick();
                              //alert("Please login to the Google account that you wish to transfer to and then refresh");
                              swal({
                                        title: "Waiting to complete transfer",
                                        text: "Please login to your google account and then click complete transfer button to complete transfer",
                                        icon: "info",
                                      });
                    }else if(activeOneDrive){

                              activeOneDrive= false;
                    }else{
                              //alert("Error: No Service Selected");
                              swal({
                                        title: "Error",
                                        text: "No Cloud Service selected",
                                        icon: "error",
                                      });
                                      $("#transferModal").modal("show");
                    }
                    }).catch(function(error){
                              console.error(error);
        });
        
        return false;
}

//Function to complete transfer of files
function completeTransfer(){
          var filename =  locStor.getItem('dropbox');
          var filename2 = locStor.getItem('google');
          if(filename != null){
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
                              delOldFile('dropbox');
                              swal({
                                        title: "Transfer Complete!",
                                        text: "File has been correctly transferred to this dropbox account",
                                        icon: "success",
                                      });
                              dbx.filesListFolder({path: ''}).then(function(response){
                                        renderItems(response.entries);
                               }).catch(function(error){
                                        console.error(error);
                               });
                     };
                    xhr.send();
          }).catch(function(error){
                    console.log(error);
          });
          }

         else if(filename2 != null){
                    console.log("Got to filename2");
                    console.log(filename2);
                    var storageRef = firebase.storage().ref(email+'/' +filename2).getDownloadURL().then(function(url){
                   console.log(url);
                   var xhr = new XMLHttpRequest();
                   xhr.open("GET", url);
                   xhr.responseType = 'blob';
                   xhr.onload = function(event){
                             var blob = xhr.response;
                             console.log(blob);
                             var file = new Blob([blob],{type:"application/octet-stream"});
                             file.name = filename2;
                             console.log(file);
                             uploadToGoogleDrive(file)
                             delOldFile('google');
                             //alert("Transfer has been Completed!");
                             swal({
                              title: "Transfer Complete!",
                              text: "File has been correctly transferred to this google account",
                              icon: "success",
                            });
                    };
                   xhr.send();
         }).catch(function(error){
                   console.log(error);
         });
         }else{
          swal({
                    title: "File Not Found",
                    text: "No transfer in progress, to begin transfer please select a service or login to a service first",
                    icon: "error",
                  });   
         }

                   
}

/*************************************************************************** */
//                                            Firebase Storage                                                //
/*************************************************************************** */

//Function to upload file to firebase
function uploadToFirebase(file,service){
          var storageRef = firebase.storage().ref(email+'/' +file.name);
          localStorage.setItem(service, file.name);
          var task = storageRef.put(file.fileBlob);
          task.on('state_changed',
          function progress(snapshot){
          },
          function error(err){
          },
          function complete(){
          }
          );
}

function uploadToFirebaseGoogle(file,service){
          var storageRef = firebase.storage().ref(email+'/' +file.name);
          localStorage.setItem(service, file.name);
          var task = storageRef.put(file);
          task.on('state_changed',
          function progress(snapshot){
          },
          function error(err){
          },
          function complete(){
          }
          );
}

//Function to delete old file from firebase after transfer
function delOldFile(service){
          var storage = firebase.storage();
          var storageRef = storage.ref();
          var filename =  locStor.getItem(service);
          storageRef.child(email+'/'+filename).delete().then(function(){
                    console.log("Old File Removed Correctly");
                    localStorage.removeItem(service);
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