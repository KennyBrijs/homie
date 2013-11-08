$(function(){
    logged_in_homie = JSON.parse($.cookie("logged_in_homie"));

    getFacebookProfile(logged_in_homie.username, function (data, textStatus, jqXHR) {
        $(".profile #homie-pic").attr("src", data.picture.data.url);
        $(".profile #homie-name").attr("src", data.name);
    });
});