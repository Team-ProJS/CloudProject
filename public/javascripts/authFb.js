$(document).ready(function () {
    var rootRef = firebase.database().ref();//needed for accessing firebase database
    var locStor=window.localStorage;
      //Sign-up event start
    $( "#reg-form" ).submit(function( event ) {
            event.preventDefault();
            var email = document.getElementById('emailInput').value;
            var password = document.getElementById('passwordInput').value;
            var password_1 = document.getElementById('passwordConfirmInput').value;
        
            if(password!=password_1)//check that password and confirm password are identical
                {
                    //window.alert("Passwords dont macth!!!");
                    swal("Failed to Register", "Passwords don't match","warning");
                }
            else
                {
                    firebase.auth().createUserWithEmailAndPassword(email,password)
                        .catch(function(error) {//triggers if an error occurs
                            var errorCode = error.code;
                            var errorMessage = error.message;
                            //window.alert(errorMessage);//error is probably pre-existing email
                            swal("Failed ", errorMessage,"warning");
                        })
                        .then(function(value) {//triggers when a new user is created
                            firebase.auth().currentUser.getIdToken(true)//gets IdToken for creating session cookie
                                .then(function(idToken) {//triggers if token retrieved successfuly
                                    sendTokenOnEntry(idToken);//passes token as parameter to sendToken function (below)
                                    })
                                .catch(function(error) {//triggers if token not retrieved
                                    console.log(error.message);
                                    });
                        });
                
                    }
        });//end of sign-up event
      
      
      //Log-in event start
    $( "#log-form" ).submit(function( event ) {
            event.preventDefault();
            var email = document.getElementById('emailInput').value;
            var password = document.getElementById('passwordInput').value;
            firebase.auth().signInWithEmailAndPassword(email,password)
                .catch(function(error) {//triggers if there is an error in logging in
                        var errorCode = error.code;
                        var errorMessage = error.message;
                        //window.alert(errorMessage);
                        swal("Failed to Login", errorMessage,"warning");
                        })
                .then(function(value) {//triggers if user logs in successfuly
                        firebase.auth().currentUser.getIdToken(true)
                                .then(function(idToken) {//triggers if token retrieved successfuly
                                    sendTokenOnEntry(idToken);//passes token as parameter to sendToken function (below)
                                    })
                                .catch(function(error) {//triggers if token not retrieved
                                    console.log(error.message);
                                    });
                    });
        });//end of log-in event
    
        //Log-out event start
    $( "#btnSO" ).click(function() {
            event.preventDefault();
            firebase.auth().signOut();//signs client-side out of firebase
            $.ajax({//POST request to trigger cookie removal so that server is also signed out
                type: 'POST',
                url: '/users/authOut',
                data: "Hello",
                success: function(data){
                    if(data=="response")
                    {
                        $(location).attr('href', '/' );
                    }else
                    {
                       // window.alert("Something went wrong,please try again later!");
                       swal("Failed to Logout", "Something went wrong, please try again later","warning");
                    }
                    
                },
                error: function(errMsg)
                    {
                        console.log(errMsg);
                    }
            });            
        });//log-out event end
    
        firebase.auth().onAuthStateChanged(function(firebaseUser){//triggers automatically whever authentication state, client-side, changes
            if(firebaseUser!=null){
                    user = 1;
                    localStorage.setItem('email', firebase.auth().currentUser.email);
                    firebase.auth().currentUser.getIdToken(true)
                                .then(function(idToken) {//triggers if token retrieved successfuly
                                    sendTokenOnBack(idToken);//passes token as parameter to sendToken function (below)
                                    console.log("sent token");
                                    })
                                .catch(function(error) {//triggers if token not retrieved
                                    console.log(error.message);
                                    });
                    createInfo(firebase.auth().currentUser.email);
            }else
                {
                    user=0;
                } 
            checkAuth();
      });
    
    function checkAuth()
    {
        if (user == 1){
             console.log("Logged in");
             //Hides both sign in and register buttons from navbar if user is signed in
             //Shows Log out button
             document.getElementById("btnSI").className = "nav-item d-none";
             document.getElementById("btnRG").className = "nav-item d-none";
             document.getElementById("btnIF").className = "nav-item";
             document.getElementById("btnSO").className = "nav-item";
       }else{
             console.log("Not logged in");
             //Hides Log out button from navbar if user is signed in
             //Shows both sign in and register buttons
             document.getElementById("btnSI").className = "nav-item";
             document.getElementById("btnRG").className = "nav-item";
             document.getElementById("btnIF").className = "nav-item d-none";
             document.getElementById("btnSO").className = "nav-item d-none";
       }
    }
      
});

function sendTokenOnBack(token)
    {
        $.ajax({//sends token to server for cookie generating
                type: 'POST',
                url: '/users/authIn',
                credentials: 'same-origin',
                data: {
                    'token' : token
                },
                success: function(data){
                    if(data=="response")
                    {
                        console.log("set cookie");
                    }else
                    {
                        //window.alert("Something went wrong,please try again later!");
                        swal("Something went wrong, Please try again later","warning");
                    }
                    
                },
                error: function(errMsg)
                    {
                        console.log(errMsg);
                    }
            });
        
    }

function sendTokenOnEntry(token)
    {
        $.ajax({//sends token to server for cookie generating
                type: 'POST',
                url: '/users/authIn',
                credentials: 'same-origin',
                data: {
                    'token' : token
                },
                success: function(data){
                    if(data=="response")
                    {
                        $(location).attr('href', '/users/interfacePage' );
                    }else
                    {
                        //window.alert("Something went wrong,please try again later!");
                        swal("Something went wont, Please try again later","warning");
                    }
                    
                },
                error: function(errMsg)
                    {
                        console.log(errMsg);
                    }
            });
        
    }
function createInfo(email)
    {
        $.ajax({
                type: 'POST',
                url: '/users/createUserInfo',
                credentials: 'same-origin',
                data: {
                    'email' : email
                },
                success: function(data){
                    if(data=="response")
                    {
                        
                    }else
                    {
                        console.log(data);
                    }
                    
                },
                error: function(errMsg)
                    {
                        console.log(errMsg);
                    }
            });
        
    }