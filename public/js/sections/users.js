function showUsersSection(){

  var currentCity, currentCareer;
  var usrsWindow = $(".usersWindow");
  var srch = usrsWindow.find(" input");
  var srchBtn = usrsWindow.find(".srchBtn");
  var profWindow = $(".profileWindow");
  var newMsg = $(".option.mensaje");
  var s = decodeURIComponent(location.search);
  _usersList = middleBar.find('.usersList');
  _careersList = middleBar.find('.careersList');
  _bar = middleBar.find('.bar.whiteW');
  _back = _bar.find('.back');
  _yearS = _bar.find("select");
  var d = new Date();
  var html = "<option value='*'selected>Todos los años</option>"
  for(var year = d.getFullYear();year>d.getFullYear()-20;year--){
    html += "<option value='"+year+"'>"+year+"</option>";
  }
  _yearS.html(html);


  if(s.indexOf('?city=') != -1 && s.indexOf('career=') != -1 && s.indexOf('year=') != -1 && s.indexOf("=undefined") == -1){
    var city = s.split("?city=")[1].split("&career")[0];
    var career = s.split("career=")[1].split("&year")[0];
    var year = s.split("year=")[1];
    _yearS.val(year);
    _bar.find(".title").html(user.carreras[city][career]);
    if(year == "*"){
      showUsers({'city':city,'career':career});
    }
    else{
      showUsers({'city':city,'career':career,'yearIn':parseInt(year)});
    }
  }
  else if(s.indexOf('?search=') == -1){
    showCareers();
  }
  else{
    srch.val(s.split('?search=')[1]);
    search();
  }


  _yearS.on("change",function(){
    if($(this).val() == "*"){
      showUsers({'city':currentCity,'career':currentCareer});
    }
    else{
      showUsers({'city':currentCity,'career':currentCareer,'yearIn':parseInt($(this).val())});
    }
  });
  _back.click(function(){
    showCareers();
  });
  srchBtn.click(function(){
    search();
  });
  srch.keypress(function(e){
    if(e.which == 13){
      search();
    }
  })

  function showUsers(query){
    var year;
    if('yearIn' in query){
      year = query.yearIn;
    }
    else{
      year = "*";
    }
    currentCity = query.city;
    currentCareer = query.career;
    setUrl("/users?city="+query.city+"&career="+query.career+"&year="+year);
    _careersList.hide();
    _bar.show();
    searchUsers(query,function(usrs){
      _usersList.empty();
      if(usrs.length == 0){
        _usersList.html('<div style="padding:30px;color:#FFF;margin:0 auto;font-size:20px">Sin resultados</div>').show();
        return;
      }
      for(var usr in usrs){
        var card = userCard.clone();
        card.attr("userID",usrs[usr]._id).appendTo($(_usersList));
        card.find(".name").html(usrs[usr].fname +" "+ usrs[usr].lname);
        if(usrs[usr].profileImage != null){
          getImagesFromID([usrs[usr].profileImage],card,function(photo, element){
            element.find("img").attr("src",photo[0].url);//Fix loading class!!!
          });
        }
        else{
          card.find("img").attr("src",IMG_USER).removeClass("loading");
        }
      }
      _usersList.append('<div class="invisibleUser"></div><div class="invisibleUser"></div><div class="invisibleUser"></div><div class="invisibleUser"></div>').show();
      _usersList.find(".view").click(function(){

          showProfileSection($(this).parent().attr("userID"));
      })
    });
  }

  function buscar(input){

    //Si el buscador esta vacío
    if(input.length == 0) return;

    //Separa las palabras del input por espacio
    input = input.split(" ");

    //Se crea un arreglo para crear la busqueda
    var query = new Array();

    //Por cada palabra se crea una busqueda
    for(var word in input){
      query.push( {"fname":{$regex:".*"+input[word]+".*",$options:"i"}});
      query.push( {"lname":{$regex:".*"+input[word]+".*",$options:"i"}});
    }

    searchUsers(query,function(usrs){

      //Si no se encuentra ningun usuario
      if(usrs.length == 0){
        return;
      }

      for(var usr in usrs){
        //Aqui se debe imprimir la lista, para acceder a datos usar por ejemplo: usrs[user].fname
      }

    });
  }

  function search(){
    var q = srch.val();
    if(q.length == 0) return;
    _yearS.parent().hide();
    _bar.find(".title").html("Búsqueda: <i>"+ q + "</i>");
    q = q.split(" ");
    var o = new Array();
    for(var word in q){
      o.push( {"fname":{$regex:".*"+q[word]+".*",$options:"i"}});
      o.push( {"lname":{$regex:".*"+q[word]+".*",$options:"i"}});
    }
    setUrl("/users?search="+srch.val());
    showUsers({ "$or": o});
  }


  function showCareers(){
    setUrl("/users");
    _yearS.parent().show();
    _usersList.hide();
    _bar.hide();
    _careersList.show();
    var html = '';
    for(var city in user.carreras){
      html += '<div class="city">'+city+'</div><div class="list whiteW">';
      var r = 61;
      var g = 191;
      var b = 246;
      for(var career in user.carreras[city]){
        var clss = "A";
        if(parseInt(career)%2 == 0 ){
          clss = "B";
        }
        html += '<div city="'+city+'" career="'+career+'" class="career '+clss+'"><span style="color:rgb('+r+','+g+','+b+')" class="btn">'+user.carreras[city][career]+'</span></div>';
        r-=1;
        g-=2;
        b+=1;
      }
      html += '</div>';
    }
    _careersList.html(html + '</div>');
    _careersList.find(".career").click(function(){
      currentCity = $(this).attr("city");
      currentCareer = $(this).attr("career");
      _bar.find(".title").html(user.carreras[currentCity][currentCareer]);
      showUsers({'city':currentCity,'career':currentCareer});
    });
  }
  function showUser(id){

    _bar.hide();
    _usersList.hide();
    _careersList.hide();
    usrsWindow.hide();
    profWindow.fadeIn(200);
    var newMsg = middleBar.find(".mensaje");

    newMsg.click(function(){
      post([id,user._id],'/createChat',function(a){
        if(a != false){
          user.chats.push(a);
          saveCurrentUser();
          printChats();
        }
      });
    });

    setUrl("/users/"+cachedUsers[id].email.split("@")[0]);

    _sections         = middleBar.find(".sections .section");
    _followOptions    = middleBar.find(".followOptions");
    _profileImageCont = middleBar.find(".profileImage");
    _fullName         = middleBar.find(".fullName");
    _newPost          = middleBar.find(".newPost");
    _career           = middleBar.find(".career");
    _age              = middleBar.find(".age");
    _mgs              = middleBar.find(".message");
    _followers        = middleBar.find(".followers .number");
    _following        = middleBar.find(".following .number");
    _askpass          = middleBar.find(".askpass .number");

    _profileImage     = _profileImageCont.find("img");

    //Cargar imagen de perfil
    if(cachedUsers[id].profileImage == null){
      _profileImage.attr("src",IMG_USER);
    }
    else{
      getImagesFromID([cachedUsers[id].profileImage],null,function(src){
        _profileImage.attr("src",imgSize(src[0].url,'s'));
      });
    }

    //Imprime datos del perfil

    _fullName.html(user.fname + " " + user.lname);
    _career.html(user.carreras[user.city][user.career]+" ("+user.yearIn+")");
    _age.html(getAge(user.birthdate)+" años");
    _followers.html(user.followers.length);
    _following.html(user.following.length);
    _askpass.html(user.askpass);
  }

  if(usersSectionAction.action == "showUser"){
    showProfileSection(usersSectionAction.data);
    return;
  }
}
