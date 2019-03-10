var access_token = false;
var client = false;
//Function to list files
  function listfiles() {
    var counter = 0;
          var place = $('#files');
          client.listfolder(0).then(function(metadata) {
                     metadata.contents.forEach(function(item, n) {

                      if ( (counter%2) == 1) {
                        var count = "whiteFileSec";
                      }
                      else {
                        count = "greyFileSec";
                      }
                               if (!item.isfolder) {
                               console.log(item);
                               place.append($('<div class="fileTitle pt-3 pl-5 ml-2"> <p> View Dropbox items.. </p></div>'));
                               place.append($('<div class="'+count+'" />').append($('<img class=" pl-5 iconImg" src="/images/imgIcon.png"/>')).append($('<span />').text(item.name)));
                               count++;
                              }
      });
    });
  }

  

//Function getToken
function receiveTokenCb(token) {
           console.log(token);
           access_token = token;
           client = pCloudSdk.createClient(token);
           listfiles();
}
//Function to logout of pCloud
function pCloudLogout(){
          access_token = false;
          var place = $('#files');
          place.empty();
}
//Upload file to pCloud
/*
uploaderPCloud.addEventListener('change', function(e){
          if(!client){
                    this.value = '';
                    console.error('No Token.');
                    return;
          }
          client.upload(this.files[0], 0,{
                    onBegin: function(){
                              console.log('Upload Started.');
                    },
                    onProgress: function(progress){
                              console.log(progress.direction, progress.loaded, progress.total);
                    },
                    onFinish: function(uploadData){
                              console.log(uploadData);
                    }
          });
}, false);
*/

// Oauth authenticate without redirect uri
pcloudtokken.addEventListener('click', function (e) {
           pCloudSdk.oauth.initOauthPollToken({
           client_id: 'h7JyeHSFNcJ',
           receiveToken: receiveTokenCb,
           onError: err => console.log(err)
 });
}, false);

