$(document).ready(function(){
  var logError = $(".login .error");
  var regError = $(".register .error")
  $("body").fadeIn(1000);


  $(".goToReg").click(function(){
    $(".login").hide(256,function(){
      logError.fadeOut(300);
      $(".register").show(256);
    });
  });

  $(".goToLog").click(function(){
    $(".register").hide(256,function(){
      regError.fadeIn(300);
      $(".login").show(256);
    });
  });

  $(".loginBtn").click(function(){
    var email = $("#logEmail").val().toLowerCase();
    var pass = $("#logPass").val();
    post({ email: email, pass: pass},"/login",function(res){
      if(res == true){
        $.cookie("email", email);
        $.cookie("pass",  pass);
        //window.location.href = "/users/"+email.split("@")[0];
        window.location.href = "/login";
      }
      else{
        logError.html(res).fadeIn(300);
      }
    })
  });

  $(".regBtn").click(function(){
    var email = $("#regEmail").val();
    var pass  = $("#regPass").val();
    post({ email: email, pass: pass,pass1: $("#regPass1").val()},"/register",function(res){
      if(res == true){
        $.cookie("email", email);
        $.cookie("pass",  pass);
        window.location.href = "/users/" + email.split("@")[0].toLowerCase();
      }
      else{
        regError.html(res).fadeIn(300);
      }
    })
  });
});

function post(data,url,callback){
  $.ajax({
  url: url,
  type: 'POST',
  contentType: 'application/json',
  data: JSON.stringify(data)})
  .done(function( res ) {
    callback(res);
  });
}
