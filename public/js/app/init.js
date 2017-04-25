

//Espera a que cargue la página
$(document).ready(function(){

  //Instancias de elementos HTML
  win              = $(window);
  doc              = $(document);
  modal            = $("#modal");
  rightBar         = $("#rightBar");
  middleBar        = $("#middleBar");
  topBar           = $("#topBar");
  chatWindow       = $("#chatWindow");
  chat             = $("#chat");
  photoInput       = $('#photoUploader input');
  prefabs          = $('#prefabs');
  downloader       = $('#downloader');
  chatMessages     = chat.find(".msgs");
  publication      = prefabs.find(".publication");
  miniImage        = prefabs.find(".imgCont");
  miniImg          = prefabs.find(".miniImageAdded");
  bigImg           = prefabs.find(".imageAdded");
  pubDropdown      = prefabs.find(".dropdown");
  userCard         = prefabs.find(".userCard");
  contact          = prefabs.find(".contact");
  chatMessage      = prefabs.find(".normalMessage");
  comment          = prefabs.find(".comm");
  docPrefab        = prefabs.find(".docPrefab");
  notification     = prefabs.find(".notification");

  //Activa las cards de las publicaciones
  initEmbedly();

  //Añade eventos
  modalEvents();

  //Añade eventos globales
  globalEvents();

  //Checkear estado de cookies
  checkState();

  //Checkear path del URL
  checkURL();

  //Activa el subidor de fotos
  photoUploader();

  //Actualiza el tiempo transcurrido de los elementos
  refreshTime();

  //Obtener datos del usuario
  getUserData(function(){

    //Carga los archivos en caché
    loadCache();

    //Muestra la seccion actual
    showSection(currentSection);

    //Activa el responsive
    responsive();

    //Al hacer click en una seccion
    sectionTrigger();

    //Inicia los sockets
    startSockets();

    //Load chat
    loadChat();

    //Load notifications
    loadNotifications();

  });

});


function showSection(id,callback){

  //Guarda la seccion actual
  currentSection = id;

  //Verifica que este completo el registro
  if(user.status == "incomplete"){
    loadModal("initTutorial");
    return;
  }

  //Carga el html de la sección
  middleBar.load("/sections/"+id + ".html",function(){

    if(currentSection == "profile")showProfileSection(user._id);
    if(currentSection == "configurations")showConfigurationsSection();
    if(currentSection == "users")showUsersSection();
    if(currentSection == "documents")showDocumentsSection();
    if(currentSection == "publications")showPublicationsSection();
  });

  //Muestra el cambio de seccion en la barra superior
  topBar.find(".selectionLine").hide(200);
  topBar.find(".topBarItem[section='"+id+"']").children(".selectionLine").show(200);
}

function initEmbedly(){
  embedly("defaults", {
    cards: {
      key: 'eaf58c5de2004b6c8ac3b477bbc10876',
      width: 350,
      height:200,
      align: 'left',
      controls:"0",
      theme:"light",
      chrome: "1"
    }
  });
  embedly('on', 'card.rendered', function(iframe){
    console.clear();
  });
}
