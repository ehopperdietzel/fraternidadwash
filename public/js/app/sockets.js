function startSockets(){
  var port = user.host + ":8000";
  if(port.length<25){
    port = null;
  }
  io = io(port);
  io.on('connect', function(){
    console.log('Conectado')
  });
  io.on('error', function(){
    setTimeout(function(){ io.connect(); }, 5000);
  });
  io.on('disconnect', function (){
    console.log('Desconectado');
    console.log('Conectando...');
    setTimeout(function(){ io.connect(); }, 5000);
  });
  io.on('seen', function(data){
    if(data.chatID in cachedChats){
      cachedChats[data.chatID].messages[cachedChats[data.chatID].messages.length - 1].seenBy = cachedChats[data.chatID].integrants;
    }
    if(data.by != user._id && chatObj.active && currentChatID == data.chatID){
      chatMessages.parent().find('.visto').show();
      chatMessages.parent().animate({ scrollTop: chatMessages.prop('scrollHeight') }, 10);
    }
    else{
      chatMessages.parent().find('.visto').hide();
    }
  });

  //Elimina imagen de publicación
  io.on('deletePublicationImage', function(data){
    if(data.pid in cachedPublications){
      var ind = cachedPublications[data.pid].photos.indexOf(data.fid);
      if(ind != -1){
        cachedPublications[data.pid].photos.splice(ind,1);
      }
    }
    saveCurrentPublications();
    $(".publication [photoID='"+data.fid+"']").hide(300);
  });

  //Elimina imagen del album
  io.on('deleteAlbumImage', function(data){
    if(data.user in cachedUsers){
      var ind = cachedUsers[data.user].photos.indexOf(data.fid);
      if(ind != -1){
        cachedUsers[data.user].photos.splice(ind,1);
      }
    }
    if(data.user == currentUser._id){
      if(currentUser.photos.indexOf(data.fid) != -1){
        currentUser.photos.splice(currentUser.photos.indexOf(data.fid),1);
        $(".sec.photos [photoID='"+data.fid+"']").hide(300,function(){
          $(this).remove();
          if(currentUser.photos.length == 0){
            middleBar.find(".sec.photos").html('<div style="font-size:30px;color:#CCC;margin:0 auto;padding:15px;text-align:center">Sin fotos de perfil</div>');
          }
        });
      }
    }
    if(data.user == user._id){
      if(user.photos.indexOf(data.fid) != -1){
        user.photos.splice(user.photos.indexOf(data.fid),1);
      }
    }
  });

  io.on('deletePublication', function(data){
    if(data.user == currentUser._id){
      if(currentUser.publications.indexOf(data.publication) != -1){
        currentUser.publications.splice(currentUser.publications.indexOf(data.publication),1);
        $(".publications [publicationID='"+data.publication+"']").hide(300,function(){
          $(this).remove();
          if(currentUser.publications.length == 0){
            middleBar.find(".sec.publications").html('<div class="publication noPub" style="display: block;"><div style="font-size:30px;color:#CCC;margin:15px;text-align:center">Sin publicaciones</div></div>');
          }
        });
      }
    }
     if(data.user == user._id){
       if(user.publications.indexOf(data.publication) != -1){
         user.publications.splice(user.publications.indexOf(data.publication),1);
       }
     }
     if(data.user in cachedUsers){
       if(cachedUsers[data.user].publications.indexOf(data.publication) != -1){
         cachedUsers[data.user].publications.splice(cachedUsers[data.user].publications.indexOf(data.publication),1);
       }
     }
     //saveCurrentUsers();
  });

  io.on('chatMessageArrived',function(data){
    messageArrive(data);
  });

  io.on('notification',function(data){
    console.log(data.type);
  });

  io.on('disconnectedUser',function(data){
    if(data == user._id){
      user.connected = false;
    }
    if(data == currentUser._id){
      currentUser.connected = false;
    }
    if(data in cachedUsers){
      cachedUsers[data].connected = false;
    }
    $("[chatUserID='"+data+"']").find(".contactStatus").removeClass("ON").addClass("OFF");

    if(currentChatID in cachedChats){
      if(cachedChats[currentChatID].integrants.indexOf(data)!=-1){
        chat.find(".contactStatus").removeClass("ON").addClass("OFF");
      }
    }
  });

  io.on('connectedUser',function(data){
    if(data == user._id){
      user.connected = true;
    }
    if(data == currentUser._id){
      currentUser.connected = true;
    }
    if(data in cachedUsers){
      cachedUsers[data].connected = true;
    }
    $("[chatUserID='"+data+"']").find(".contactStatus").removeClass("OFF").addClass("ON");

    if(currentChatID in cachedChats){
      if(cachedChats[currentChatID].integrants.indexOf(data)!=-1){
        chat.find(".contactStatus").removeClass("OFF").addClass("ON");
      }
    }
  });

  io.on('likePublication', function(data){
    if(!isPublicationInCache(data.id))return;
    if(data.add){
      cachedPublications[data.id].likes.push(data.userID);
      savePublicationsInCache();
      var pub = $("[publicationid='"+data.id+"']").find(".gus");
      pub.find(".num").html(cachedPublications[data.id].likes.length);
      if(data.userID == user._id){
        pub.addClass("liked");
        pub.find(".name").html("Te gusta")
      }
    }
    else{
      cachedPublications[data.id].likes.splice(cachedPublications[data.id].likes.indexOf(data.userID),1);
      savePublicationsInCache();
      var pub = $("[publicationid='"+data.id+"']").find(".gus");
      pub.find(".num").html(cachedPublications[data.id].likes.length);
      if(data.userID == user._id){
        pub.removeClass("liked")
        pub.find(".name").html("Me gusta")
      }
    }
  });

  io.on('editPublication', function(data){
    var pub = $("[publicationid='"+data.id+"']");
    cachedPublications[data.id].message = data.message;
    savePublicationsInCache();
    pub.find(".content").html(safe(data.message));
  });

  io.on('loadingPublication', function(percent){
    modal.find(".bar").css({width:percent});
    modal.find(".percent").html(percent);
  });

  io.on('follow', function(data){
    if(data.add){

      if(data.to in cachedUsers){
        cachedUsers[data.to].followers[data.sec].push(data.from);
        if(data.to == user._id)user.followers = cachedUsers[data.to].followers;
        if("_id" in currentUser){
          if(data.to == currentUser._id){
            currentUser = cachedUsers[data.to];
            countFollows();
          }
        }
      }
      if(data.from in cachedUsers){
        cachedUsers[data.from].following[data.sec].push(data.to);
        if(data.from == user._id)user.following = cachedUsers[data.from].following;
        if("_id" in currentUser){
          if(data.from == currentUser._id){
            currentUser = cachedUsers[data.from]
            countFollows();
          }
        }
      }
    }
    else{

      if(data.to in cachedUsers){
        var index = cachedUsers[data.to].followers[data.sec].indexOf(data.from);
        cachedUsers[data.to].followers[data.sec].splice(index,1);
        if(data.to == user._id)user.followers = cachedUsers[data.to].followers;
        if("_id" in currentUser){
          if(data.to == currentUser._id){
            currentUser = cachedUsers[data.to];
            countFollows();
          }
        }
      }
      if(data.from in cachedUsers){
        var index = cachedUsers[data.from].following[data.sec].indexOf(data.to);
        cachedUsers[data.from].following[data.sec].splice(index,1);
        if(data.from == user._id)user.following = cachedUsers[data.from].following;
        if("_id" in currentUser){
          if(data.from == currentUser._id){
            currentUser = cachedUsers[data.from];
            countFollows();
          }
        }
      }
    }
  });

  io.on('newPublication', function(data){
    if(user._id == data.from && !imgurError){
      modal.fadeOut(200);
    }
    var pubs = middleBar.find(".sec.publications");

    //Elimina el mensaje de no hay publicaciones
    if(currentUser._id == data.to){
      pubs.find(".noPub").remove();
    }
    var bool = (currentUser._id == data.to || (currentSection == "publications" && pubDispType == 1) || (currentSection == "publications" && user.following.publications.indexOf(data.from) != -1) );
    //Obtiene las publicaciones a partir de los IDs
    getPublicationsFromID([data.pid],{pubs:pubs,data:data},function(rp, pubs) {
      if(bool){
        //Se crea un clon del prefab publicacion
        var cloned = publication.clone();

        //Se le asigna el ID al html
        cloned.attr("publicationID",rp[0]._id);

        //Se añade el html a el contenedor de publicaciones
        cloned.prependTo(pubs.pubs).attr("publicationID",rp[0]._id).show();

        //Se le añade el actualizador de tiempo
        cloned.find(".date").html(getTransTime(rp[0].creationTime));
        timeElements.push({moment:rp[0].creationTime,element:cloned.find(".date")});

        //Le asigna el mensaje
        cloned.find(".content").html(safe(rp[0].message));


        //Imprime el numero de likes y comentarios
        cloned.find(".gus .num").html(rp[0].likes.length);
        cloned.find(".com .num").html(rp[0].comments.length);

        //Detecta si tiene un like propio
        if(rp[0].likes.indexOf(user._id) != -1){
          cloned.find(".gus").addClass("liked");
        }

        //Detecta si tiene url
        if('url' in rp[0]){
          if(rp[0].url != null){
            urlCard(rp[0].url,false,function(da,cloned){
              cloned.find(".urls").append(da);
            },cloned);
          }
        }
      }

      if(data.to in cachedUsers){
        cachedUsers[data.to].publications.push(data.pid);
      }
      if(data.to == user._id){
        user.publications.push(data.pid);
      }


      //Se obtienen sus imagenes
      getImagesFromID(rp[0].photos,{element:cloned,pub:rp[0],data:pubs.data},function(src, data){
        if(bool){
          if(data.pub.photos == 0){
            return;
          }
          if(data.pub.type == "profileImage"){
            var copy = bigImg.clone();
            copy.css({height:300,width:iW(300,src[0].height,src[0].width)}).attr("photoID",src[0]._id).attr("src",src[0].url);
            data.element.find(".attach").append(copy);
          }
          else{
            data.element.find(".type").html("Ha publicado")
            if(data.pub.photos.length == 1){
              var copy = bigImg.clone();
              copy.css({height:300,width:iW(300,src[0].height,src[0].width)}).attr("photoID",src[0]._id).attr("src",src[0].url);
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
                copy.css({height:100,width:iW(100,src[f].height,src[f].width)}).attr("photoID",src[f]._id).attr("src",src[f].url);
                data.element.find(".attach").append(copy);
              }
              if(total > 5){
                var copy = miniImg.clone();
                copy.css({height:100,width:iW(100,src[5].height,src[5].width)}).attr("photoID",src[5]._id).attr("src",src[5].url);
                data.element.find(".attach").append(copy);
              }
            }
          }
        }
      });


      //Se obtiene su creador
      getUsersFromID([rp[0].creator],cloned,function(src, element){
        if(bool){
          if(src[0]._id == user._id){
            //user.publications.push(rp[0]._id);
          }
          //cachedUsers[src[0]._id].publications.push(rp[0]._id);
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
        }
      });
    });
  });

  io.on("updateStory",function(data){
    if(data.user = user._id){
      user.message = data.msg;
      saveCurrentUser();
      modal.empty().fadeOut(200);
    }
    if(data.user = currentUser._id){
      currentUser.message = data.msg;
      _msg.children(".text").html(safe(data.msg));
    }
    if(data.user in cachedUsers){
      cachedUsers[data.user].message = data.msg;
      saveCurrentUsers();
    }
  });

  io.on("newDocument",function(data){
    cachedDocuments[data._id] = data;
  });

  io.on('deleteComment', function(data){
    $("[commentid='"+data.id+"']").hide(500);
    if(data.pid in cachedPublications){
      var index = cachedPublications[data.pid].comments.indexOf(data.id);
      if(index != -1){
        cachedPublications[data.pid].comments.splice(index,1);
        saveCurrentPublications();
        $("[publicationid='"+data.pid+"']").find(".com .num").html(cachedPublications[data.pid].comments.length);
      }
    }
    if(data.id in cachedComments){
      delete cachedComments[data.id];
      saveCurrentComments();
    }
  });

  io.on('newComment', function(data){
    var pub = $("[publicationid='"+data.pubId+"']");
    pub.find(".noComms").remove();
    if(data.pubId in cachedPublications){
      cachedPublications[data.pubId].comments.push(data.id);
    }
    savePublicationsInCache();
    pub.find(".com .num").html(cachedPublications[data.pubId].comments.length);
    getCommentsFromID([data.id],pub,function(data3){
      var com = comment.clone();
      com.find(".text").html(safe(data3[0].text));
      com.find(".time").html(getTransTime(data3[0].time));
      pub.find(".comms").append(com);
      com.attr("commentID",data3[0]._id);
      if(data3[0].creator == user._id){
        pub.find(".comms").animate({ scrollTop: pub.find(".comms").prop('scrollHeight') + 1000 }, 1000);
      }
      else{
        if(pub.find(".comms").scrollTop()>pub.find(".comms").prop('scrollHeight') - 381){
          pub.find(".comms").animate({ scrollTop: pub.find(".comms").prop('scrollHeight') + 1000 }, 1000);
        }
      }
      getUsersFromID([data3[0].creator],com,function(data1,com){
        com.find(".fullname").html(data1[0].fname +" "+ data1[0].lname);
        if(data1[0].profileImage == null){
          com.find(".profImg").attr('src',IMG_USER);
        }
        else{
          getImagesFromID([data1[0].profileImage],com,function(data2,com){
            com.find(".profImg").attr("src",imgSize(data2[0].url,'s'));
          });
        }
      });
    });
  });

  io.on("notification",function(data){
    if(user.soundPubs){
      audio.play();
    }
    var not = null;
    var index = 0;
    for(var n = 0;n<user.notifications.length;n++){
      if(data._id == user.notifications[n]._id){
        index = n;
        not = user.notifications[n];
        break;
      }
    }
    if(not == null){
      user.notifications.push(data)
    }
    else{
      user.notifications[index] = data;
    }
    loadBell();
  });

  io.on("deleteNotification",function(data){
    if(data.type == "publicationLike"){
      for(var n in user.notifications){
        if('pubId' in user.notifications[n]){
          if(data.pubId == user.notifications[n].pubId && user.notifications[n].type == "publicationLike"){
            user.notifications.splice(n,1);
          }
        }
      }
    }
    if(data.type == "newFollower"){
      for(var n in user.notifications){
        if('sec' in user.notifications[n]){
          if(data.sec == user.notifications[n].sec){
            user.notifications.splice(n,1);
          }
        }
      }
    }
    if(data.type == "newDocument"){
      for(var n in user.notifications){
        if('docId' in user.notifications[n]){
          if(data.docId == user.notifications[n].docId){
            user.notifications.splice(n,1);
          }
        }
      }
    }
    if(data.type == "all" && 'pubId' in data){
      for(var n in user.notifications){
        if('pubId' in user.notifications[n]){
          if(data.pubId == user.notifications[n].pubId){
            user.notifications.splice(n,1);
          }
        }
      }
    }
    loadBell();
  });















  //Parte Jose en Sockets

  //cambio nombre sockets
  io.on('nameChange', function(data){
    //user: uno mismo
    if (data.id == user._id) {
      user.fname = data.fname;
      user.lname = data.lname;
    }
    //currentuser: usuario que estoy viendo ahora
    if('_id' in currentUser){
      if (data.id == currentUser._id) {
        currentUser.fname = data.fname;
        currentUser.lname = data.lname;
        middleBar.find('.fullName').html(data.fname + ' ' +data.lname);
      }
    }


    //cacheduser: todos los demas
    if(data.id in cachedUsers){
      if (data.id == cachedUsers[data.id]._id) {
        cachedUsers[data.id].fname = data.fname;
        cachedUsers[data.id].lname = data.lname;
      }
    }

  });

  //cambio pass sockets
  io.on('passChange', function(data){
    //user: uno mismo
    if (data.id == user._id) {
      user.pass = data.pass;
    }
    //currentuser: usuario que estoy viendo ahora
    if('_id' in currentUser){
      if (data.id == currentUser._id) {
        currentUser.pass = data.pass;
        //middleBar.find('.fullName').html(data.fname + ' ' +data.lname);
      }
    }
    //cacheduser: todos los demas
    if(data.id in cachedUsers){
      if (data.id == cachedUsers[data.id]._id) {
        cachedUsers[data.id].pass = data.pass;
      }
    }

  });

  //cambio carrera sockets
  io.on('careerChange', function(data){
    //user: uno mismo
    if (data.id == user._id) {
      user.career = data.career;
    }
    //currentuser: usuario que estoy viendo ahora
    if('_id' in currentUser){
      if (data.id == currentUser._id) {
        currentUser.career = data.career;
        middleBar.find('.career').html(data.career);
      }
    }
    //cacheduser: todos los demas
    if(data.id in cachedUsers){
      if (data.id == cachedUsers[data.id]._id) {
        cachedUsers[data.id].career = data.career;
      }
    }

  });

  //cambio ciudad sockets
  io.on('cityChange', function(data){
    //user: uno mismo
    if (data.id == user._id) {
      user.city = data.city;
    }
    //currentuser: usuario que estoy viendo ahora
    if('_id' in currentUser){
      if (data.id == currentUser._id) {
        currentUser.city = data.city;
        middleBar.find('.career').html(data.city);
      }
    }
    //cacheduser: todos los demas
    if(data.id in cachedUsers){
      if (data.id == cachedUsers[data.id]._id) {
        cachedUsers[data.id].city = data.city;
      }
    }

  });

  //cambio año de ingreso
  io.on('yearInChange', function(data){
    //user: uno mismo
    if (data.id == user._id) {
      user.yearIn = data.yearIn;
    }
    //currentuser: usuario que estoy viendo ahora
    if('_id' in currentUser){
      if (data.id == currentUser._id) {
        currentUser.yearIn = data.yearIn;
        middleBar.find('.career').html(data.yearIn);
      }
    }
    //cacheduser: todos los demas
    if(data.id in cachedUsers){
      if (data.id == cachedUsers[data.id]._id) {
        cachedUsers[data.id].yearIn = data.yearIn;
      }
    }

  });

  //cambio fecha de nacimiento
  io.on('dateChange', function(data){
    //user: uno mismo
    if (data.id == user._id) {
      user.birthdate = data.birthdate;
    }
    //currentuser: usuario que estoy viendo ahora
    if('_id' in currentUser){
      if (data.id == currentUser._id) {
        currentUser.birthdate = data.birthdate;
        middleBar.find('.age').html(data.yearIn);
      }
    }
    //cacheduser: todos los demas
    if(data.id in cachedUsers){
      if (data.id == cachedUsers[data.id]._id) {
        cachedUsers[data.id].birthdate = data.birthdate;
      }
    }

  });

  //Privacidad: permitir etiquetado en fotos
  io.on('allowLabel', function(data){
    //user: uno mismo
    if (data.id == user._id) {
      user.allowLabel = data.allowLabel;
    }
    //currentuser: usuario que estoy viendo ahora
    if('_id' in currentUser){
      if (data.id == currentUser._id) {
        currentUser.allowLabel = data.allowLabel;
      }
    }
    //cacheduser: todos los demas
    if(data.id in cachedUsers){
      if (data.id == cachedUsers[data.id]._id) {
        cachedUsers[data.id].allowLabel = data.allowLabel;
      }
    }

  });

  //Privacidad: mostrar o no fotos a los fraternos
  io.on('showPhotos', function(data){
    //user: uno mismo
    if (data.id == user._id) {
      user.showPhotos = data.showPhotos;
    }
    //currentuser: usuario que estoy viendo ahora
    if('_id' in currentUser){
      if (data.id == currentUser._id) {
        currentUser.showPhotos = data.showPhotos;
      }
    }
    //cacheduser: todos los demas
    if(data.id in cachedUsers){
      if (data.id == cachedUsers[data.id]._id) {
        cachedUsers[data.id].showPhotos = data.showPhotos;
      }
    }

  });

  //Privacidad: mostrar o no documentos a los fraternos
  io.on('showDocs', function(data){
    //user: uno mismo
    if (data.id == user._id) {
      user.showDocs = data.showDocs;
    }
    //currentuser: usuario que estoy viendo ahora
    if('_id' in currentUser){
      if (data.id == currentUser._id) {
        currentUser.showDocs = data.showDocs;
      }
    }
    //cacheduser: todos los demas
    if(data.id in cachedUsers){
      if (data.id == cachedUsers[data.id]._id) {
        cachedUsers[data.id].showDocs = data.showDocs;
      }
    }

  });

  //Privacidad: mostrar o no publicaciones a los fraternos
  io.on('showPubs', function(data){
    //user: uno mismo
    if (data.id == user._id) {
      user.showPubs = data.showPubs;
    }
    //currentuser: usuario que estoy viendo ahora
    if('_id' in currentUser){
      if (data.id == currentUser._id) {
        currentUser.showPubs = data.showPubs;
      }
    }
    //cacheduser: todos los demas
    if(data.id in cachedUsers){
      if (data.id == cachedUsers[data.id]._id) {
        cachedUsers[data.id].showPubs = data.showPubs;
      }
    }

  });

  //Notificaciones: mostrar o no sonidos al recibir publicacion
  io.on('soundPubs', function(data){
    //user: uno mismo
    if (data.id == user._id) {
      user.soundPubs = data.soundPubs;
    }
    //currentuser: usuario que estoy viendo ahora
    if('_id' in currentUser){
      if (data.id == currentUser._id) {
        currentUser.soundPubs = data.soundPubs;
      }
    }
    //cacheduser: todos los demas
    if(data.id in cachedUsers){
      if (data.id == cachedUsers[data.id]._id) {
        cachedUsers[data.id].soundPubs = data.soundPubs;
      }
    }

  });

  //Notificaciones: mostrar o no sonidos al recibir un mensaje del chat
  io.on('soundMsg', function(data){
    //user: uno mismo
    if (data.id == user._id) {
      user.soundMsg = data.soundMsg;
    }
    //currentuser: usuario que estoy viendo ahora
    if('_id' in currentUser){
      if (data.id == currentUser._id) {
        currentUser.soundMsg = data.soundMsg;
      }
    }
    //cacheduser: todos los demas
    if(data.id in cachedUsers){
      if (data.id == cachedUsers[data.id]._id) {
        cachedUsers[data.id].soundMsg = data.soundMsg;
      }
    }

  });

  //Notificaciones: mostrar o no notificaciones al correo
  io.on('notMail', function(data){
    //user: uno mismo
    if (data.id == user._id) {
      user.notMail = data.notMail;
    }
    //currentuser: usuario que estoy viendo ahora
    if('_id' in currentUser){
      if (data.id == currentUser._id) {
        currentUser.notMail = data.notMail;
      }
    }
    //cacheduser: todos los demas
    if(data.id in cachedUsers){
      if (data.id == cachedUsers[data.id]._id) {
        cachedUsers[data.id].notMail = data.notMail;
      }
    }

  });

  //Notificaciones: mostrar o no notificaciones al ser etiquetado
  io.on('notLabel', function(data){
    //user: uno mismo
    if (data.id == user._id) {
      user.notLabel = data.notLabel;
    }
    //currentuser: usuario que estoy viendo ahora
    if('_id' in currentUser){
      if (data.id == currentUser._id) {
        currentUser.notLabel = data.notLabel;
      }
    }
    //cacheduser: todos los demas
    if(data.id in cachedUsers){
      if (data.id == cachedUsers[data.id]._id) {
        cachedUsers[data.id].notLabel = data.notLabel;
      }
    }

  });

  //Notificaciones: mostrar o no notificaciones al ser invitado a un evento
  io.on('notEvent', function(data){
    //user: uno mismo
    if (data.id == user._id) {
      user.notEvent = data.notEvent;
    }
    //currentuser: usuario que estoy viendo ahora
    if('_id' in currentUser){
      if (data.id == currentUser._id) {
        currentUser.notEvent = data.notEvent;
      }
    }
    //cacheduser: todos los demas
    if(data.id in cachedUsers){
      if (data.id == cachedUsers[data.id]._id) {
        cachedUsers[data.id].notEvent = data.notEvent;
      }
    }

  });

  //Notificaciones: mostrar o no notificaciones al ser respondida una pregunta
  io.on('notAnswer', function(data){
    //user: uno mismo
    if (data.id == user._id) {
      user.notAnswer = data.notAnswer;
    }
    //currentuser: usuario que estoy viendo ahora
    if('_id' in currentUser){
      if (data.id == currentUser._id) {
        currentUser.notAnswer = data.notAnswer;
      }
    }
    //cacheduser: todos los demas
    if(data.id in cachedUsers){
      if (data.id == cachedUsers[data.id]._id) {
        cachedUsers[data.id].notAnswer = data.notAnswer;
      }
    }

  });

  //Bloqueos: bloquear usuarios
  io.on('blockedUsers', function(data){
    //user: uno mismo
    if (data.id == user._id) {
      user.blockedUsers = data.blockedUsers;
    }
    //currentuser: usuario que estoy viendo ahora
    if('_id' in currentUser){
      if (data.id == currentUser._id) {
        currentUser.blockedUsers = data.blockedUsers;
      }
    }
    //cacheduser: todos los demas
    if(data.id in cachedUsers){
      if (data.id == cachedUsers[data.id]._id) {
        cachedUsers[data.id].blockedUsers = data.blockedUsers;
      }
    }

  });

  //Bloqueos: desbloquear usuarios
  io.on('unblockedUsers', function(data){
    //user: uno mismo
    if (data.id == user._id) {
      user.blockedUsers = data.blockedUsers;
    }
    //currentuser: usuario que estoy viendo ahora
    if('_id' in currentUser){
      if (data.id == currentUser._id) {
        currentUser.blockedUsers = data.blockedUsers;
      }
    }
    //cacheduser: todos los demas
    if(data.id in cachedUsers){
      if (data.id == cachedUsers[data.id]._id) {
        cachedUsers[data.id].blockedUsers = data.blockedUsers;
      }
    }

  });
}


function send(chanel,data){
  var msg = {email:user.email,pass:user.pass,data:data};
  io.emit(chanel, msg);
}
