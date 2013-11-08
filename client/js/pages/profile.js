$(function(){
    logged_in_homie = JSON.parse($.cookie("logged_in_homie"));

    getFacebookProfile(logged_in_homie.username, function (data, textStatus, jqXHR) {
        console.log(data);
    });
});