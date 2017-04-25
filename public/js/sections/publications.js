var pubDispType = 0;
function showPublicationsSection(){
  var pubs = middleBar.find(".publications");
  currentUser = user;
  pubDispType = 0;
  getFollowedPublications(pubs,function(rp, pubs) {
    printPublications(rp,pubs);
  });
  middleBar.find(".post").click(function(){
    loadModal("newPost");
  });
  middleBar.find(".pA").click(function(){
    $(this).addClass("selected");
    middleBar.find(".pB").removeClass("selected");
    if(pubDispType == 1){
      pubs.empty()
      getFollowedPublications(pubs,function(rp, pubs) {
        printPublications(rp,pubs);
      });
    }
    pubDispType = 0;
  });
  middleBar.find(".pB").click(function(){
    $(this).addClass("selected");
    middleBar.find(".pA").removeClass("selected");
    //Obtiene las publicaciones a partir de los IDs
    if(pubDispType == 0){
      getAllPublications(pubs,function(rp, pubs) {
        pubs.empty()
        printPublications(rp,pubs);
      });
    }
    pubDispType = 1;
  });
}
function printPublications(rp,pubs){

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
}
