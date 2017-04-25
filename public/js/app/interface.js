
////////////////////////////////////////////////////////////
// - - - - - - - - - - - INTERFACE - - - - - - - - - - - //
//////////////////////////////////////////////////////////

//Mostar modal
function loadModal(mod,callback,extradata){
  modal.load("/modals/"+ mod + ".html",function(){
    modal.fadeIn(200);
    if(callback === undefined)return;
    callback();
  });
}

//Mostar usuario
function showUser(id){
  usersSectionAction = {action:"showUser",data:id};
  showSection("users");
}

//Actualiza el tiempo de las publicaciones
function refreshTime(){
  for(var i in timeElements){
    timeElements[i].element.html(getTransTime(timeElements[i].moment));
  }
  setTimeout(function(){ refreshTime() }, 60000);
}

//Actualiza el tiempo de las publicaciones
function clearConsole(){
  console.clear();
  setTimeout(function(){ clearConsole() }, 1000);
}
//clearConsole();



function globalEvents(){


  //Seguir preguntas
  $(document).on("click",".goToUser",function(){
    var i = $(this).attr("userID");
    currentSection = "users";
    showProfileSection(i);
    if(notifPanelOpen){
      closeOpenNotifications()
    }
    topBar.find(".selectionLine").hide(200);
    topBar.find(".topBarItem[section='users']").children(".selectionLine").show(200);
  });

  //Seguir preguntas
  middleBar.on("click",".preguntas",function(){
    send("follow",{to:currentUser._id,sec:"questions"});
  });

  //Seguir publicaciones
  middleBar.on("click",".publicaciones",function(){
    send("follow",{to:currentUser._id,sec:"publications"});
  });

  //Seguir eventos
  middleBar.on("click",".eventos",function(){
    send("follow",{to:currentUser._id,sec:"events"});
  });

  //Like publication
  middleBar.on("click",".infoBar .gus",function(){
    send("likePublication",$(this).parent().parent().attr("publicationID"))
  });

  middleBar.on("click",".imageAdded,.miniImageAdded,.miniMoreImageAdded",function(){
    var id = $(this).closest(".publication").attr("publicationID");
    var fid = $(this).attr("photoID");
    getPublicationsFromID([id],null,function(pub){
      photoDisplay(pub[0].photos,pub[0].photos.indexOf(fid),{section:"publicationPhotos",id:id});
    });
  });

  //Show likes
  middleBar.on("mouseover",".infoBar .gus",function(){
    //$(this).parent().parent().attr("publicationID");
  });

  //Show followers
  middleBar.on("click",".followers",function(){
    loadModal("followers",function(){
      var us = modal.find(".prefabs .user");
        disp(".A",currentUser.followers.questions);
      modal.find(".A").click(function(){
        disp(".A",currentUser.followers.questions);
      });
      modal.find(".B").click(function(){
        disp(".B",currentUser.followers.publications);
      });
      modal.find(".C").click(function(){
        disp(".C",currentUser.followers.events);
      });
      function disp(clas,varr){
        modal.find(".cont").empty();
        modal.find(".line").hide(200);
        modal.find(clas + " .line").show(200);
        getUsersFromID(varr,us,function(dat){
          if(dat.length == 0){
            modal.find(".cont").append("<div style='width:100%;margin-top:140px;color:#999;text-align:center;font-size:13px'>Sin seguidores</div>");
            return;
          }
          for(var f in dat){
            var u = us.clone();
            u.find("div").html(dat[f].fname+" "+dat[f].lname).attr("userID",dat[f]._id);
            modal.find(".cont").append(u);
            getImagesFromID([dat[f].profileImage],u,function(re){
              u.find("img").attr("src",imgSize(re[0].url,"s"));
            })
          }
        });
      }
    });
  });

  //Show followers
  middleBar.on("click",".following",function(){
    loadModal("followers",function(){
      modal.find(".title").html("Siguiendo");
      var us = modal.find(".prefabs .user");
        disp(".A",currentUser.following.questions);
      modal.find(".A").click(function(){
        disp(".A",currentUser.following.questions);
      });
      modal.find(".B").click(function(){
        disp(".B",currentUser.following.publications);
      });
      modal.find(".C").click(function(){
        disp(".C",currentUser.following.events);
      });
      function disp(clas,varr){
        modal.find(".cont").empty();
        modal.find(".line").hide(200);
        modal.find(clas + " .line").show(200);
        getUsersFromID(varr,us,function(dat){
          if(dat.length == 0){
            modal.find(".cont").append("<div style='width:100%;margin-top:140px;color:#999;text-align:center;font-size:13px'>Sin seguidos</div>");
            return;
          }
          for(var f in dat){
            var u = us.clone();
            u.find("div").html(dat[f].fname+" "+dat[f].lname).attr("userID",dat[f]._id);
            modal.find(".cont").append(u);
            getImagesFromID([dat[f].profileImage],u,function(re){
              u.find("img").attr("src",imgSize(re[0].url,"s"));
            })
          }
        });
      }
    });
  });


  //Dropdown de comentario
  modal.on("click",".comms .options",function(event){

    //Previene que se cierre automaticamente
    event.stopPropagation();

    var parent = $(this).parent();
    var id = parent.parent().parent().attr("publicationID");
    var dd = pubDropdown.clone().append('<div class="btn delete">Eliminar</div>').show().css({top:22,right:1,"z-index":100});
    parent.append(dd);
    dd.find(".delete").click(function(){
      send("deleteComment",{id:$(this).parent().parent().attr("commentID"),pid:id});
    });
  });

  //Muestra los comentarios
  middleBar.on("click",".infoBar .com",function(){
    var id = $(this).parent().parent().attr("publicationID");
    loadModal("comments",function(){
      $(".modal.comments").attr("publicationID",id);
      getCommentsFromID(cachedPublications[id].comments,null,function(data){
        if(data.length == 0){
          $(".modal .comms").html("<div class='noComms'>Nadie ha comentado</div>");
          return;
        }
        for(var c in data){
          var com = comment.clone();
          com.find(".text").html(safe(data[c].text));
          com.attr("commentID",data[c]._id);
          com.find(".time").html(getTransTime(data[c].time));
          if(data[c].creator != user._id){
            com.find(".options").hide();
          }
          com.appendTo(".modal .comms");
          modal.find(".comms").animate({ scrollTop: modal.find(".comms").prop('scrollHeight') + 1000 }, 0);
          getUsersFromID([data[c].creator],com,function(data1,com){
            com.find(".fullname").html(data1[0].fname +" "+ data1[0].lname);
            if(data1[0].profileImage == null){
              com.find(".profImg").attr("src",IMG_USER);
            }
            else{
              getImagesFromID([data1[0].profileImage],com,function(data2,com){
                com.find(".profImg").attr("src",imgSize(data2[0].url,'s'));
              });
            }
          });
        }
      });
    });
  });

  $(window).click(function(){
    $(".dropdown").remove();
  });

  //Dropdow de publicaciones
  middleBar.on("click",".publication .options",function(event){

    //Previene que se cierre automaticamente
    event.stopPropagation();

    //Guarda la publicacion en una variable
    var parent = $(this).parent().parent();

    //Obtiene el id de la publicación
    var id = parent.attr("publicationID");

    //Si el menu ya esta abierto se detiene la funcion
    if(parent.find(".dropdown")[0]) return;

    //Se crea un clon de menu y se añade a la publicación
    var menu;
    if(user.publications.indexOf(id)!=-1){
      menu = pubDropdown.clone().append('<div class="btn edit">Editar mensaje</div><div class="btn delete">Eliminar</div>').show().appendTo(parent);
    }
    else{
      menu = pubDropdown.clone().append('<div class="btn denunciar">Denunciar contenido</div>').show().appendTo(parent);
    }

    menu.find(".delete").click(function(){
      loadModal("alert",function(){
        modal.find(".sve").click(function(){
          send("deletePublication",{id:id});
          modal.empty().fadeOut(200);
        });
      });
    });

    menu.find(".edit").click(function(){
      loadModal("editPublication",function(){
        modal.find(".text").val(cachedPublications[id].message);
        modal.find(".sve").click(function(){
          send("editPublication",{id:id,message:modal.find(".text").val()});
          _msg.children(".text").html(safe(user.message));
          modal.empty().fadeOut(200);
        });
      })
    });


  });
  //Dropdow de logout
  topBar.find(".logout").click(function(event){

    //Previene que se cierre automaticamente
    event.stopPropagation();

    //Guarda la publicacion en una variable
    var parent = $(this).parent();

    //Si el menu ya esta abierto se detiene la funcion
    if(parent.find(".dropdown")[0]) return;

    //Se crea un clon de menu y se añade a la publicación
    var menu = pubDropdown.clone().css({top:'50px',right:'13px','box-shadow':'0px 0px 1px 0px gray'}).append('<div style="white-space: nowrap;margin-left:10px;margin-right:10px" class="btn lo">Cerrar Sesión</div>').show().appendTo(parent);

    menu.find(".lo").click(function(){
      window.location = "/logout"
    })

  });
}


//Eventos del modal
function modalEvents(){
  modal.click(function(e){if(e.target == this) modal.fadeOut(200)});
}

//Activa el responsive de la pagina
function responsive(){
  rsize();
  win.resize(function() {
    rsize()
  });
  function rsize(){
    var width = win.width();
    if(width < 995){
      rightBar.hide();
      middleBar.css({"width":"calc(100vw - 245px)"});
    }
    else{
      rightBar.show();
      middleBar.css({"width":"calc(100vw - 525px)"});
    }
  }
}

//Carga una seccion al apretar sobre alguna pestaña
function sectionTrigger(){
  topBar.find(".topBarItem").click(function(){
    var sec = $(this).attr("section");
    usersSectionAction = {action:null,data:null};
    if(sec != currentSection){
      showSection(sec);
    }
  });
}
