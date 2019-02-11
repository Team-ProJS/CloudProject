
var config = {
    apiKey: 'AIzaSyAABz0NTPYELmQVbgs2h08bF5qzhJZkckA',
    authDomain: 'https://cloudjs-projs.firebaseapp.com',
    databaseURL: 'https://cloudjs-projs.firebaseio.com/',
    storageBucket: 'gs://cloudjs-projs.appspot.com/'
  };
  firebase.initializeApp(config);
  var uploader = document.getElementById('uploader');
  var fileButton = document.getElementById('fileButton');

  fileButton.addEventListener('change',function(e){
      
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