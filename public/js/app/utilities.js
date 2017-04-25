///////////////////////////////////////////////////////////////
// - - - - - - - - - - - UTILIDADES - - - - - - - - - - - - //
/////////////////////////////////////////////////////////////

//Detecta el path, para cargar una sección
function checkURL(){
  var ur = window.location.pathname;
  var sec = ur.split("/")[1];
  if(sec == 'users'){
    if(ur.split("/")[2] == $.cookie("email").split("@")[0]){
      currentSection = "profile";
      return;
    }
    else{
      currentSection = "users";
      return;
    }
  }
  if(sec == 'publications'){
    currentSection = sec;
    return;
  }
  if(sec == 'questions'){
    currentSection = sec;
    return;
  }
  if(sec == 'events'){
    currentSection = sec;
    return;
  }
  if(sec == 'configurations'){
    currentSection = sec;
    return;
  }
}

function setUrl(url){
  history.replaceState({},"",url);
  history.pushState(null,null,url);
}

function urlCard(url,testing,callback,data){
  callback('<div class="emb"><a class="embedly-card" href="'+safe(url)+'">'+safe(url)+'</a></div>',data);
}

function safe(html){
  var pre = document.createElement('pre');
  var text = document.createTextNode( html );
  pre.appendChild(text);
  return pre.innerHTML;
}

//Obtener edad
function getAge(birthdate){
  var n = new Date();
  var b = new Date(birthdate);
  var dif = Math.abs(n.getTime() - b.getTime());
  var years = Math.trunc(dif / (1000 * 3600 * 24 * 365));
  return years;
}

//Obtener tiempo transcurrido
function getTransTime(moment){
  var n = new Date();
  var b = new Date(moment);
  var dif = Math.abs(n.getTime() - b.getTime());
  var sec = dif/1000;
  if(sec > 3600*24*28){
    return b.toISOString().substring(0, 10);
  }
  if(sec > 3600*24){
    return "Hace "+ Math.trunc(sec/(60*60*24))+" dia(s)";
  }
  if(sec > 3600){
    return "Hace "+ Math.trunc(sec/(60*60))+" hora(s)";
  }
  if(sec > 60){
    return "Hace "+ Math.trunc(sec/60)+" minuto(s)";
  }
  if(sec < 60){
    return "Hace unos segundos";
  }
}
