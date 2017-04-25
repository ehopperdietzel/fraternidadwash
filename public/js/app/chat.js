
//Crea un nuevo contacto y chat.
function createChat(id){
  post([currentUser._id,user._id],'/createChat',function(a){
    if(a != false){
      user.chats.push(a);
      getChatsFromID([a],a,function(res,a){
         addContact(res[0]);
         selectChat(a,true);
      })
    }
  });
}

//Inicia el chat
function loadChat(){

  //Buscador de contactos
  chatWindow.find(".searchMessages input").keyup(function(){
    if($(this).val().length != 0){
      var search = $(this).val().toLowerCase().split(" ");
      var contacts = chatWindow.find(".messages .contact").toArray();
      var found = 0;
      for(var c in contacts){
        var pass = false;
        for(var s in search){
          if($(contacts[c]).find(".contactName").html().toLowerCase().indexOf(search[s])!=-1){
            pass = true;
            found++;
            break;
          }
        }
        if(pass){
          $(contacts[c]).show();
        }
        else{
          $(contacts[c]).hide();
        }
      }
      if(found>0){
        chatWindow.find(".noFound").hide();
      }
      else{
        chatWindow.find(".noFound").show();
      }
    }
    else{
      chatWindow.find(".noFound").hide();
      chatWindow.find(".messages .contact").show();
    }
  });

  chat.find(".chatInput input").keypress(function(e){
    if(e.which == 13){
      var msg = {id:currentChatID,text:$(this).val(),from:user._id,files:[],photos:[],seenBy:[user._id],date:new Date()};
      if(msg.text == "")return;
      writeMessage(msg,true);
      send("chatMessage",msg);
      $(this).val('');
    }
  });

  chatObj = {
    active:false,
    open:function(){
      chat.slideDown(256,function(){
        chat.find(".messages").css('height','calc(100% - 420px)');
      });
      this.active = true;
    },
    close:function(){
      chatWindow.find(".selectionLine").hide(200);
      chat.slideUp(256);
      chat.find(".messages").css("height","100%");
      this.active = false;
    }
  };

  displayUserContacts();

}

//Abre un chat
function selectChat(idd,open){
  //Asigna el ID a la variable global
  currentChatID = idd;
  //Esconde el contador de mensajes no vistos.
  $("[chatID='"+idd+"']").find(".counter").hide();
  //Esconde el indicador de visto
  chatMessages.parent().find('.visto').hide();
  //Muestra la linea de seleccion
  chatWindow.find(".selectionLine").hide(200);
  chatWindow.find("[chatID='"+idd+"']").find(".selectionLine").show(200);
  //Obtiene el contenido de los chats
  getChatsFromID([idd],null,function(d){
    var idd = d[0]._id;


    //Checkea si existen mensajes
    if(d[0].messages.length != 0){
      //Envia el visto, si el último mensaje no ha sido leido y es del otro usuario
      if(d[0].messages[d[0].messages.length -1 ].from != user._id && d[0].messages[d[0].messages.length -1 ].seenBy.length == 1){
        seen(idd);
      }
    }
    //Detecta si el chat tiene nombre
    if(open){
      if(d[0].name == null){

        //Obtiene el id del otro usuario
        var inte = d[0].integrants;
        if(inte.length > 1){
          inte.splice(inte.indexOf(user._id),1);
        }

        getUsersFromID(inte,chat,function(data,chat){

            //Asigna el nombre del otro usuario al chat
            chat.find(".chatName").html(data[0].fname + " " + data[0].lname);

            //Detecta si el usuario esta conectado
            if(data[0].connected){
              chat.find(".contactStatus").removeClass("OFF").addClass("ON");
            }
            else{
              chat.find(".contactStatus").removeClass("ON").addClass("OFF");
            }
          });
        }
      else{
          //Asigna el nombre guardado del chat
          chat.find(".chatName").html(d[0].name);
      }

      //Limpia el chat
      chatMessages.empty();

      //Imprime los mensajes
      var msgs = d[0].messages;
      if(msgs.length > 0){
        if(msgs.length>25){
          for(var m = msgs.length - 20;m<msgs.length; m++){
            writeMessage(msgs[m],false);
          }
        }
        else{
          for(var m = 0;m<msgs.length; m++){
            writeMessage(msgs[m],false);
          }
        }
      }
      if(msgs.length != 0){
        if(msgs[msgs.length - 1].seenBy.length > 1 && msgs[msgs.length - 1].from == user._id){
          chatMessages.parent().find('.visto').show();
        }
      }

      //Abre el chat
      chatObj.open();


      //Scrollea al final del chat
      chatMessages.parent().css({opacity:0}).animate({ scrollTop: chatMessages.prop('scrollHeight') }, 10,function(){
        $(this).css({opacity:1});
      });
    }
  })
}

//Cuando llega un mensaje
function messageArrive(data){
  //Añade el chat si no lo tenia
  if(!isChatInCache(data.id)){
    user.chats.push(data.id);
    getChatsFromID([data.id],null,function(da){
      addContact(cachedChats[data.id]);
      //selectChat(data.id,false);
    })
    return;
  }
  else{
    if(cachedChats[data.id].messages.length == 0 && cachedChats[data.id].creator != user._id){
      cachedChats[data.id].messages.push(data);
      addContact(cachedChats[data.id]);
      return;
    }
    else{
      if(data.from != user._id){
        writeMessage(data,false)
        if(user.soundMsg){
          audio.play();
        }
      }
    }
  }
  chatWindow.find("[chatID='"+data.id+"']").prependTo(chatWindow.find("[chatID='"+data.id+"']").parent());
  cachedChats[data.id].messages.push(data);
  if(data.from == user._id){
    $("[chatID='"+data.id+"']").find(".lastMessage").html(safe("Tu: "+data.text));
    $(".normalMessage").removeClass("faded");
  }
  else{
    if((chatObj.active && currentChatID != data.id) || !chatObj.active){
      var unseen = 0;
      for(var i = cachedChats[data.id].messages.length - 1;i>=0;i--){
        if(cachedChats[data.id].messages[i].from != user._id && cachedChats[data.id].messages[i].seenBy.indexOf(user._id) == -1){
          unseen++;
        }
        else{
          break;
        }
      }
      if(unseen == 0){
        $("[chatID='"+data.id+"']").find(".counter").hide();
      }
      else{
        $("[chatID='"+data.id+"']").find(".counter").show().html(unseen);
      }
    }
    if(chatObj.active){
      if(currentChatID == data.id && data.from != user._id){
        seen(data.id);
      }
    }
    getUsersFromID([data.from],null,function(da){
      if(da.length != 0){
        $("[chatID='"+data.id+"']").find(".lastMessage").html(safe(da[0].fname+": "+data.text));
      }
    })
  }

  //cachedChats[data.id].messages.push(data);
  //saveChatsInCache();
  //addMessage(data);
}

//Escribir mensaje en ventana chat
function writeMessage(msg,faded){   //Si es faded se añadira tranparente porque aun no se valida

  //Si el mensaje es del chat actual
  if(currentChatID == msg.id){

    //Sube el chat
    chatMessages.parent().animate({ scrollTop: chatMessages.prop('scrollHeight') }, 10);

    //Clona el mensaje
    var hms = chatMessage.clone();

    //Escribe el texto
    hms.find(".texto").html(safe(msg.text));

    //Añade el momento de envío
    hms.find(".view").html(getTransTime(msg.date));

    //Si el mensaje fue visto
    if(msg.seenBy.length > 1){
      if(msg.from == user._id){
        chatMessages.parent().find('.visto').show();
      }
    }
    if(msg.seenBy.length == 1 || msg.from != user._id){
      chatMessages.parent().find('.visto').hide();
    }

    //Si el mensaje es propio
    if(msg.from == user._id){

      hms.addClass("messageA");

      //Si es mensaje no validado
      if(faded){
        hms.addClass("faded");
      }

    }
    else{
      hms.addClass("messageB");
    }
    hms.appendTo($(chatMessages));
  }
}

//Añade el visto
function seen(chatID){
  send("seen",{by:user._id,chatID:chatID});
}

//Muestra los contactos

function displayUserContacts(){

  if(user.chats.length == 0){
    chatWindow.find(".messages").html('<div id="noContacts" style="font-size:13px;color:#CCC;padding-top:8px;text-align:center">Sin conversaciones</div>');
  }
  else{
    getChatsFromID(user.chats,null,function(data,el){

      //Ordena los chats por fecha
      function sortCont(a, b){
        if(a.messages.length > 0 && b.messages.length > 0){
          var dateA = new Date(a.messages[a.messages.length - 1].date);
          var dateB = new Date(b.messages[b.messages.length - 1].date);
          return dateB - dateA;
        }
        else{
          return -1;
        }
      }
      data.sort(sortCont);
      for(var c in data){
        addContact(data[c])
      }
    });
  }
}

function addContact(con){
  $("#noContacts").remove();
  var messages = chatWindow.find(".messages");
  var cht = chatMessages;

  //Esconde el chat si esta vacio y no es el creador
  if(con.messages.length == 0 && con.creator != user._id ){
    return;
  }

  var conta = contact.clone();

  //Le asigna el id al contacto
  conta.attr("chatID",con._id);

  //Al hacer click en un chat
  conta.click(function(){
    var idd = $(this).attr("chatID");
    selectChat(idd,true);
  });

  //Si no hay mensajes
  if(con['messages'].length == 0){
    conta.find(".lastMessage").html("Sin mensajes");
    conta.find(".counter").hide();
  }else{
    //Cuenta los mensajes no vistos
    var unseen = 0;
    for(var i = con.messages.length - 1;i>=0;i--){
      if(con.messages[i].from != user._id && con.messages[i].seenBy.indexOf(user._id) == -1){
        unseen++;
      }
      else{
        break;
      }
    }
    if(unseen == 0){
      conta.find(".counter").hide();
    }
    else{
      conta.find(".counter").show().html(unseen);
    }
    if(con.messages[con.messages.length -1].from == user._id){
      conta.find(".lastMessage").html(safe("Tu: "+con.messages[con.messages.length -1].text));
    }
    else{
      getUsersFromID([con.messages[con.messages.length -1].from],conta,function(da,elem){

        if(da.length != 0){
          if(con['messages'].length != 0){
            elem.find(".lastMessage").html(safe(da[0].fname+": "+con.messages[con.messages.length -1].text));
          }

        }
      });
    }
  }
  var us = con.integrants;
  if(us.length>1){
    us.splice(con.integrants.indexOf(user._id),1);
  }


  getUsersFromID(us,conta,function(usr,elem){

    elem.find(".contactName").html(safe(usr[0].fname + " " +usr[0].lname));
    messages.append(elem);
    elem.attr("chatUserID",usr[0]._id);
    if(usr[0].connected){
      elem.find(".contactStatus").addClass("ON");
    }
    else{
      elem.find(".contactStatus").addClass("OFF");
    }
    if(usr[0].profileImage == null){
      elem.find(".contactImage").attr("src",IMG_USER);
    }
    else{
      getImagesFromID([usr[0].profileImage],elem,function(img,elem){
        elem.find(".contactImage").attr("src",imgSize(img[0].url,'s'));
      })
    }
  });
}
