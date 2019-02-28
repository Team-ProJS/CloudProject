var access_token = false;
var client = false;
//Function to list files
  function listfiles() {
          var place = $('#pcloudfiles');
          client.listfolder(0).then(function(metadata) {
                     metadata.contents.forEach(function(item, n) {
                               if (!item.isfolder) {
                               console.log(item);
                               place.append(
                               $('<div />')
                               .append($('<span />').text(item.name))
                    
          );
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
          var place = $('#pcloudfiles');
          place.empty();
}
//Upload file to pCloud
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

// Oauth authenticate without redirect uri
pcloudtokken.addEventListener('click', function (e) {
           pCloudSdk.oauth.initOauthPollToken({
           client_id: 'h7JyeHSFNcJ',
           receiveToken: receiveTokenCb,
           onError: err => console.log(err)
 });
}, false);

