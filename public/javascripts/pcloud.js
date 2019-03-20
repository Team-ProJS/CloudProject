/*************************************************************************** */
//                                            Global Variables                                                 //
/*************************************************************************** */

var access_token = false;//pCloud Access Token
var client = false;//pCloud Client

/*************************************************************************** */
//                                            pCloud API                                                         //
/*************************************************************************** */

//Function to list files
function listfiles() {
          var counter = 0;
          $("#myModal").modal("hide");
          var place = $('#files');
          place.append($('<div class="fileTitle pt-3 pl-5 ml-2"> <p> View pCloud items.. </p></div>'))
          client.listfolder(0).then(function(metadata) {
                    metadata.contents.forEach(function(item, n) {
                              if((counter%2)==1){
                                        var count ="whiteFileSec";
                              }else{
                                        count = "greyFileSec";
                              }
                              if (!item.isfolder) {
                                        console.log(item);
                                        place.append(
                                        $('<div class="'+count+'"/>')
                                        .append($('<img class=" pl-5 iconImg" src="/images/imgIcon.png"/>'))
                                        .append($('<span />').text(item.name))
                                        );
                                        counter++;
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

// Oauth authenticate without redirect uri
function pCloudLogin(){
          pCloudSdk.oauth.initOauthPollToken({
                    client_id: 'h7JyeHSFNcJ',
                    receiveToken: receiveTokenCb,
                    onError: err => console.log(err)
          });
          swal({
                    title: "Warning",
                    text: "pCloud is currently depreciated and so only viewing of files is currently possible, we apologise for any inconveniences",
                    icon: "info",
                  });
}

