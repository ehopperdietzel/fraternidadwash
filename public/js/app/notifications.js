function loadNotifications(){

  //Almacena el contenedor de las notificaciones en una variable
  var notifs = $("#notificationsWindow .notifications");

  //Función para imprimir las notificaciones
  function printNotifications(nots,unseenNotifications,tab){
    //Invierte el Orden
    nots.reverse();
    //Si no tienes notfificaciones
    if(nots.length == 0){
      notifs.html('<center><div style="color:#AAA;font-size:13px;padding-top:18px">Sin notificaciones</div></center>');
      return;
    }else{
      for(var n in nots){
        notifs.append(nots[n]);
      }
    }

    //Muestra las notificaciones no vistas en el contador
    if(unseenNotifications.length == 0){
      $("#notificationsWindow [tab='"+tab+"'] .counter").hide();
    }
    else{
      var bll = parseInt($("#notificationsWindow .bell .counter").html());
      if(bll - unseenNotifications.length == 0){
        $("#notificationsWindow .bell .counter").hide()
      }
      $("#notificationsWindow .bell .counter").html(bll - unseenNotifications.length);
      $("#notificationsWindow [tab='"+tab+"'] .counter").html(unseenNotifications.length).show()

      //Cambia las notifiaciones a vistas
      for(var s in unseenNotifications){
        for(var n in user.notifications){
          if(user.notifications[n]._id == unseenNotifications[s]){
            user.notifications[n].seen = true;
          }
        }
      }

      //Envia las notificaciones vistas
      send("seenNotifications",unseenNotifications);
    }
  }

  //Funcion para seleccionar una pestaña
  function showNotifications(tab){
    //Ordena las notificaciones por fecha
    user.notifications.sort(function(a,b){
      return new Date(a.date) - new Date(b.date);
    });
    //Deselecciona todas las pestañas
    tabs.find(".selectionLine").hide(200);
    //Muestra la pestaña actual
    $("#notificationsWindow").find("[tab='"+tab+"'] .selectionLine").show(200);
    //Limpia las notificaciones
    notifs.empty();
    //Asigna las notificaciones del usuario a una Variables
    var usNts = user.notifications;
    //Si esta en la pestaña de publicaciones
    if(tab==0){

      //Almacena las notificaciones sobre publicaciones
      var pubNts = {};
      //Allmacena el numero total de notificaciones sobre publicaciones
      var allNts = 0;
      //Almacena las notificaciones no vistas
      var unseenNts = [];
      //Almacena el HTML creado para las notificaciones
      var notificationsHTML = [];

      //Cuenta las notificaciones de publicaciones
      for(var n in usNts){
        if(usNts[n].type == "publicationLike" || usNts[n].type == "publicationComment" || usNts[n].type == "newPublication"){
          if(!usNts[n].seen)unseenNts.push(usNts[n]._id);
          pubNts[usNts[n]._id] = usNts[n];
          allNts++;
        }
      }
      //Si no hay notificaciones
      if(allNts == 0){
        printNotifications([],[],tab);
        return;
      }
      //Contador de notifiaciones listaas
      var readyNts = 0;

      //Crea las notificaciones
      for(var id in pubNts){

        //Se clona una notificación
        var n = notification.clone();
        notificationsHTML.push(n);

        //Asigna la fecha
        n.find(".time").html(getTransTime(pubNts[id].date));

        //Verifica si ya se ha visto
        if(pubNts[id].seen){
          n.addClass("seen");
        }

        //Si es sobre un like
        if(pubNts[id].type == "publicationLike"){

          //Asigna la imagen
          n.find("img").attr("src",IMG_LIKE);

          //Asigna el prefijo
          n.find(".pre").html('A');

          //Obtiene los datos de la publicación
          getPublicationsFromID([pubNts[id].pubId],n,function(pub,n){

            //Asigna el tipo de publicación
            if(pub[0].type == "profileImage"){
              n.find(".type").html('Foto de perfil');
            }
            else{
              n.find(".type").html('Publicación');
            }

            //Asigna una previsualicacion si existe
            if(pub[0].message == ""){
              n.find(".info").remove();
            }
            else{
              n.find(".info div").html(pub[0].message);
            }

            //Elimina tu id de los likes, si existe.
            if(pub[0].likes.indexOf(user._id) != -1){
              pub[0].likes.splice(pub[0].likes.indexOf(user._id),1)
            }

            //Asigna la descripción respecto al número de likes
            if(pub[0].likes.length == 1){
              n.find(".description").html('le ha gustado tu');
            }
            else{
              n.find(".description").html('y a '+ (pub[0].likes.length - 1) +'usuarios les ha gustado tu');
            }

            //Busca el usuario que dió el último like
            getUsersFromID([pub[0].likes[pub[0].likes.length - 1]],n,function(us,n){
              //Asigna el nombre de usuarios
              n.find(".user").html(us[0].fname + " " + us[0].lname).attr("userID",us[0]._id);

              //Verifica si es la última notificación
              readyNts++;
              if(readyNts == allNts){
                printNotifications(notificationsHTML,unseenNts,tab);
              }

            });

          });

        }

        //Si es sobre un comentario
        if(pubNts[id].type == "publicationComment"){

          //Asigna la imagen
          n.find("img").attr("src",IMG_COMMENT);

          //Asigna el prefijo
          n.find(".pre").remove();

          //Obtiene los datos de la publicación
          getPublicationsFromID([pubNts[id].pubId],n,function(pub,n){

            //Asigna el tipo de publicación
            if(pub[0].type == "profileImage"){
              n.find(".type").html('Foto de perfil');
            }
            else{
              n.find(".type").html('Publicación');
            }

            //Asigna una previsualicacion si existe
            if(pub[0].message == ""){
              n.find(".info").remove();
            }
            else{
              n.find(".info div").html(pub[0].message);
            }

            //Obtiene la información de los comentarios
            getCommentsFromID(pub[0].comments,n,function(coms,n){
              //Almacena los usuarios que han comentado sin contarte
              var comsCount = 0;
              //Almacena el id del ultimo usuario sin contarte
              var lastCom = null;
              //Cuenta los comentarios
              for(var c in coms){
                if(coms[c].creator != user._id){
                  comsCount++;
                }
              }
              //Obtiene el ultimo comentario
              for(var c = coms.length - 1;c>=0;c--){
                if(coms[c].creator != user._id){
                  lastCom = coms[c].creator;
                  break;
                }
              }
              //Asigna la descripción
              if(comsCount == 1){
                n.find(".description").html("ha comentado");
              }
              else{
                n.find(".description").html("y "+comsCount+" usuarios han comentado");
              }

              //Obtiene los datos del usuario
              getUsersFromID([lastCom],n,function(usr,n){

                //Asigna el nombre de usuarios
                n.find(".user").html(usr[0].fname + " " + usr[0].lname).attr("userID",usr[0]._id);

                //Verifica de quien es la publicación
                if(user._id == pub[0].creator){
                  n.find(".conector").html("tu");
                }
                else{
                  if(usr[0]._id == pub[0].creator){
                    n.find(".conector").html("su");
                  }
                  else{
                    n.find(".conector").html("la");
                  }
                }

                //Verifica si es la última notificación
                readyNts++;
                if(readyNts == allNts){
                  printNotifications(notificationsHTML,unseenNts,tab);
                }

              })

            });

          });

        }

        //Si es sobre una publicación en tu muro
        if(pubNts[id].type == "newPublication"){

          //Asigna la imagen
          n.find("img").attr("src",IMG_POST);

          //Asigna el prefijo
          n.find(".pre").remove();

          //Obtiene los datos de la publicación
          getPublicationsFromID([pubNts[id].pubId],n,function(pub,n){

            //Asigna el conector
            n.find(".conector").html('ha');

            //Asigna el conector fín
            n.find(".space").html('en tu muro.');

            //Asigna el tipo de publicación
            n.find(".type").html('Publicado');

            //Asigna una previsualicacion si existe
            if(pub[0].message == ""){
              n.find(".info").remove();
            }
            else{
              n.find(".info div").html(pub[0].message);
            }
            //Obtiene los datos del creador
            getUsersFromID([pub[0].creator],n,function(usr,n){

              //Asigna el nombre de usuarios
              n.find(".user").html(usr[0].fname + " " + usr[0].lname).attr("userID",usr[0]._id);

              //Verifica si es la última notificación
              readyNts++;
              if(readyNts == allNts){
                printNotifications(notificationsHTML,unseenNts,tab);
              }

            })

          })

        }
      }
    }

    //Si las notificaciones son de seguimiento
    if(tab==1){

      //Almacena las notificaciones sobre seguimiento
      var folNts = {};
      //Allmacena el numero total de notificaciones sobre seguimiento
      var allNts = 0;
      //Almacena las notificaciones no vistas
      var unseenNts = [];
      //Almacena el HTML creado para las notificaciones
      var notificationsHTML = [];

      //Cuenta las notificaciones de seguimiento
      for(var n in usNts){
        if(usNts[n].type == "newFollower"){
          if(!usNts[n].seen)unseenNts.push(usNts[n]._id);
          folNts[usNts[n]._id] = usNts[n];
          allNts++;
        }
      }
      //Si no hay notificaciones
      if(allNts == 0){
        printNotifications([],[],tab);
        return;
      }
      //Contador de notifiaciones listaas
      var readyNts = 0;

      //Crea las notifiaciones
      for(var id in folNts){

        //Se clona una notificación
        var n = notification.clone();
        notificationsHTML.push(n);

        //Asigna la fecha
        n.find(".time").html(getTransTime(folNts[id].date));

        //Elimina el mensaje
        n.find(".info").remove();

        //Verifica si ya se ha visto
        if(folNts[id].seen){
          n.addClass("seen");
        }

        //Si sigue las Preguntas
        if(folNts[id].sec == "questions"){

          //Asigna el tipo
          n.find(".type").html("Preguntas");

          //Asigna la imagen
          n.find("img").attr("src",IMG_QUESTIONS);

          //Asigna la descripción segun el numero de seguidores
          if(user.followers[folNts[id].sec].length == 1){
            n.find(".description").html("ha comenzado a seguir tus");
          }
          else{
            n.find(".description").html("y "+( user.followers[folNts[id].sec].length - 1)+" usuarios más siguen tus");
          }

          //Obtiene la información del utimo usuario que dio like
          getUsersFromID([user.followers[folNts[id].sec][user.followers[folNts[id].sec].length - 1]],n,function(usr,n){
            //Asigna el nombre
            n.find(".user").html(usr[0].fname + " " + usr[0].lname).attr("userID",usr[0]._id);
            //Verifica si es la última notificación
            readyNts++;
            if(readyNts == allNts){
              printNotifications(notificationsHTML,unseenNts,tab);
            }

          });

        }

        //Si sigue las Publicaciones
        if(folNts[id].sec == "publications"){

          //Asigna el tipo
          n.find(".type").html("Publicaciones");

          //Asigna la imagen
          n.find("img").attr("src",IMG_POST);

          //Asigna la descripción segun el numero de seguidores
          if(user.followers[folNts[id].sec].length == 1){
            n.find(".description").html("ha comenzado a seguir tus");
          }
          else{
            n.find(".description").html("y "+( user.followers[folNts[id].sec].length - 1)+" usuarios más siguen tus");
          }

          //Obtiene la información del utimo usuario que dio like
          getUsersFromID([user.followers[folNts[id].sec][user.followers[folNts[id].sec].length - 1]],n,function(usr,n){
            //Asigna el nombre
            n.find(".user").html(usr[0].fname + " " + usr[0].lname).attr("userID",usr[0]._id);
            //Verifica si es la última notificación
            readyNts++;
            if(readyNts == allNts){
              printNotifications(notificationsHTML,unseenNts,tab);
            }

          });

        }

        //Si sigue los Eventos
        if(folNts[id].sec == "events"){

          //Asigna el tipo
          n.find(".type").html("Eventos");

          //Asigna la imagen
          n.find("img").attr("src",IMG_EVENTS);

          //Asigna la descripción segun el numero de seguidores
          if(user.followers[folNts[id].sec].length == 1){
            n.find(".description").html("ha comenzado a seguir tus");
          }
          else{
            n.find(".description").html("y "+( user.followers[folNts[id].sec].length - 1)+" usuarios más siguen tus");
          }

          //Obtiene la información del utimo usuario que dio like
          getUsersFromID([user.followers[folNts[id].sec][user.followers[folNts[id].sec].length - 1]],n,function(usr,n){
            //Asigna el nombre
            n.find(".user").html(usr[0].fname + " " + usr[0].lname).attr("userID",usr[0]._id);
            //Verifica si es la última notificación
            readyNts++;
            if(readyNts == allNts){
              printNotifications(notificationsHTML,unseenNts,tab);
            }

          });

        }
      }
    }
    //Si las notificaciones son de documentos
    if(tab==3){
      //Almacena las notificaciones sobre documentos
      var docNts = {};
      //Allmacena el numero total de notificaciones sobre documentos
      var allNts = 0;
      //Almacena las notificaciones no vistas
      var unseenNts = [];
      //Almacena el HTML creado para las notificaciones
      var notificationsHTML = [];

      //Cuenta las notificaciones de documentos
      for(var n in usNts){
        if(usNts[n].type == "newDocument" || usNts[n].type == "documentReady"){
          if(!usNts[n].seen)unseenNts.push(usNts[n]._id);
          docNts[usNts[n]._id] = usNts[n];
          allNts++;
        }
      }
      //Si no hay notificaciones
      if(allNts == 0){
        printNotifications([],[],tab);
        return;
      }
      //Contador de notifiaciones listaas
      var readyNts = 0;

      //Obtiene los documentos
      getDocuments(function(){

      //Crea las notifiaciones
      for(var id in docNts){
        //Se clona una notificación
        var n = notification.clone();
        notificationsHTML.push(n);

        //Asigna la fecha
        n.find(".time").html(getTransTime(docNts[id].date));

        //Elimina el mensaje
        n.find(".info").remove();


        //Verifica si ya se ha visto
        if(docNts[id].seen){
          n.addClass("seen");
        }


        //Lo almacena en una variable
        var doc = cachedDocuments[docNts[id].docId];

        if(docNts[id].type == "newDocument"){

          //Asigna la imagen
          n.find("img").attr("src",window["IMG_"+fileTypes[doc.type]]);

          //Asigna el tipo
          n.find(".type").html("documento").attr("docId",doc._id).click(function(){
            var i = $(this).attr("docId");
            loadModal("docAprove",function(){
              getDocuments(function(){
                closeOpenNotifications();
                var d = cachedDocuments[i];
                modal.find(".tit").html(d.title);
                modal.find(".subject").html(subjects[d.subject]);
                modal.find(".teacher").html(teachers[d.teacher]);
                modal.find(".year").html(d.year);
                modal.find("a").html(d.url).attr("href",d.url);
                if(d.by == user._id){
                  modal.find(".title").html("Tu documento");
                  modal.find(".app").remove();
                  modal.find(".des").remove();
                }
                else{
                  modal.find(".app").click(function(){
                    modal.fadeOut();
                    send("notificationAprove",{aprove:true,by:user._id,docId:d._id});
                  });
                  modal.find(".des").click(function(){
                    modal.fadeOut();
                    send("notificationAprove",{aprove:false,by:user._id,docId:d._id});
                  });
                }
              })
            });
          })

          //Verifica el creador
          if(docNts[id].by == user._id){
            n.find(".description").html("Tu");
            n.find(".space").html("se ha enviado con éxito, ahora solo debes esperar que 3 usuarios más lo aprueben.");
            readyNts++;
            if(readyNts == allNts){
              printNotifications(notificationsHTML,unseenNts,tab);
            }
          }
          else{
            //Obtiene los datos del creador
            getUsersFromID([docNts[id].by],n,function(usr,n){
              //Asigna el nombre
              n.find(".user").html(usr[0].fname + " " + usr[0].lname).attr("userID",usr[0]._id);
              n.find(".description").html("ha añadido un");
              n.find(".space").html("y espera tu aprobación.");

              readyNts++;
              if(readyNts == allNts){
                printNotifications(notificationsHTML,unseenNts,tab);
              }
            });
          }
        }

        if(docNts[id].type == "documentReady"){
          if(docNts[id].aproved){

            //Asigna la imagen
            n.find("img").attr("src",window["IMG_"+fileTypes[doc.type]]);

            //Asigna el tipo
            n.find(".type").html("documento").attr("docId",doc._id).click(function(){
              var i = $(this).attr("docId");
              closeOpenNotifications();
              loadModal("docAprove",function(){
                getDocuments(function(){
                  var d = cachedDocuments[i];
                  modal.find(".tit").html(d.title);
                  modal.find(".subject").html(subjects[d.subject]);
                  modal.find(".teacher").html(teachers[d.teacher]);
                  modal.find(".year").html(d.year);
                  modal.find("a").html(d.url).attr("href",d.url);
                  modal.find(".title").html("Tu documento");
                  modal.find(".app").remove();
                  modal.find(".des").remove();
                })
              });
            })

            n.find(".pre").html("Tu");
            n.find(".space").html("ha sido aprobado.");

            readyNts++;
            if(readyNts == allNts){
              printNotifications(notificationsHTML,unseenNts,tab);
            }
          }
          else{
            n.find("img").attr("src",IMG_DEL);
            n.find(".pre").html("Lamentablemente tu documento");
            n.find(".description").html("no ha sido aprobado por los usuarios.");
            readyNts++;
            if(readyNts == allNts){
              printNotifications(notificationsHTML,unseenNts,tab);
            }
          }
        }
      }
    });
  }
}

  //Abre y cierra las notificaciones
  $("#notificationsWindow .bell").click(function(){
    closeOpenNotifications();
    if(notifPanelOpen){
      showNotifications(0);
    }
  })

  //Seleccion de tab
  var tabs = $("#notificationsWindow .tabs .tab");
  tabs.click(function(){
    var tab = $(this).attr("tab");
    showNotifications(parseInt(tab));
  });

  loadBell();
}
function closeOpenNotifications(){
  if(notifPanelOpen){
    $("#notificationsWindow").animate({right:-280},200);
  }
  else{
    $("#notificationsWindow").animate({right:0},200);
  }
  notifPanelOpen = !notifPanelOpen;
}
function loadBell(){
  //Muestra las notificaciones no vistas en la campana
  var unseen = 0;
  var A = 0;
  var B = 0;
  var C = 0;
  var D = 0;

  for(var notif in user.notifications){
    if(user.notifications[notif].seen == false){
      var ntype = user.notifications[notif].type;
      if(ntype == "publicationLike" || ntype == "publicationComment" || ntype == "newPublication")A++;
      if(ntype == "newFollower")B++;
      if(ntype == "newDocument" || ntype == "documentReady")D++;

      unseen++;
    }
  }
  if(unseen == 0){
    $("#notificationsWindow .bell .counter").html(unseen).hide();
  }
  else{
    $("#notificationsWindow .bell .counter").html(unseen).show(200);
    if(A == 0){$("#notificationsWindow [tab='"+0+"'] .counter").html(A).hide();}
    else{$("#notificationsWindow [tab='"+0+"'] .counter").html(A).show();}
    if(B == 0){$("#notificationsWindow [tab='"+1+"'] .counter").html(B).hide();}
    else{$("#notificationsWindow [tab='"+1+"'] .counter").html(B).show();}
    if(D == 0){$("#notificationsWindow [tab='"+3+"'] .counter").html(D).hide();}
    else{$("#notificationsWindow [tab='"+3+"'] .counter").html(D).show();}
  }
}
