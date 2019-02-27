
var access_token = false;
var client = false;

  function listfiles() {
    var place = $('#pcloudfiles');
    client.listfolder(0).then(function(metadata) {
      metadata.contents.forEach(function(item, n) {
        if (!item.isfolder) {
            console.log(item);
          place.append(
            $('<div />')
              .append($('<span />').text(item.name))
              .append(' | ')
              .append(
                $('<a href="javascript:;">Download</a>')
                  .on('click', function(e) {
                    console.log('downloading', item.fileid);
                    downloadfile(item.fileid);
                  })
              )
          );
        }
      });
    });
  }

function receiveTokenCb(token) {
  console.log(token);
  access_token = token;
  client = pCloudSdk.createClient(token);
listfiles();
}

// Oauth authenticate without redirect uri
pcloudtokken.addEventListener('click', function (e) {
  pCloudSdk.oauth.initOauthPollToken({
    client_id: 'h7JyeHSFNcJ',
    receiveToken: receiveTokenCb,
    onError: err => console.log(err)
  });
}, false);

