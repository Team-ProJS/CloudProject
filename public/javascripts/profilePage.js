

/*************************************************************************** */
//                                            Global Variables                                                //
/*************************************************************************** */

var locStor=window.localStorage;//Get local storage
var email = locStor.getItem('email'); //Get email of current user
var myChart;
var myChart2;

$(document).ready(function(){

/*************************************************************************** */
//                                            AJAX Javascript                                                 //
/*************************************************************************** */

//AJAX to get user information
                    $.ajax({
                              type: 'POST',
                              url: '/users/getUserInfo',
                              credentials: 'same-origin',
                              data: {
                                        'email':email
                              },
                    success: function(data){
                              //Init Transfer PIe Chart
                              /*
                              myChart ={
                                        type: 'pie',
                                        data: {
                                                  datasets: [{
                                                            data: [
                                                                      data.gDriveTransfer,
                                                                      data.oneDriveTransfer,
                                                                      data.oneDriveTransfer,
                                                                      data.dBoxTransfer
                                                            ],
                                                            backgroundColor: [
                                                                      'rgba(65, 68, 242,  0.5)',
                                                                      'rgba(242, 171, 65,  0.5)',
                                                                      'rgba(89, 204, 249,  0.5)'
                                                            ],
                                                            label: 'Current Set'
                                                  }],
                                                  labels: [
                                                            'OneDrive',
                                                            'GoogleDrive',
                                                            'DropBox'
                                                  ]
                                        },
                                        options: {
                                                  responsive: true,
                                                  maintainAspectRatio: false,
                                                  tooltips: {
                                                            enabled: false
                                                  }
                                         }
                              }
                              //Init Upload Pie Chart
                              myChart2 ={
                                        type: 'pie',
                                        data: {
                                                  datasets: [{
                                                            data: [data.gDriveUpload,data.oneDriveUpload,data.dBoxUpload],
                                                            backgroundColor: [
                                                                      'rgba(65, 68, 242,  0.5)',
                                                                      'rgba(242, 171, 65,  0.5)',
                                                                      'rgba(89, 204, 249,  0.5)'
                                                            ],
                                                            label: 'Current Set'
                                                  }],
                                                  labels: [
                                                            'OneDrive',
                                                            'Google Drive',
                                                            'DropBox'
                                                  ]
                                        },
                                        options: {
                                                  responsive: true,
                                                  maintainAspectRatio: false,
                                                  tooltips: {
                                                            enabled: false
                                                  }
                                        }
                               }
                              var chart1 = document.getElementById('chartTransfer').getContext('2d');
                              var chert = new Chart(chart1, myChart);//Display Chart
                              var chart2 = document.getElementById('chartDownload').getContext('2d');
                              var chert2 = new Chart(chart2, myChart2);//Display Chart*/
                              //var ctx = document.getElementById('cTransfer').getContext('2d');
                    var chart = new Chart(document.getElementById('cTransfer'),{
                                        type:'pie',
                                        data:{
                                        labels:["OneDrive","GoogleDrive","DropBox"],
                                        datasets:[
                                                  {
                                                            label: "Service Transfers",
                                                            backgroundColor: ["#4460cf", "#cf8e44","#44cf93"],
                                                            data:[(data.oneDriveTransfer/1000000),(data.gDriveTransfer/1000000),(data.dBoxTransfer/1000000)]
                                                  }
                                        ]
                                        },
                                        options:{
                                                  responsive: true,
                                                  maintainAspectRatio: false,
                                                  scaleShowValues: true,
                                                  ticks: {
                                                            autoSkip: false
                                                        }
                                        }
                              });

                              var chart1 = new Chart(document.getElementById('cDownload'),{
                                        type:'pie',
                                        data:{
                                        labels:["OneDrive","GoogleDrive","DropBox"],
                                        datasets:[
                                                  {
                                                            label: "Service Transfers",
                                                            backgroundColor: ["#4460cf", "#cf8e44","#44cf93"],
                                                            data:[(data.oneDriveDownload/1000000),(data.gDriveDownload/1000000),(data.dBoxDownload/1000000)]
                                                  }
                                        ]
                                        },
                                        options:{
                                                  responsive: true,
                                                  maintainAspectRatio: false,
                                                  scaleShowValues: true,
                                                  ticks: {
                                                            autoSkip: false
                                                        }
                                        }
                              });
                              var tableString = "<table class='table table-condensed'><h3 class='header'> Some Statistics..</h3><thead class='pt-2'><tr><th>Cloud Service</th><th>Downloads</th><th>Uploads</th><th>Transfer</th><th>Total</th></tr></thead><tbody>";
                              tableString += "<tr><td>Google Drive</td><td>"+(data.gDriveDownload/1000000)+"MB<td>"+(data.gDriveUpload/1000000)+"MB</td><td>"+(data.gDriveTransfer/1000000)+"MB</td><td>"+((data.gDriveDownload+data.gDriveTransfer+data.gDriveUpload)/1000000)+"MB</td></tr>";
                              tableString += "<tr><td>OneDrive</td><td>"+(data.oneDriveDownload/1000000)+"MB<td>"+(data.oneDriveUpload/1000000)+"MB</td><td>"+(data.oneDriveTransfer/1000000)+"MB</td><td>"+((data.oneDriveDownload+data.oneDriveTransfer+data.oneDriveUpload)/1000000)+"MB</td></tr>";
                              tableString += "<tr><td>DropBox</td><td>"+(data.dBoxDownload/1000000)+"MB<td>"+(data.dBoxUpload/1000000)+"MB</td><td>"+(data.dBoxTransfer/1000000)+"MB</td><td>"+((data.dBoxDownload+data.dBoxTransfer+data.dBoxUpload)/1000000)+"MB</td></tr>";
                              tableString +="</tbody></table>";
                              document.getElementById('table').innerHTML = tableString;
                    },
                    error: function(errMsg)
                    {
                               console.log(errMsg);
                    }
                     });      
                     setProfilePicture();
});

/*************************************************************************** */
//                                            Firebase Storage                                                //
/*************************************************************************** */

//Function to upload file to firebase
function uploadToFirebase(file){
          var storageRef = firebase.storage().ref('users/'+email+'/' +file.name);
          delProfilePicture();
          var task = storageRef.put(file);
          $.ajax({
                    type: 'POST',
                    url: '/users/pcT',
                    credentials: 'same-origin',
                    data: {
                              'email':email,
                              'value':file.name
                  },
                  success: function(data){
                  },
                  error: function(errMsg){
                              console.log(errMsg);
                    }
          });
          task.on('state_changed',
          function progress(snapshot){
          },
          function error(err){
          },
          function complete(){
                    console.log("Complete Upload to Firebase");
                    setProfilePicture();
          }
          );
}

//Function that uploads image to firebase
profilePictureUpload.addEventListener('change', function(e){ 
          var file = e.target.files[0];
          uploadToFirebase(file);
 });

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
                                        img = document.getElementById('profilepic2');
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

//Function to delete old profile picture
function delProfilePicture(){
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
                   if(new String("default").valueOf() == data.pCloudTransfer.valueOf()){
                    }else{
                              storageRef.child('users/'+email+'/'+data.pCloudTransfer).delete().then(function(){
                                        console.log("Old Profile Picture Removed Correctly");
                              }).catch(function(error){
                                        console.log("Failed to delete Old Profile Picture, Reason: "+error);
                              });
                    }
          },
          error: function(errMsg)
          {
                     console.log(errMsg);
          }
           });      
}