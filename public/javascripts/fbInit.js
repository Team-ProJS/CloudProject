var config = {
            apiKey: 'AIzaSyAABz0NTPYELmQVbgs2h08bF5qzhJZkckA',
            projectId: "cloudjs-projs",
            authDomain: 'https://cloudjs-projs.firebaseapp.com',
            databaseURL: 'https://cloudjs-projs.firebaseio.com/',
            storageBucket: 'gs://cloudjs-projs.appspot.com/'
            };
        try{firebase.initializeApp(config);}
        catch(error){
            console.log(error.message);
        }