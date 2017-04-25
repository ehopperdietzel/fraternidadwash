function showProfileSection(id){
  getUsersFromID([id],null,function(data){
  if(currentSection == "users"){
    $(".userProfile").show();
    $(".usersWindow,.usersList,.bar").hide();
    $(".careersList").hide();
  }

  var isUser = (id == user._id);
  if(isUser){
    //Esconder opciones de seguimiento
    middleBar.find(".followOptions").hide();
    currentUser = user;
  }
  else {
    currentUser = data[0];
  }

  setUrl("/users/"+currentUser.email.split("@")[0]);

  _sections         = middleBar.find(".sections .section");
  _followOptions    = middleBar.find(".followOptions");
  _profileImageCont = middleBar.find(".profileImage");
  _fullName         = middleBar.find(".fullName");
  _newPost          = middleBar.find(".newPost");
  _career           = middleBar.find(".career");
  _age              = middleBar.find(".age");
  _city             = middleBar.find(".city");
  _msj              = middleBar.find(".mensaje");
  _msg              = middleBar.find(".message");
  _followers        = middleBar.find(".followers .number");
  _following        = middleBar.find(".following .number");
  _askpass          = middleBar.find(".askpass .number");

  _profileImage     = _profileImageCont.find("img");

  //Cargar imagen de perfil
  if(currentUser.profileImage == null){
    _profileImage.attr("src",IMG_USER);
  }
  else{
    getImagesFromID([currentUser.profileImage],null,function(src){
      _profileImage.attr("src",imgSize(src[0].url,'s'));
    });
  }

  _msj.click(function(){
    createChat(id);
  });


  //Imprime datos del perfil

  _fullName.html(currentUser.fname + " " + currentUser.lname);
  _career.html(user.carreras[currentUser.city][currentUser.career]+" ("+currentUser.yearIn+")");
  _age.html(getAge(currentUser.birthdate)+" años");
  _followers.html(currentUser.followers.length);
  _following.html(currentUser.following.length);
  _askpass.html(currentUser.askpass);
  _city.html(currentUser.city);
  _msg.find(".text").html(safe(currentUser.message));

  if(currentUser.message.length == 0){
    _msg.find(".text").html('Sin biografía');
  }
  else{
    _msg.find(".text").html(safe(currentUser.message));
  }

  countFollows();

  // - - -  EVENTOS  - - - //

  //Cargar modal para postear
  _newPost.click(function(){
    loadModal("newPost",function(){
      modal.find(".close").click(function(){
        modal.fadeOut(200, function(){
          modal.empty();
        });
      })
    });
  });

  //Muestra la ventana para cambiar de imagen
  _profileImageCont.click(function(){
    if(isUser){
      loadModal("selectProfileImage");
    }
    else{
      if(currentUser.profileImage != null){
        photoDisplay([currentUser.profileImage],0,{section:"profileImage",id:""});
      }
    }
  });


  //Edita el mensaje
  if(isUser){
    _msg.find("img").click(function(){
      loadModal("editStory");
    });
  }
  else{
    _msg.find("img").remove();
  }


  //Muestra la sección en el menu perfil
  function displaySection(section){

    //Le quita la sombra a los botones de la sección
    _sections.css({background:"none"}).filter("[section='"+section+"']").css({background:"#EEE"});

    //Esconde la sección anterior
    if(currentProfileSection != ""){
      middleBar.find("."+currentProfileSection).hide();
    }
    //Asigna la miniseccion a la actual
    currentProfileSection = section;

    //Guarda el html de las seccion actual y la muestra
    var curSec = middleBar.find("."+section).show();

    //CARGA LA MINI SECCIÓN FOTOS
    if(section == "photos"){

      //Limpia la sección
      curSec.empty();

      //Detecta si hay fotos
      if(currentUser.photos.length == 0) {
        //Muestra mensaje si no hay fotos
        curSec.html('<div style="font-size:30px;color:#CCC;margin:0 auto;padding:15px;text-align:center">Sin fotos de perfil</div>');
        return;
      }

      //Carga las fotos
      for(var photo in currentUser.photos){

        //Clona una imagen de los prefabs
        var clone = miniImage.clone().attr("photoID",currentUser.photos[photo]).appendTo(curSec);

        //Busca las imagenes del usuario y las añade
        getImagesFromID([currentUser.photos[photo]],clone,function(src,element){
          element.find("img").attr("src",imgSize(src[0].url,'s'));
        });
      }
      curSec.append("<div class='invPhoto'></div><div class='invPhoto'></div><div class='invPhoto'></div><div class='invPhoto'></div><div class='invPhoto'></div><div class='invPhoto'></div><div class='invPhoto'></div><div class='invPhoto'></div><div class='invPhoto'></div>");

      var fotos = middleBar.find(".photos");

      //Añade evento click a las imagenes
      curSec.find(".imgCont").click(function(){
        var id = $(this).attr("photoid");

        photoDisplay(currentUser.photos,currentUser.photos.indexOf(id),{section:"userPhotos",id:""});

      });
    }

    //CARGA LA MINI SECCIÓN PUBLICACIONES
    if(section == "publications"){

      //Almacena las publicaciones
      var pubs = middleBar.find(".sec.publications").empty();


      //Detecta si hay publicaciones
      if(currentUser.publications.length == 0){
        pubs.html('<div class="publication noPub"><div style="font-size:30px;color:#CCC;margin:15px;text-align:center">Sin publicaciones</div></div>').find(".noPub").show();
        return;
      }

      //Elimina el mensaje de no hay publicaciones
      pubs.find(".noPub").remove();

      //Obtiene las publicaciones a partir de los IDs
      getPublicationsFromID(currentUser.publications,pubs,function(rp, pubs) {

        //Almacena los IDs en una variable
        var ides = currentUser.publications;

        //Recorre las publicaciones
        for(var p = rp.length -1;p>=0; p--){

          //Se crea un clon del prefab publicacion
          var cloned = publication.clone();

          //Se le asigna el ID al html
          cloned.attr("publicationID",rp[p]._id);

          //Se añade el html a el contenedor de publicaciones
          cloned.appendTo(pubs).attr("publicationID",rp[p]._id).show();

          //Se le añade el actualizador de tiempo
          cloned.find(".date").html(getTransTime(rp[p].creationTime));
          timeElements.push({moment:rp[p].creationTime,element:cloned.find(".date")});

          //Le asigna el mensaje
          cloned.find(".content").html(safe(rp[p].message));


          //Imprime el numero de likes y comentarios
          cloned.find(".gus .num").html(rp[p].likes.length);
          cloned.find(".com .num").html(rp[p].comments.length);

          //Detecta si tiene un like propio
          if(rp[p].likes.indexOf(user._id) != -1){
            cloned.find(".gus").addClass("liked");
          }
          //Detecta si tiene url
          if('url' in rp[p]){
            if(rp[p].url != null){
              urlCard(rp[p].url,false,function(da,cloned){
                cloned.find(".urls").append(da);
              },cloned);
            }
          }

          //Se obtienen sus imagenes
          getImagesFromID(rp[p].photos,{element:cloned,pub:rp[p]},function(src, data){
            if(data.pub.photos == 0){
              return;
            }
            if(data.pub.type == "profileImage"){
              data.element.find(".type").html("cambió su foto de perfil")
              var copy = bigImg.clone();
              copy.css({height:300,width:iW(300,src[0].height,src[0].width)}).attr("photoID",src[0]._id).attr("src",imgSize(src[0].url,"l"));
              data.element.find(".attach").append(copy);
            }
            else{
              data.element.find(".type").html("Ha publicado")
              if(data.pub.photos.length == 1){
                var copy = bigImg.clone();
                copy.css({height:300,width:iW(300,src[0].height,src[0].width)}).attr("photoID",src[0]._id).attr("src",imgSize(src[0].url,"l"));
                data.element.find(".attach").append(copy);
              }
              else{
                var total = src.length;
                var limit = src.length;
                if(total > 5){
                  limit = 5;
                }
                for(var f = 0; f<limit;f++){
                  var copy = miniImg.clone();
                  copy.css({height:100,width:iW(100,src[f].height,src[f].width)}).attr("photoID",src[f]._id).attr("src",imgSize(src[f].url,"t"));
                  data.element.find(".attach").append(copy);
                }
                if(total > 5){
                  var copy = miniImg.clone();
                  copy.css({height:100,width:iW(100,src[5].height,src[5].width)}).attr("photoID",src[5]._id).attr("src",imgSize(src[5].url,"t"));
                  data.element.find(".attach").append(copy);
                }
              }
            }
          });

          //Se obtiene su creador
          getUsersFromID([rp[p].creator],cloned,function(src, element){
            element.find(".fullname").html(src[0].fname + " " + src[0].lname);

            //Se obtiene la imagen de perfil del creador
            if(src[0].profileImage == null){
              element.find(".profImage").attr('src',IMG_USER);
            }
            else{
              getImagesFromID([src[0].profileImage],element,function(src1,element1){
                element1.find(".profImage").attr('src',imgSize(src1[0].url,'s'));
              });
            }
          });
        }
      });
    }
  }

  //Añade el evento click a las mini secciones
  _sections.on("click",function(){
    displaySection($(this).attr("section"));
  });

  //Muestra las publicaciones por defecto
  displaySection("publications");
  });
}

function countFollows(){

    var followers = [];
    var following = [];
    for(var sec in currentUser.followers){
      for(var us in currentUser.followers[sec]){
        if(followers.indexOf(currentUser.followers[sec][us])==-1){
          followers.push(currentUser.followers[sec][us]);
        }
      }
    }
    for(var sec in currentUser.following){
      for(var us in currentUser.following[sec]){
        if(following.indexOf(currentUser.following[sec][us])==-1){
          following.push(currentUser.following[sec][us]);
        }
      }
    }
    middleBar.find(".followers .number").html(followers.length);
    middleBar.find(".following .number").html(following.length);

    if(currentUser.followers.questions.indexOf(user._id) != -1){
      middleBar.find(".preguntas .tick").show();
    }
    else{
      middleBar.find(".preguntas .tick").hide();
    }
    if(currentUser.followers.publications.indexOf(user._id) != -1){
      middleBar.find(".publicaciones .tick").show();
    }
    else{
      middleBar.find(".publicaciones .tick").hide();
    }
    if(currentUser.followers.events.indexOf(user._id) != -1){
      middleBar.find(".eventos .tick").show();
    }
    else{
      middleBar.find(".eventos .tick").hide();
    }

}
