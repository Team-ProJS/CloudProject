
/*************************************************************************** */
//                         General Javascripts                              //
/*************************************************************************** */

AOS.init();
$(document).ready(function(){
  var md = new MobileDetect(window.navigator.userAgent);
  console.log ("This is a mobile device " + md.mobile());
  
  if (md.mobile() != null || md.tablet() !=null) { 
    console.log("successfully in mobile version");
    document.getElementById('btnSI').style.display = "none";
    document.getElementById('btnRG').style.display = "none";
  }


});

