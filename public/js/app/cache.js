/////////////////////////////////////////////////////////////////
// - - - - - - - - - - - DATA MANAGER - - - - - - - - - - - - //
///////////////////////////////////////////////////////////////


//Checkea las cookies para ver si el usuario sigue conectado
function checkState(){
  if (($.cookie('email')||$.cookie('pass')) == undefined) {
   window.location.href = "/login.html";
  }
}

//Guarda los chats en el caché
function saveChatsInCache(data){
  for(var cha in data){
    if(!isChatInCache(data[cha]._id)){
      var id = data[cha]._id;
      //delete data[img]._id;
      cachedChats[id] = data[cha];
    }
  }
  saveCurrentChats();
}

//Guarda los chats en el caché
function saveDocumentsInCache(data){
  for(var cha in data){
    if(!isDocumentInCache(data[cha]._id)){
      var id = data[cha]._id;
      //delete data[img]._id;
      cachedDocuments[id] = data[cha];
    }
  }
  saveCurrentDocuments();
}

//Guarda las imagenes en el caché
function saveImagesInCache(data){
  for(var img in data){
    if(!isImageInCache(data[img]._id)){
      var id = data[img]._id;
      //delete data[img]._id;
      cachedImages[id] = data[img];
    }
  }
  saveCurrentPhotos();
}

//Guarda las publicaciones en el caché
function savePublicationsInCache(data){
  for(var pub in data){
    if(!isImageInCache(data[pub]._id)){
      var id = data[pub]._id;
      //delete data[pub]._id;
      cachedPublications[id] = data[pub];
    }
  }
  saveCurrentPublications();
}

//Guarda los usuarios en el caché
function saveUsersInCache(data){
  for(var usr in data){
    if(!isUserInCache(data[usr]._id)){
      var id = data[usr]._id;
      //delete data[usr]._id;
      cachedUsers[id] = data[usr];
    }
  }
  saveCurrentUser();
}

//Guarda los comentarios en el caché
function saveCommentsInCache(data){
  for(var com in data){
    if(!isCommentInCache(data[com]._id)){
      var id = data[com]._id;
      //delete data[usr]._id;
      cachedComments[id] = data[com];
    }
  }
  saveCurrentComments();
}

//Detecta si la imagen esta guardada
function isImageInCache(id){
    if(id in cachedImages) return true;
    return false;
}

//Detecta si la imagen esta guardada
function isPublicationInCache(id){
    if(id in cachedPublications) return true;
    return false;
}

//Detecta si el usuario esta guardado
function isUserInCache(id){
    if(id in cachedUsers) return true;
    return false;
}

//Detecta si el chat esta guardado
function isChatInCache(id){
    if(id in cachedChats) return true;
    return false;
}

//Detecta si el comentario esta guardado
function isCommentInCache(id){
    if(id in cachedComments) return true;
    return false;
}

//Detecta si el documento esta guardado
function isDocumentInCache(id){
    if(id in cachedDocuments) return true;
    return false;
}


//Carga los datos del cache
function loadCache(){
  cachedImages = JSON.parse(localStorage.getItem('photos'));
  cachedPublications = JSON.parse(localStorage.getItem('publications'));
  cachedUsers = JSON.parse(localStorage.getItem('users'));
  cachedChats = JSON.parse(localStorage.getItem('chats'));
  cachedComments = JSON.parse(localStorage.getItem('chats'));
  cachedDocuments = JSON.parse(localStorage.getItem('documents'));
  if(cachedImages == null) cachedImages = {};
  if(cachedPublications == null) cachedPublications = {};
  if(cachedUsers == null) cachedUsers = {};
  if(cachedChats == null) cachedChats = {};
  if(cachedComments == null) cachedComments = {};
  if(cachedDocuments == null) cachedDocuments = {};
}

//Guarda el usuario actual
function saveCurrentUser(){
  //localStorage["user"] = JSON.stringify(user);
}
function saveCurrentPublications(){
  //localStorage["publications"] = JSON.stringify(cachedPublications);
}
function saveCurrentPhotos(){
  //localStorage["photos"] = JSON.stringify(cachedImages);
}
function saveCurrentUsers(){
  //localStorage["users"] = JSON.stringify(cachedUsers);
}
function saveCurrentChats(){
  //localStorage["chats"] = JSON.stringify(cachedChats);
}
function saveCurrentComments(){
  //localStorage["comments"] = JSON.stringify(cachedComments);
}
function saveCurrentDocuments(){
  //localStorage["documents"] = JSON.stringify(cachedDocuments);
}
