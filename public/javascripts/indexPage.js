function showIntro(){
    swal({
      title: "Welcome!",
      text: "Our Website uses cookies, this helps us improve your user experience. We also use popups, so please allow popups when using the site.",
      icon: "info",
      button: "Will do!"
    });
  }

$(document).ready(function(){
var md = new MobileDetect(window.navigator.userAgent);

  console.log ("This is a mobile device " + md.mobile());
  // if the md value isn't null. We assume that it's a mobile or a tablet. Then we remove the button styling and links. Set to different values. 
  if (md.mobile() != null || md.tablet() !=null) { 
    console.log("successfully in mobile version");
    document.getElementById('btnSI').style.display = "none";
    document.getElementById('btnRG').style.display = "none";
    document.getElementById('signingInBtn4').style.display = "none";
    // change sign up buttons to learn more
    //document.getElementById('signingInBtn').textContent  = "Learn More";

    document.getElementById('signingInBtn1').innerText  = "Learn More";
    document.getElementById('signingInBtn2').innerText  = "Learn More";
    document.getElementById('signingInBtn3').innerText  = "Learn More";
    document.getElementById('signingInBtn1').setAttribute('onclick','location.href="/aboutUs"')
    //document.getElementsByClassName('signUpBtn2').innerText = "Learn More";
    //document.getElementsByClassName('signUpBtn3').innerText = "Learn More";
  }
  // allows it to show only once. 
  if(!localStorage.getItem("visited")){
    showIntro();
    localStorage.setItem("visited",true);
  }
});