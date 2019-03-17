var graph = require('@microsoft/microsoft-graph-client');

module.exports = {
    getUserDetails:  function (accessToken) {
        return new Promise((resolve, reject) => {
            const client = getAuthenticatedClient(accessToken);
    
            const user =  client.api('/me').get();
            user.then(resolve(user));
        });
    },

    getEvents: function (accessToken) {
        return new Promise((resolve, reject) => {
            const client = getAuthenticatedClient(accessToken);
    
            const events = client
                .api("/me/events")
                .select("subject,organizer,start,end")
                .orderby("createdDateTime DESC")
                .get();
            events.then( resolve(events));
        });
    },

    getRootFiles:  function (accessToken) {
        return new Promise((resolve, reject) => {
            try {
                const client = getAuthenticatedClient(accessToken);
                const files =  client
                    .api("/me/drive/root/children")
                    .get();
                    
                    files.then(() => {

                        //console.log(files._result);
                        resolve(files)
                    });
                    

            } catch (error) {
                console.log("ERROR IN GET ROOT FILES FUNCTION: ", error)
            }
        });
    },
    getFilesByPath:  function (accessToken, itemID){
        return new Promise((resolve, reject) => {
            try {
                const client = getAuthenticatedClient(accessToken);
                const root = "/me/drive/items/";
                const path = root + encodeURI(itemID) + "/children";
                console.log(path);
                const files =  client
                .api(path)
                .get();
                files.then(resolve(files)).catch((err) => {
                    console.log("Error in getting files by path. graph.js", err);
                }); 
            } catch (err) {
                console.log("ERROR: ", err.message)
            }
            
        });
    }
};

function getAuthenticatedClient(accessToken) {
    // Initialize Graph client
    const client = graph.Client.init({
        // Use the provided access token to authenticate
        // requests
        authProvider: (done) => {
            done(null, accessToken);
        }
    });
    
    return client;
}