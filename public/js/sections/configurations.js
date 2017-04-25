function showConfigurationsSection() {

  $('#nname').html(user.fname + ' ' + user.lname);
  passcod(user.pass);
  $('#ncareer').html(user.carreras[user.city][user.career]);
  $('#ncity').html(user.city);
  $('#nyear').html(user.yearIn);
  $('#ndate').html(user.birthdate.split('T')[0]);

  //Ocultar secciones

  $('#datos').click(function() {
    $('.oculto').hide();
    $('.confListDos').show();
  });
  $('#privacidad').click(function() {
    $('.oculto').hide();
    $('.confListTres').show();
    $('#np').hide();
    $('#nvis').hide();
    $('#nmsc').hide();
  });
  $('#bloqueos').click(function() {
    $('.oculto').hide();
    $('.confListCuatro').show();
    $('#bmsg').hide();
    $('#labels').hide();
    $('#invs').hide();
    $('#bpub').hide();
    $('#bpreg').hide();
    sel_bloqueos();
  });
  $('#notificaciones').click(function() {
    $('.oculto').hide();
    $('.confListCinco').show();
  });

  // dejar en check si esta etiquetado o no

  if(user.allowLabel===true){
    $("#etiquetaruno").prop("checked", true );
  }else{
    $("#noetiquetaruno").prop("checked", true );
  }

  //permitir etiquetado en fotos

  $("#etiquetaruno").on("click", function() {
    $("#noetiquetaruno").prop("checked", false );
    /*
    post({allowLabel:true},'/updateUser',function(res) {
      user.allowLabel=true;
    });
    */
    send("allowLabel",{allowLabel:true});
  });

  //no permitir etiquetado en fotos

  $("#noetiquetaruno").on("click", function() {
    $("#etiquetaruno").prop("checked", false );
    /*
    post({allowLabel:false},'/updateUser',function(res) {
      user.allowLabel=false;
    });
    */
    send("allowLabel",{allowLabel:false});
  });


  // dejar en check si permite o no recuperacion de pass

  if(user.allowPass===true){
    $("#reccontuno").prop("checked", true );
  }else{
    $("#reccontuno").prop("checked", false );
  }

  //permitir o no recuperacion de contraseña

  $("#reccontuno").on("click", function() {
    if ($("#reccontuno").is(":checked")) {
      post({allowPass:true},'/updateUser',function(res) {
        user.allowPass=true;
      });
    } else {
      post({allowPass:false},'/updateUser',function(res) {
        user.allowPass=false;
      });
    }
  });

  // dejar en check si permite o no busqueda de nombre

  if(user.allowName===true){
    $("#allownombreuno").prop("checked", true );
  }else{
    $("#allownombreuno").prop("checked", false );
  }

  //permitir o no busqueda de nombre

  $("#allownombreuno").on("click", function() {
    if ($("#allownombreuno").is(":checked")) {
      post({allowName:true},'/updateUser',function(res) {
        user.allowName=true;
      });
    } else {
      post({allowName:false},'/updateUser',function(res) {
        user.allowName=false;
      });
    }
  });

  // dejar en check si permite o no busqueda por carrera

  if(user.allowCareer===true){
    $("#allowcarrerauno").prop("checked", true );
  }else{
    $("#allowcarrerauno").prop("checked", false );
  }

  //permitir o no busqueda por carrera

  $("#allowcarrerauno").on("click", function() {
    if ($("#allowcarrerauno").is(":checked")) {
      post({allowCareer:true},'/updateUser',function(res) {
        user.allowCareer=true;
      });
    } else {
      post({allowCareer:false},'/updateUser',function(res) {
        user.allowCareer=false;
      });
    }
  });

  // dejar en check si se muestra o no fotos a los fraternos

  if(user.showPhotos===true){
    $("#showfotosuno").prop("checked", true );
  }else{
    $("#showfotosuno").prop("checked", false );
  }

  //mostrar o no fotos a los fraternos

  $("#showfotosuno").on("click", function() {
    if ($("#showfotosuno").is(":checked")) {
      /*
      post({showPhotos:true},'/updateUser',function(res) {
        user.showPhotos=true;
      });
      */
      send("showPhotos",{showPhotos:true});
    } else {
      /*
      post({showPhotos:false},'/updateUser',function(res) {
        user.showPhotos=false;
      });
      */
      send("showPhotos",{showPhotos:false});
    }
  });

  // dejar en check si se muestra o no documentos a los fraternos

  if(user.showDocs===true){
    $("#showdocumentosuno").prop("checked", true );
  }else{
    $("#showdocumentosuno").prop("checked", false );
  }

  //mostrar o no documentos a los fraternos

  $("#showdocumentosuno").on("click", function() {
    if ($("#showdocumentosuno").is(":checked")) {
      /*
      post({showDocs:true},'/updateUser',function(res) {
        user.showDocs=true;
      });
      */
      send("showDocs",{showDocs:true});
    } else {
      /*
      post({showDocs:false},'/updateUser',function(res) {
        user.showDocs=false;
      });
      */
      send("showDocs",{showDocs:false});
    }
  });

  // dejar en check si se muestra o no publicaciones a los fraternos

  if(user.showPubs===true){
    $("#showpubuno").prop("checked", true );
  }else{
    $("#showpubuno").prop("checked", false );
  }

  //mostrar o no publicaciones a los fraternos

  $("#showpubuno").on("click", function() {
    if ($("#showpubuno").is(":checked")) {
      /*
      post({showPubs:true},'/updateUser',function(res) {
        user.showPubs=true;
      });
      */
      send("showPubs",{showPubs:true});
    } else {
      /*
      post({showPubs:false},'/updateUser',function(res) {
        user.showPubs=false;
      });
      */
      send("showPubs",{showPubs:false});
    }
  });

  // dejar en check si se muestra o no preguntas suyas a los fraternos

  if(user.showAnswers===true){
    $("#showpreguno").prop("checked", true );
  }else{
    $("#showpreguno").prop("checked", false );
  }

  //mostrar o no preguntas a los fraternos

  $("#showpreguno").on("click", function() {
    if ($("#showpreguno").is(":checked")) {
      post({showAnswers:true},'/updateUser',function(res) {
        user.showAnswers=true;
      });
    } else {
      post({showAnswers:false},'/updateUser',function(res) {
        user.showAnswers=false;
      });
    }
  });

  // dejar en check si se muestra o no anuncios suyas a los fraternos

  if(user.showAds===true){
    $("#showanuno").prop("checked", true );
  }else{
    $("#showanuno").prop("checked", false );
  }

  //mostrar o no anuncios a los fraternos

  $("#showanuno").on("click", function() {
    if ($("#showanuno").is(":checked")) {
      post({showAds:true},'/updateUser',function(res) {
        user.showAds=true;
      });
    } else {
      post({showAds:false},'/updateUser',function(res) {
        user.showAds=false;
      });
    }
  });

  // dejar en check si se muestra sonidos de las publicaciones

  if(user.soundPubs===true){
    $("#soundpubuno").prop("checked", true );
  }else{
    $("#soundpubuno").prop("checked", false );
  }

  //mostrar o no sonidos de las publicaciones

  $("#soundpubuno").on("click", function() {
    if ($("#soundpubuno").is(":checked")) {
      /*
      post({soundPubs:true},'/updateUser',function(res) {
        user.soundPubs=true;
      });
      */
      send("soundPubs",{soundPubs:true});
    } else {
      /*
      post({soundPubs:false},'/updateUser',function(res) {
        user.soundPubs=false;
      });
      */
      send("soundPubs",{soundPubs:false});
    }
  });

  // dejar en check si se muestra sonidos en los mensajes del chat

  if(user.soundMsg===true){
    $("#soundmsguno").prop("checked", true );
  }else{
    $("#soundmsguno").prop("checked", false );
  }

  //mostrar o no sonidos de los mensajes del chat

  $("#soundmsguno").on("click", function() {
    if ($("#soundmsguno").is(":checked")) {
      /*
      post({soundMsg:true},'/updateUser',function(res) {
        user.soundMsg=true;
      });
      */
      send("soundMsg",{soundMsg:true});
    } else {
      /*
      post({soundMsg:false},'/updateUser',function(res) {
        user.soundMsg=false;
      });
      */
      send("soundMsg",{soundMsg:false});
    }
  });

  // dejar en check si se envia o no notificaciones al correo electronico

  if(user.notMail===true){
    $("#notcorreouno").prop("checked", true );
  }else{
    $("#notcorreouno").prop("checked", false );
  }

  //enviar o no notificaciones al correo electronico

  $("#notcorreouno").on("click", function() {
    if ($("#notcorreouno").is(":checked")) {
      /*
      post({notMail:true},'/updateUser',function(res) {
        user.notMail=true;
      });
      */
      send("notMail",{notMail:true});
    } else {
      /*
      post({notMail:false},'/updateUser',function(res) {
        user.notMail=false;
      });
      */
      send("notMail",{notMail:false});
    }
  });

  // dejar en check si se envia o no notificaciones al ser etiquetado

  if(user.notLabel===true){
    $("#notlabeluno").prop("checked", true );
  }else{
    $("#notlabeluno").prop("checked", false );
  }

  //enviar o no notificaciones al ser etiquetado

  $("#notlabeluno").on("click", function() {
    if ($("#notlabeluno").is(":checked")) {
      /*
      post({notLabel:true},'/updateUser',function(res) {
        user.notLabel=true;
      });
      */
      send("notLabel",{notLabel:true});
    } else {
      /*
      post({notLabel:false},'/updateUser',function(res) {
        user.notLabel=false;
      });
      */
      send("notLabel",{notLabel:false});
    }
  });

  // dejar en check si recibe notificaciones de eventos

  if(user.notEvent===true){
    $("#noteventuno").prop("checked", true );
  }else{
    $("#noteventuno").prop("checked", false );
  }

  //enviar o no notificaciones al ser etiquetado

  $("#noteventuno").on("click", function() {
    if ($("#noteventuno").is(":checked")) {
      /*  
      post({notEvent:true},'/updateUser',function(res) {
        user.notEvent=true;
      });
      */
      send("notEvent",{notEvent:true});
    } else {
      /*
      post({notEvent:false},'/updateUser',function(res) {
        user.notEvent=false;
      });
      */
      send("notEvent",{notEvent:false});
    }
  });

  // dejar en check si recibe notificaciones de preguntas tuyas respondidas

  if(user.notAnswer===true){
    $("#notansweruno").prop("checked", true );
  }else{
    $("#notansweruno").prop("checked", false );
  }

  //recibir notificaciones de preguntas tuyas respondidas

  $("#notansweruno").on("click", function() {
    if ($("#notansweruno").is(":checked")) {
      /*
      post({notAnswer:true},'/updateUser',function(res) {
        user.notAnswer=true;
      });
      */
      send("notAnswer",{notAnswer:true});
    } else {
      /*
      post({notAnswer:false},'/updateUser',function(res) {
        user.notAnswer=false;
      });
      */
      send("notAnswer",{notAnswer:false});
    }
  });

  $('#listalock').on("click", "div", function () {
    //alert($(this).attr('userID'));
    if($(this).attr('userID')==user._id){
      alert("No se puede bloquear a uno mismo");
    }else {
      bloqueoTotal($(this).attr('userID'),$(this).attr('userName'));
    }
   
  });

  $('.usrblock').keypress(function() {
    buscar($(this).val());
  });

  function buscar(input){

    //Limpiar la lista
    $('#listalock').empty(); 

    //Si el buscador esta vacío
    if(input.length == 1){
      $('#listalock').hide(); 
      return;
    }

    //Separa las palabras del input por espacio
    input = input.split(" ");

    //Se crea un arreglo para crear la busqueda
    var query = new Array();

    //Por cada palabra se crea una busqueda
    for(var word in input){
      query.push( {"fname":{$regex:".*"+input[word]+".*",$options:"i"}});
      query.push( {"lname":{$regex:".*"+input[word]+".*",$options:"i"}});
    }

    searchUsers({"$or":query},function(usrs){

      //Si no se encuentra ningun usuario
      if(usrs.length == 0){
        $('#listalock').hide();
        return;
      }
      $('#listalock').show();
      var html = '';
      for(var usr in usrs){
        //Aqui se debe imprimir la lista, para acceder a datos usar por ejemplo: usrs[user].fname
        html += '<div userID="'+usrs[usr]._id+'" userName="'+usrs[usr].fname+ ' '+usrs[usr].lname+'">'+usrs[usr].fname+ ' '+usrs[usr].lname+'</div>';
      }
      $('#listalock').html(html);

    });
  }

  function bloqueoTotal (ids, name) {
    for(var i = 0; i <= user.blockedUsers.length; i++) {
      if(user.blockedUsers[i] == ids){
          alert("Fraterno ya fue bloqueado");
          return;
      }
    }
    //send("blockedUsers",{blockedUsers:user.blockedUsers.splice(user.blockedUsers.length, 0, ids)});
    send("blockedUsers",{blockedUsers:[ids]});
    alert(name+" bloqueado");

  }

}

//Mostar Usuarios
function sel_bloqueos() {
  var sel = $('.selfrat');
  var query = {'yearIn':$('#nyear').val()};
  var lleno;
  searchUsers(query,function(usrs){
    var vacio = "<option value='' disabled selected>Nombre del Fraterno a Bloquear</option>";
    if(usrs.length === 0){
        sel.html(vacio);
        return;
    }
    for(var usr in usrs){
      lleno += '<option value="'+usrs[usr]._id+'">'+usrs[usr].fname+ ' ' +usrs[usr].lname+'</option>';
    }
    sel.html(lleno);
  });
}

//Modales de la seccion de datos personales

function modal_nombre() {
  loadModal('nameChange');
}
function modal_correo() {
  loadModal('mailChange');
}
function modal_cont() {
  loadModal('passChange');
}
function modal_carrera() {
  loadModal('carreraChange');
}
function modal_ciudad() {
  loadModal('cityChange');
}
function modal_ingreso() {
  loadModal('yearChange');
}
function modal_fecha() {
  loadModal('dateChange');
}

//Modales de la seccion de bloqueos

function lock_fraterno() {
  loadModal('lockFraterno');
}
function list_lock() {
  loadModal('listLockFraterno');
}
function list_message() {
  loadModal('listLockMessage');
}
function list_label() {
  loadModal('listLockLabel');
}
function list_invitation() {
  loadModal('listLockInvitation');
}
function list_publications() {
  loadModal('listLockPublication');
}
function list_questions() {
  loadModal('listLockQuestion');
}

//Modales de codificacion de contraseñas

function passcod(pass) {
  var html = "*";
  for (var i = 1; i < pass.length; i++) {
    html += "*";
  }
  $('#npass').html(html);
}