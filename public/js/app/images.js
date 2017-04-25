
/////////////////////////////////////////////////////////////
// - - - - - - - - - - - IMAGES - - - - - - - - - - - - ////
///////////////////////////////////////////////////////////

function croopper(url){
  var crop;

  loadModal("cropper",function(){
    crop = $('#imageCropper .cropper').croppie({
      viewport: {
        width: 200,
        height: 200
      }
    });

    crop.croppie('bind', {
      url: url
    });


    $('#imageCropper .no').click(function(){
      photoInput.val('');
      modal.fadeOut(200);
    });

    $('#imageCropper .ok').click(function(){
      modal.fadeOut(200);
      crop.croppie('result', {type:'base64',size:'original', quality:1, circle:false}).then(function(img) {
        var previusImage = _profileImage.attr("src");
      _profileImage.attr("src","").addClass("loading");

      uploadImage(img,function(id){
        $.ajax({
            url: '/uploadPhoto',
            type: 'POST',
            data: {img1:id},
            error:function(){
            },
            success: function(data){
              if(data == '500'){
                _profileImage.attr("src",previusImage);
                return;
              }
              user.profileImage = data.images;
              user.photos.push(data.images);
              data.publication.photos = [data.images];
              user.publications.push(data.publication);
              if(user._id in cachedUsers){
                cachedUsers[user._id].profileImage = data.images;
              }
              saveCurrentUser();
              saveCurrentUsers();
              currentProfileSection = "";
              showSection(currentSection);
              _profileImage.show();
            }
          });
        });
      });
    });
  });
}
//Activar subidor de fotos
function photoUploader(){

  photoInput.change(function(){

    if (this.files.length != 1) return;

    var input = this;
    var file  = input.files[0];
    var name  = file.name;
    var size  = file.size;
    var type  = file.type;

    if(!(type == "image/png"||type == "image/gif"||type == "image/jpeg")){
      return;
    }

    var reader = new FileReader();
    reader.onload = function (e) {
      croopper(e.target.result);
    }
    reader.readAsDataURL(input.files[0]);


  });
}

//Resize photos
function imageToDataUri(ImA, w, h, callback) {
    var img = new Image();
    img.src = ImA;
    img.onload = function() {
      var canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      var ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      callback(canvas.toDataURL());
  }
}
//Resize photos
function png(base64, callback) {
    var img = new Image();
    if(base64.length < 50){
      img.crossOrigin = 'anonymous';
    }
    img.src = base64;
    img.onload = function() {
      var canvas = document.createElement('canvas');
      canvas.width = this.width;
      canvas.height = this.height;
      var ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, this.width, this.height);
      callback(canvas.toDataURL("image/png"));
  }
}

function uploadImage(png,callback){
  var i = png.replace(/^data:image\/png;base64,/, "");
  $.ajax({
    url: 'https://api.imgur.com/3/image',
    method: 'POST',
    headers: {
        Authorization: 'Client-ID a4890278a765a8e'
    },
    data: {
        image:i,
        type:'base64'
    },
    error: function(data) {
      callback(false);
    },
    success: function(data) {
      callback({url:data.data.link,width:parseInt(data.data.width),height:parseInt(data.data.height)});
    }
  });
}
//From puede ser "publicationPhotos" "userPhotos" "profileImage"
function photoDisplay(imgs,initIndex,from,callback,extradata){
  loadModal("photoDisplay",function(){
    getImagesFromID(imgs,null,function(images){
      function setImg(){
        if(initIndex > images.length - 1){
          initIndex = 0;
        }
        if(initIndex < 0){
          initIndex = images.length - 1;
        }
        getUsersFromID([images[initIndex].uploader],images[initIndex],function(usr,img){
          modal.find("._username").html(usr[0].fname + " " + usr[0].lname);
          modal.attr("photoID",img._id).attr("fromSection",from.section).attr("fromID",from.id);
          modal.find("._time").html(getTransTime(img.creationTime));
          modal.find("._photo").height(iW(modal.find("._photo").width(),img.width,img.height)).attr("src",img.url);


          getImagesFromID([usr[0].profileImage],null,function(usrImg){
            modal.find("._userPhoto").attr("src",imgSize(usrImg[0].url,"s"));
          });

          //Opciones de imagen
          modal.on("click","._options",function(event){

            //Previene que se cierre automaticamente
            event.stopPropagation();

            var parent = $(this).parent();
            var id = $(this).closest("._photo").attr("photoID");
            var opts = '<div class="btn setImg">Establecer como foto de perfil</div><div class="btn download">Descargar</div><div class="btn delete">Eliminar</div>';
            var from = modal.attr("fromSection");
            if(from == "userPhotos"){
              if(currentUser._id != user._id){
                opts = '<div class="btn setImg">Establecer como foto de perfil</div><div class="btn download">Descargar</div>';
              }
            }
            if(from == "publicationPhotos"){
              if(user.publications.indexOf(modal.attr("fromID"))==-1){
                opts = '<div class="btn setImg">Establecer como foto de perfil</div><div class="btn download">Descargar</div>';
              }
            }
            if(from == "profileImage"){
              if(user.profileImage != modal.attr("photoID")){
                opts = '<div class="btn setImg">Establecer como foto de perfil</div><div class="btn download">Descargar</div>';
              }
            }
            var dd = pubDropdown.clone().append(opts).show().css({top:32,right:6,"z-index":100})
            parent.append(dd);
            dd.find(".delete").click(function(){
              var fid = modal.attr("photoID");
              var fromID = modal.attr("fromID");
              var fromSection = modal.attr("fromSection");
              if(fromSection == "publicationPhotos"){
                loadModal("alert",function(){
                  modal.find(".title").html("¿Deseas eliminar esta foto de la publicacion?");
                  modal.find(".sve").click(function(){
                    modal.fadeOut(200);
                    getPublicationsFromID([fromID],null,function(res){
                      if(res.length != 0){
                        if(res[0].message == '' && res[0].photos.length == 1 && res[0].url == null){
                            send("deletePublication",{id:res[0]._id});
                        }
                        else{
                          send("deletePublicationImage",{fid:fid,pid:fromID});
                          return;
                        }
                      }
                    });
                  });
                });
              }
              if(fromSection == "userPhotos"){
                loadModal("alert",function(){
                  modal.find(".title").html("¿Deseas eliminar esta foto de tu album?");
                  modal.find(".sve").click(function(){
                    send("deleteAlbumImage",{fid:fid});
                    modal.fadeOut(200);
                  });
                  return;
                });
              }
            });
            dd.find(".download").click(function(){
              var id = modal.attr("photoID");
              getImagesFromID([id],null,function(im){
                downloadImage(im[0].url);
              });
            });
            dd.find(".setImg").click(function(){
              var id = modal.attr("photoID");
              getImagesFromID([id],null,function(im){
                png(im[0].url, function(d) {
                  croopper(d);
                });
              });
            });
          });
        });
      }

      setImg();

      if(images.length == 1){
        modal.find(".controls").hide();
      }

      modal.find(".left").click(function(){
        initIndex--;
        setImg();
      });

      modal.find(".right").click(function(){
        initIndex++;
        setImg();
      });

    })
  },imgs);
}
function downloadImage(url){
  var link = document.createElement('a');
  link.href = url;
  link.download = 'foto.jpg';
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function iW(c,a,b){
  return (b/a)*c;
}

//Carga imagen
function loadImage(e,img){
  e.src = img;
  e.onload = function(){
    $(e).removeClass( "loading" )
  }
}
//Obtiene el tamaño de la imagen
function imgSize(url,size){
  var path = url;
  path = path.substring(0,url.lastIndexOf("."));
  var extension = url.substring(url.lastIndexOf("."),url.length);
  return path+size+extension;
}
//Elimina el cargando
function imageReady(e){
  $(e).removeClass( "loading" ).removeClass( "hidden" )
}
