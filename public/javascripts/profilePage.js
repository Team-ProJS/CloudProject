$(document).ready(function(){
          var locStor=window.localStorage;
          var email = locStor.getItem('email');
          var myChart;
          var charinfo;
          alert(email);
          $.ajax({
                    type: 'POST',
                    url: '/users/getUserInfo',
                    credentials: 'same-origin',
                    data: {
                       'email':email
                    },
                    success: function(data){
                    //console.log(data);
                    //console.log(data.dBoxUpload);
                    charinfo =parseFloat(data.dBoxUpload);
                    console.log(charinfo);
                    myChart ={
                              type: 'pie',
                              data: {
                                        datasets: [{
                                                  data: [
                                                            data.pCloudTransfer,
                                                            20,
                                                            50,
                                                            70
                                                  ],
                                                  backgroundColor: [
                                                            'rgba(65, 242, 195, 0.5)',
                                                            'rgba(65, 68, 242,  0.5)',
                                                            'rgba(242, 171, 65,  0.5)',
                                                            'rgba(89, 204, 249,  0.5)'
                                                  ],
                                                  label: 'Current Set'
                                        }],
                                        labels: [
                                                  'pCloud',
                                                  'OneDrive',
                                                  'Google Drive',
                                                  'DropBox'
                                        ]
                              },
                              options: {
                                        responsive: true
                              }
                    }
                    //profiledata = clone(data);    
                   // profiledata2=JSON.parse(JSON.stringify(data));
                    },
                    error: function(errMsg)
                        {
                            console.log(errMsg);
                        }
                });
                console.log(charinfo);
          var chart1 = document.getElementById('chart').getContext('2d');
          var chert = new Chart(chart1, myChart);



          var storage = firebase.storage();
          var storageRef = storage.ref();
           storageRef.child('users/jk/kadihn7rfg2z.png').getDownloadURL().then(function(url) {

                    var img = document.getElementById('profilepic');
                    img.src = url;
                  }).catch(function(error) {
                  });
});

 
