function getFacebookProfile(fb_username, callback) {
  var url = "https://graph.facebook.com/" + fb_username + "?fields=id,name,picture,username,gender";

  $.ajax({
       type: 'GET',
       crossDomain:true,
        url: url,
        cache: false,
        success: callback,
        cache: false,
        error: function(jqXHR, errorstatus, errorthrown) {
           alert("Error: " + errorstatus);
        }
    });
}