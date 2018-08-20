var express       = require('express');
var app           = express();
var http          = require('http').Server(app);
var io            = require('socket.io')(http);
var MongoClient   = require('mongodb').MongoClient;
var assert        = require('assert');
var bodyParser    = require('body-parser');
var cookieParser  = require('cookie-parser');
var fs            = require('fs');
var imgur         = require('imgur-node-api');
var path          = require('path');
var busboy        = require('connect-busboy');
var shortid       = require('shortid');
var ObjectID      = require('mongodb').ObjectID;
var timeout       = require('connect-timeout');
var urlParser     = require('url');
var sockets       = new Object();


/*
var mongoURL      = process.env.OPENSHIFT_MONGODB_DB_URL + process.env.OPENSHIFT_APP_NAME || 'mongodb://localhost:27017/fraternidadwash';
var port          = process.env.OPENSHIFT_NODEJS_PORT  || process.env.PORT || 3002 ;
var ipaddress     = process.env.OPENSHIFT_NODEJS_IP || "201.186.34.236" || "127.0.0.1";
*/

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080;
var ipaddress   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';
var mongoURL = "mongodb://"+process.env.MONGODB_USER+":"+process.env.MONGODB_PASSWORD+"@"+process.env.OPENSHIFT_NODEJS_IP+":27017/"+process.env.MONGODB_DATABASE;



var year          = 2018;
var carreras      = JSON.parse(fs.readFileSync(__dirname + '/public/json/carreras.json', 'utf8'));



//Conectar con base de Datos Mongo
MongoClient.connect(mongoURL, function(err, db) {

  console.log(err);
  //assert.equal(null, err);
  console.log("Conectado a Mongo");

  var usersDB         = db.collection('users');
  var photosDB        = db.collection('photos');
  var publicationsDB  = db.collection('publications');
  var chatsDB         = db.collection('chats');
  var commentsDB      = db.collection('comments');
  var documentsDB     = db.collection('documents');


  app.use(express.static(__dirname + '/public'));
  app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
  app.use(bodyParser.json({limit: '50mb'}));
  app.use(cookieParser());
  app.use(busboy());
  app.use(timeout(120000));


  imgur.setClientID("a4890278a765a8e");

  http.listen( port, ipaddress, function() {
    console.log((new Date()) + ' Server is listening on port ' + port);
  });

  /*
  - - - - - - - - - - - - - - - - -
  - - - - - -  POSTS  - - - - - -
  - - - - - - - - - - - - - - - - -
  */


  app.all("*",function(req,res,next){
    res.header('Access-Control-Allow-Origin', "*")
    next();
  });

  //Login
  app.post('/login', function (req, res) {
    usersDB.find({$and:[{email:req.body.email},{pass:req.body.pass}]}).toArray(function(err,docs){
      assert.equal(err, null);
      if(docs.length == 0){
        res.send("Contraseña o correo incorrecto(s)");
      }
      else{
        res.send(true);
      }
    });
  });

  //Obtener mis datos
  app.post('/getMyData', function (req, res) {
    isLogged(req.cookies,res,function(ans){
      if(ans != false){
        ans.host = req.get('host');
        ans.carreras = carreras;
        res.send(ans);
      }
    });
  });

  //Cambia datos del usuario
  app.post('/updateUser', function (req, res) {
    isLogged(req.cookies,res,function(ans){
      if(ans != false){
        usersDB.update({email:ans.email,pass:ans.pass},{$set:req.body},function(err,data){
          res.send();
        });
      }
    });
  });

  //Registro Inicial
  app.post('/register', function (req, res) {

    if(!('email' in req.body && 'pass' in req.body && 'pass1' in req.body)){
      res.send("Ha ocurrido un error");
      return;
    }

    var email = req.body.email.toLowerCase();
    var pass = req.body.pass;

    if(email.split("@")[1] != "alumnos.uach.cl" || !isValidEmailAddress(email)){
      res.send("Debes ingresar tu correo institucional");
      return;
    }
    if(pass != req.body.pass1){
      res.send("Las contraseñas no coinciden");
      return;
    }
    if(pass.length < 5){
      res.send("La contraseña debe contener mínimo 5 caracteres");
      return;
    }

    usersDB.find({email:email}).toArray(function(err,docs){
      assert.equal(err, null);
      if(docs.length != 0){
        res.send("Ya existe un usuario registrado con este correo");
        return;
      }
      else{
        usersDB.insert({
          fname:null,
          lname:null,
          email:email,
          pass:pass,
          message:'',
          followers:{questions:[],publications:[],events:[]},
          following:{questions:[],publications:[],events:[]},
          blockedBy:[],
          blockedUsers:[],
          allowLabel:false,
          allowPass:false,
          allowName:false,
          allowCareer:false,
          showPhotos:false,
          showDocs:false,
          showPubs:false,
          showAnswers:false,
          showAds:false,
          soundPubs:false,
          soundMsg:false,
          notMail:false,
          notLabel:false,
          notEvent:false,
          notAnswer:false,
          chats:[],
          photos:[],
          events:[],
          questions:[],
          groups:[],
          askpass:5,
          notifications:[],
          publications:[],
          yearIn:null,
          birthdate:null,
          profileImage:null,
          city:null,
          career:null,
          tutorials:{initial:false,profile:false,users:false,questions:false,publications:false,documents:false,events:false},
          status:"incomplete"
        },function(err,result){
          assert.equal(err, null);
          console.log("Nuevo usuario registrado");
          res.send(true);
        });
      }
    });
  });

  //Completar Registro
  app.post('/completeRegister', function (req, res) {
    isLogged(req.cookies,res,function(ans){
      if(ans != false){
        var $ = req.body;
        if(!('fname' in $ && 'lname' in $ && 'city' in $ && 'career' in $ && 'yearIn' in $ && 'year' in $ && 'month' in $ && 'day' in $)){
          res.send("Ha ocurrido un error");
          return;
        }
        if(!isValidName($.fname)){
          res.send({status:false,msg:"Nombre no permitido."});
          return;
        }
        if(!isValidName($.lname)){
          res.send({status:false,msg:"Apellido no permitido."});
          return;
        }
        if(!($.city in carreras)){
          res.send({status:false,msg:"Selecciona tu ciudad."});
          return;
        }
        if(!($.city in carreras)){
          res.send({status:false,msg:"Selecciona tu ciudad."});
          return;
        }
        if(!($.career <= carreras[$.city].length && $.career >= 0) || $.career == null){
          res.send({status:false,msg:"Selecciona tu carrera."});
          return;
        }
        if($.yearIn >= year || $.yearIn <= 1920){
          res.send({status:false,msg:"Selecciona el año de ingreso."});
          return;
        }
        if($.day >= 31 || $.day <= 0){
          res.send({status:false,msg:"Selecciona el día de tu nacimiento."});
          return;
        }
        if($.month >= 12 || $.month <= 0){
          res.send({status:false,msg:"Selecciona el mes de tu nacimiento."});
          return;
        }
        if($.year >= year - 18 || $.year <= 1920 - 18){
          res.send({status:false,msg:"Selecciona el año de tu nacimiento."});
          return;
        }
        var d = new Date($.year, $.month, $.day);
        usersDB.update({'email':ans.email},
          {$set:
            {
            'fname':$.fname,
            'lname':$.lname,
            'career':$.career,
            'city':$.city,
            'yearIn':$.yearIn,
            'birthdate':d,
            "tutorials.initial": true,
            'status':"ok"
          }
          },function(err, doc){
            if (err) throw err;
            ans.fname = $.fname;
            ans.lname = $.lname;
            ans.career = $.career;
            ans.city = $.city;
            ans.yearIn = $.yearIn;
            ans.birthdate = d;
            ans.tutorials.initial = true;
            ans.status = "ok";
            ans.carreras = carreras;
            res.send({status:true,msg:ans});
        });
      }
    });
  });

  //Subir imagen
  app.post('/uploadPhoto', function (req, res) {
    isLogged(req.cookies,res,function(docs){
      createImage(req.body.img1,docs._id,null,function(photoID){
       if(!photoID){
         res.send("500");
         return;
       }
       publicationsDB.insert({
         message:'',
         tagged:[],
         photos:[photoID],
         url:null,
         creator:docs._id,
         to:docs._id,
         likes:[],
         comments:[],
         shared:[],
         type:"profileImage"
       },function(err,result1){
         usersDB.update(
            { _id: docs._id},
            { $push:{"publications":result1.insertedIds[0],"photos":photoID}, $set: { "profileImage":photoID}},
          function(err, result2){
            res.send({publication:result1.ops[0]._id,images:photoID});
            console.log("Foto subida.");
          });
       });
      });
    });
  });

  //Nuevo documento
  app.post('/newDocument', function (req, res) {
    console.log("Nuevo Documento");
    isLogged(req.cookies,res,function(ans){
      if(ans != false){
        if(typeof req.body != "object"){
          res.send({msg:"Solicitud incorrecta",state:false});
          return;
        }
        if(!('title' in req.body && 'url' in req.body && 'type' in req.body && 'teacher' in req.body && 'subject' in req.body && 'year')){
          res.send({msg:"Falta completar parámetros",state:false});
          return;
        }
        if(typeof req.body.title != 'string' || typeof req.body.url != 'string' || typeof req.body.type != 'number' || typeof req.body.teacher != 'number' || typeof req.body.subject != 'number' || typeof req.body.year != 'number'){
          res.send({msg:"Typos inválidos",state:false});
          return;
        }
        if(req.body.title.length == 0){
          res.send({msg:"Añade un título",state:false});
          return;
        }
        if(req.body.title.url == 0){
          res.send({msg:"Añade un link",state:false});
          return;
        }
        if(req.body.title.url == 0){
          res.send({msg:"Añade un link",state:false});
          return;
        }

        req.body.by = ans._id;
        req.body.aprovedBy = [ans._id];
        req.body.canceledBy = [];
        documentsDB.insert(req.body,function(err,results){
          console.log("Documento añadido");
          res.send({state:true});
          io.sockets.emit('newDocument',results.ops[0]);
          var not = {_id:new ObjectID(),type:"newDocument",docId:results.ops[0]._id,by:results.ops[0].by,seen:false,date:new Date()};
          usersDB.update({},{$push:{notifications:not}},{multi:true},function(err,r){
            io.sockets.emit("notification",not);
          })
        })
      }
    });
  });


  //Obtener publicaciones desde IDs
  app.post('/getPublications', function (req, res) {
    isLogged(req.cookies,res,function(ans){
      if(ans != false){
         getPublicationsFromID(req.body,function(data){
            res.send(data);
            console.log("Publicación enviada");
        });
      }
    });
  });


  //Obtener imagenes desde IDs
  app.post('/getImages', function (req, res) {
    isLogged(req.cookies,res,function(ans){
      if(ans != false){
         getImagesFromID(req.body,function(data){
            res.send(data);
            console.log("Foto enviada");
        });
      }
    });
  });
  app.post('/createChat', function(req, res){
    isLogged(req.cookies,res,function(ans){
      if(ans != false){
        createChat([req,ans],function(data){
          res.send(data);
        });
      }
    });
  });


  //Obtener usuarios por busqueda
  app.post('/searchUsers', function (req, res) {
    isLogged(req.cookies,res,function(ans){
      if(ans != false){
         searchUsers(req.body,function(data){
            res.send(data);
            console.log(data.length + " usuarios encontrados.");
        });
      }
    });
  });

  //Obtener usuarios desde IDs
  app.post('/getUsers', function (req, res) {
    isLogged(req.cookies,res,function(ans){
      if(ans != false){
         getUsersFromID(req.body,function(data){
            res.send(data);
            console.log("Usuario enviado");
        });
      }
    });
  });

  //Obtener chats desde IDs
  app.post('/getChats', function (req, res) {
    isLogged(req.cookies,res,function(ans){
      if(ans != false){
         getChatsFromID(req.body,function(data){
            res.send(data);
            console.log("Chats enviado");
        });
      }
    });
  });

  //Obtener comentarios desde IDs
  app.post('/getComments', function (req, res) {
    isLogged(req.cookies,res,function(ans){
      if(ans != false){
         getCommentsFromID(req.body,function(data){
            res.send(data);
            console.log("Comentarios enviado");
        });
      }
    });
  });

  //Obtener publicaciones seguidas
  app.post('/getFollowedPublications', function (req, res) {
    isLogged(req.cookies,res,function(ans){
      if(ans != false){
        publicationsDB.find({creator:{$in:toObjectID(ans.following.publications)}}).toArray(function(err,docs){
          for(var doc in docs){
            docs[doc].creationTime = ObjectID(docs[doc]._id).getTimestamp();
          }
          res.send(docs);
        })
      }
    });
  });

  //Obtener todas las publicaciones
  app.post('/getAllPublications', function (req, res) {
    isLogged(req.cookies,res,function(ans){
      if(ans != false){
        publicationsDB.find({}).toArray(function(err,docs){
          for(var doc in docs){
            docs[doc].creationTime = ObjectID(docs[doc]._id).getTimestamp();
          }
          res.send(docs);
        })
      }
    });
  });


  //Envia los documentos
  app.get('/reset', function (req, res) {
    usersDB.remove({});
    photosDB.remove({});
    publicationsDB.remove({});
    chatsDB.remove({});
    commentsDB.remove({});
    documentsDB.remove({});
    res.send("base de datos borrada");
  });

  //Envia los documentos
  app.post('/getDocuments', function (req, res) {
    documentsDB.find().toArray(function(err,docs){
      res.send(docs);
    })
  });

  //Obtener usuario de URL
  app.get('/users/*', function (req, res) {
    isLogged(req.cookies,res,function(docs){
      if(docs == false){
        res.redirect('/404');
      }
      else{
        res.sendFile("public/menu.html", {root: __dirname });
      }
    });
  });

  //Mostrar 404
  app.get('/clean', function (req, res) {
    usersDB.update({fname:"Eduardo"},{$pull:{notifications:{type:"publicationLike"}}},function(err,ans){
      res.send("notificaciones borradas");
    })
  });

  //Mostrar 404
  app.get('/404', function (req, res) {
    console.log("404");
    res.sendFile("public/404.html", {root: __dirname });
  });

  //Logout
  app.get('/logout', function (req, res) {
    res.sendFile("public/logout.html", {root: __dirname });
  });

  //Login window
  app.get('/login', function (req, res) {
    isLogged(req.cookies,res,function(docs){
      if(docs == false){
        res.sendFile("public/login.html", {root: __dirname });
      }
      else{
        res.redirect('/publications');
      }
    });
  });

  //Publication window
  app.get('/publications', function (req, res) {
    res.sendFile("public/menu.html", {root: __dirname });
  });


  //Users window
  app.get('/users', function (req, res) {
    res.sendFile("public/menu.html", {root: __dirname });
  });

  //Evento al obtener el dominio solo
  app.get('/', function (req, res) {
    isLogged(req.cookies,res,function(docs){
      if(docs != false){
        //res.redirect('/users/'+req.cookies.email.split("@")[0]);
        res.redirect('/publications');
      }
      else{
        res.redirect('/login');
      }
    });
  });






  /*
  - - - - - - - - - - - - - - - - -
  - - - - - - Funciones - - - - - -
  - - - - - - - - - - - - - - - - -
  */


  //Poner en mayúscula la primera letra
  String.prototype.capitalizeFirstLetter = function() {
      return this.charAt(0).toUpperCase() + this.slice(1);
  }

  //Keys de un objeto
  function objectSize(object){
    var count = 0;
    for(var i in object){
      count++;
    }
    return count;
  }

  //Obtener imagenes desde _id
  function getImagesFromID(photos,callback){
    if(photos.lenght == 0){
      callback([]);
      return;
    }
    photosDB.find({_id:{$in:toObjectID(photos)}}).toArray(function(err,docs){
      for(var doc in docs){
        docs[doc].creationTime = ObjectID(docs[doc]._id).getTimestamp();
      }
      callback(docs);
    });
  }


  //Obtener comentarios desde id
  function getCommentsFromID(coms,callback){
    if(coms.lenght == 0){
      callback([]);
      return;
    }
    commentsDB.find({_id:{$in:toObjectID(coms)}}).toArray(function(err,docs){
      for(var doc in docs){
        docs[doc].time = ObjectID(docs[doc]._id).getTimestamp();
      }
      callback(docs);
    });
  }
  function createChat(pa,callback){
    var ids =  toObjectID(pa[0].body);
    var us = pa[1];
    chatsDB.find({ 'integrants': { $all: ids } }).toArray(function(err,docs){
      console.log(docs);
      if(docs.length == 0){
        chatsDB.insert({
          creator:us._id,
          name:null,
          integrants:ids,
          messages:[]
        },function(err,result){
          usersDB.update( { _id : { $in : toObjectID(result.ops[0].integrants) } },{ $push : { chats : result.ops[0]._id } },{multi: true}, function(err,reu){
            callback(result.ops[0]._id);
          });
        });
      }
      else{
        callback(false);
      }
    });
  }
/*
  function createImage(user,base64,extraData,callback){
    var fullImg = base64.replace(/^data:image\/png;base64,/, "");
    var fullPath = __dirname + '/tmp/' + shortid.generate() + ".png";
    fs.writeFile( fullPath, fullImg, 'base64', function(err) {
      imgur.upload( fullPath, function (err,resp1) {
        console.log(resp1);
        if(!resp1.hasOwnProperty('data')){
          callback(false,extraData);
          return;
        }
        fs.unlink(fullPath ,function(){
          photosDB.insert({
            url:resp1.data.link,
            uploader:user
          },function(err,result){
            assert.equal(err, null);
             callback(result.ops[0]._id,extraData);
          });
        });
      });
    });
  }
*/

  function createImage(data,user,extraData,callback){
    photosDB.insert({
      url:data.url,
      width:parseInt(data.width),
      height:parseInt(data.height),
      uploader:user
    },function(err,result){
      assert.equal(err, null);
       callback(result.ops[0]._id,extraData);
    });
  }

  //Obtener publicaciones desde _id
  function getPublicationsFromID(publications,callback){
    if(publications.lenght == 0){
      callback([]);
      return;
    }
    else{
      publicationsDB.find({_id:{$in:toObjectID(publications)}}).toArray(function(err,docs){
        for(var doc in docs){
          docs[doc].creationTime = ObjectID(docs[doc]._id).getTimestamp();
        }
        callback(docs);
      });
    }
  }

  //Obtener usuarios desde _id
  function getUsersFromID(users,callback){
    if(users.lenght == 0){
      callback([]);
      return;
    }
    else{
      usersDB.find({_id:{$in:toObjectID(users)}}).toArray(function(err,docs){
        for(var doc in docs){
            delete docs[doc].pass;
            delete docs[doc].chats;
            delete docs[doc].notifications;
            if(docs[doc]._id in sockets){
              docs[doc].connected = true;
            }
            else{
              docs[doc].connected = false;
            }
        }
        callback(docs);
      });
    }
  }

  //Obtener usuarios desde _id
  function getChatsFromID(chats,callback){
    if(chats.lenght == 0){
      callback([]);
      return;
    }
    else{
      chatsDB.find({_id:{$in:toObjectID(chats)}}).toArray(function(err,docs){
        for(var doc in docs){
          for(var mes in docs[doc].messages){
            docs[doc].messages[mes].date = ObjectID(docs[doc].messages[mes]._id).getTimestamp();
          }
        }
        callback(docs);
      });
    }
  }

  //Obtener usuarios por busqueda
  function searchUsers(params,callback){
    usersDB.find(params).toArray(function(err,docs){
      for(var usr in docs){
        delete docs[usr].pass;
        delete docs[usr].chats;
      }
      callback(docs);
    });
  }

  //Detecta si un email es válido
  function isValidEmailAddress(emailAddress) {
    if(emailAddress.length > 40) return false;
    var pattern = new RegExp(/^(("[\w-+\s]+")|([\w-+]+(?:\.[\w-+]+)*)|("[\w-+\s]+")([\w-+]+(?:\.[\w-+]+)*))(@((?:[\w-+]+\.)*\w[\w-+]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][\d]\.|1[\d]{2}\.|[\d]{1,2}\.))((25[0-5]|2[0-4][\d]|1[\d]{2}|[\d]{1,2})\.){2}(25[0-5]|2[0-4][\d]|1[\d]{2}|[\d]{1,2})\]?$)/i);
    return pattern.test(emailAddress);
  }

  //Detecta si es un nombre válido
  function isValidName(name){
    if(name.length < 3 || name.length > 15) return false;
    return /^[a-zA-Z]+$/.test(name);
  }

  //Objectizar IDs
  function toObjectID(ids){
    for(var id in ids){
      try{
        ids[id] = ObjectID(ids[id]);
      }
      catch(err){

      }
    }
    return ids;
  }
  //Checkear si el usuario ha iniciado sesión
  function isLogged(cookies,res,callback){
    if(objectSize(cookies) == 0){
      callback(false);
      return;
    }
    else{
      usersDB.find({$and:[{email:cookies.email},{pass:cookies.pass}]}).toArray(function(err,docs){
        assert.equal(err, null);
        if(docs.length != 1){
          callback(false);
          return;
        }
        else{
          callback(docs[0]);
          return;
        }
      });
    }
  }

  //Arroja 404 si el path es invalido
  app.get("*", function(req, res) {
    res.redirect("/404");
  });

  io.on('connection', function(socket){

    if(!('request' in socket))return;
    if(!('headers' in socket.request))return;
    if(!('cookie' in socket.request.headers))return;
    if(socket.request.headers.cookie.split("mail=").length<2)return;
    if(socket.request.headers.cookie.split("ass=").length<2)return;
    isLogged({email:decodeURIComponent(socket.request.headers.cookie.split("mail=")[1].split(";")[0]),pass:decodeURIComponent(socket.request.headers.cookie.split("ass=")[1].split(";")[0])},socket,function(data){

    sockets[data._id] = socket.id;
    sockets[socket.id] = data._id;
    console.log('Nuevo usuario conectado');

    io.sockets.emit('connectedUser', data._id);

    socket.on('disconnect', function(){
      io.sockets.emit('disconnectedUser', sockets[socket.id]);
      delete sockets[sockets[socket.id]];
      delete sockets[socket.id];
      console.log('Usuario desconectado');
    });

    socket.on('deletePublication', function(msg){
      if(!("data" in msg)) return;
      if(!("id" in msg.data && "email" in msg && "pass" in msg)) return;

      isLogged({email:msg.email,pass:msg.pass},msg.data.id,function(data){
        usersDB.update({status:"ok"},{$pull:{notifications:{pubId:ObjectID(msg.data.id)}}},{multi:true},function(err,re){
          io.sockets.emit('deleteNotification', {type:"all",pubId:msg.data.id});
        })
        usersDB.update({ _id: ObjectID(data._id)},{ $pull: { 'publications': ObjectID(msg.data.id)}},function(err,result){
          io.sockets.emit('deletePublication', {user:data._id,publication:msg.data.id});
        });
      });
    });

    socket.on('chatMessage', function(msg){
      if(!("data" in msg)) return;
      if(!("id" in msg.data && "text" in msg.data && "from" in msg.data && "seenBy" in msg.data && "files" in msg.data && "photos" in msg.data)) return;

      isLogged({email:msg.email,pass:msg.pass},msg.data,function(data){
        var sve = msg.data;
        sve._id = new ObjectID();
        chatsDB.update({ _id: ObjectID(msg.data.id)},{ $push: { messages:sve }},function(err,result){
          chatsDB.find({ _id: ObjectID(msg.data.id)}).toArray(function(err,dat){
            var lastId;
            sve.date = ObjectID(sve._id).getTimestamp();
            for(var usr in dat[0].integrants){
              if(dat[0].integrants[usr] in sockets){
                if(lastId != dat[0].integrants[usr]){
                  lastId = dat[0].integrants[usr];
                  if(dat[0].integrants[usr] in sockets){
                    io.to(sockets[dat[0].integrants[usr]]).emit('chatMessageArrived',sve);
                  }
                }
              }
            }
          });
        });
      });
    });

    //Agrega o quita un megusta a una publicacion
    socket.on('seenNotifications', function (msg) {
      isLogged({email:msg.email,pass:msg.pass},msg.data,function(ans){
        if(ans != false){
          for(var id in msg.data){
            usersDB.update({ _id:ObjectID(ans._id),notifications:{$elemMatch: {_id:ObjectID(msg.data[id])}} },{$set:{'notifications.$.seen':true}});
          }
        }
      });
    });

    //Agrega o quita un megusta a una publicacion
    socket.on('likePublication', function (msg) {
      isLogged({email:msg.email,pass:msg.pass},msg.data,function(ans){
        if(ans != false){
          //Busca si ya le has dado megusta
           publicationsDB.find({_id:ObjectID(msg.data),likes:ObjectID(ans._id)}).toArray(function(err,docs){
             //Ya le has dado quita el like
             if(docs.length != 0){
               publicationsDB.update({'_id':ObjectID(msg.data),},{$pull:{'likes':ObjectID(ans._id)}},function(err,data){
                 io.sockets.emit('likePublication', {id:msg.data,userID:ans._id,add:false});
                 if(docs[0].likes.length == 1){
                   //Elimina la notificación
                   var usrs = [];
                   if(docs[0].to.toString() == docs[0].creator.toString()){
                     usrs.push(docs[0].to.toString());
                   }
                   else{
                     usrs.push(docs[0].to.toString());
                     usrs.push(docs[0].creator.toString());
                   }
                   usersDB.update({_id:{$in:toObjectID(usrs)}},{$pull:{notifications:{pubId:ObjectID(msg.data),type:"publicationLike"}}},{multi:true});

                   for(var uv in usrs){
                     if(usrs[uv] in sockets){
                       console.log("NOOOOOOTIF")
                       io.to(sockets[usrs[uv]]).emit('deleteNotification',{type:"publicationLike",pubId:msg.data});
                     }
                   }
                 }
               });
             }
             //no le has dado añade like
             else{
               publicationsDB.update({'_id':ObjectID(msg.data)},{$push:{'likes':ObjectID(ans._id)}},function(err,data){
                 //Se obtiene el creador de la publicacion
                 publicationsDB.find({_id:ObjectID(msg.data)}).toArray(function(err,dcs){
                   //Si no eres el creador, se envia notificacion
                   var usrs = [];
                   if(dcs[0].to.toString() == dcs[0].creator.toString()){
                     usrs.push(dcs[0].to.toString());
                   }
                   else{
                     usrs.push(dcs[0].to.toString());
                     usrs.push(dcs[0].creator.toString());
                   }
                   //Se busca al creador
                   usersDB.find({_id:{$in:toObjectID(usrs)}}).toArray(function(err,ds){
                     for(var uss in ds){
                       if(ds[uss]._id.toString() != ans._id.toString()){
                       //Busca si la notificacion existe
                       var exist = false;
                       for(var not in ds[uss].notifications){
                         if(ds[uss].notifications[not].type == "publicationLike" && ds[uss].notifications[not].pubId == msg.data){
                           exist = true;
                           break;
                         }
                       }
                       var notification = {_id:new ObjectID(),seen:false,type:'publicationLike',pubId:ObjectID(msg.data),date:new Date()}
                       //Si no existe la notificación la crea
                       if(!exist){
                         function a(id){
                           usersDB.update({_id:ObjectID(id)},{$push:{notifications:notification}},function(err,resp){
                             console.log("Notificacion Enviada");
                             if(id in sockets){
                               io.to(sockets[id]).emit('notification',notification);
                             }
                           });
                         }
                          a(ds[uss]._id);
                       }
                       //Si no existe la vuelve a enviar
                       else{
                         function b(id){
                           usersDB.update({ _id:ObjectID(id),notifications:{$elemMatch: {pubId:ObjectID(msg.data),type:"publicationLike"}} },{$set:{'notifications.$.date':new Date(),'notifications.$.seen':false}},function(err,resp){
                             usersDB.find({_id:ObjectID(id)}).toArray(function(err,ddd){
                               var nt;
                               for(var ntt in ddd[0].notifications){
                                 if('pubId' in ddd[0].notifications[ntt]){
                                   if(ddd[0].notifications[ntt].pubId.toString() == msg.data){

                                     nt = ddd[0].notifications[ntt];
                                     nt.date = new Date();
                                     nt.seen = false;
                                     break;
                                   }
                                 }
                               }
                               if(id in sockets){
                                 io.to(sockets[id]).emit('notification',nt);
                              }
                             })
                           });
                         }
                         b(ds[uss]._id);
                       }
                     }
                    }
                   });
                 })
                 io.sockets.emit('likePublication', {id:msg.data,userID:ans._id,add:true});
               });
             }
           });
        }
      });
    });



    //Nueva publicacion
    socket.on('newPublication', function (msg) {
      isLogged({email:msg.email,pass:msg.pass},msg.data,function(ans){
        if(ans != false){
          if(ans.blockedBy.indexOf(msg.data.to)!=-1)return;
          var imagesLen = msg.data.images.length;
          var imagesOk = [];
          if(msg.data.url == 1){
            msg.data.url = msg.data.url[0];
          }
          if(imagesLen != 0){
            io.emit('loadingPublication', "80%");
            for(var img in msg.data.images){
              createImage(msg.data.images[img],ans._id,msg.data,function(photoID){
                imagesOk.push(photoID);
                io.emit('loadingPublication', String(parseInt((20/imagesLen)*imagesOk.length)+80)+"%");
                console.log("Foto " + imagesOk.length + " lista")
                if(imagesOk.length == imagesLen){
                  publicationsDB.insert({
                    message:msg.data.text,
                    tagged:[],
                    url:msg.data.url,
                    photos:imagesOk,
                    creator:ans._id,
                    to:ObjectID(msg.data.to),
                    likes:[],
                    comments:[],
                    shared:[],
                    type:"shared"
                  },function(err,docs){
                    usersDB.update({_id:ObjectID(msg.data.to)},{$push:{publications:docs.ops[0]._id}},function(err,a){
                      if(ans._id != msg.data.to){
                        usersDB.update({_id:ObjectID(msg.data.to)},{$push:{notifications:{_id:new ObjectID(),type:"newPublication",pubId:ObjectID(docs.ops[0]._id),date:new Date(),seen:false}}},function(a,b){
                          if(msg.data.to in sockets){
                            io.to(sockets[msg.data.to]).emit("notification",{_id:new ObjectID(),type:"newPublication",pubId:ObjectID(docs.ops[0]._id),date:new Date(),seen:false});
                          }
                        })
                      }
                      io.sockets.emit('newPublication', {pid:docs.ops[0]._id,to:msg.data.to,from:ans._id});
                    })
                  });
                }
              });
            }
          }
          else{
            publicationsDB.insert({
              message:msg.data.text,
              tagged:[],
              photos:[],
              url:msg.data.url,
              creator:ans._id,
              to:ObjectID(msg.data.to),
              likes:[],
              comments:[],
              shared:[],
              type:"shared"
            },function(err,docs){
              usersDB.update({_id:ObjectID(msg.data.to)},{$push:{publications:docs.ops[0]._id}},function(err,a){
                if(ans._id != msg.data.to){
                  usersDB.update({_id:ObjectID(msg.data.to)},{$push:{notifications:{_id:new ObjectID(),type:"newPublication",pubId:ObjectID(docs.ops[0]._id),date:new Date(),seen:false}}},function(a,b){
                    if(msg.data.to in sockets){
                      io.to(sockets[msg.data.to]).emit("notification",{_id:new ObjectID(),type:"newPublication",pubId:ObjectID(docs.ops[0]._id),date:new Date(),seen:false});
                    }
                  })
                }
                io.sockets.emit('newPublication', {pid:docs.ops[0]._id,to:msg.data.to,from:ans._id});
              })
            });
          }
        }
      });
    });

    //Edita una imagen de una publicación -- NO SEGURO -- PUBLICACION DEBE SER DEL USUARIO
    socket.on('deletePublicationImage', function (msg) {
      isLogged({email:msg.email,pass:msg.pass},msg.data,function(ans){
        if(ans != false){
         publicationsDB.update({_id:ObjectID(msg.data.pid)},{$pull:{photos:ObjectID(msg.data.fid)}},function(err,data){
           io.sockets.emit('deletePublicationImage', {pid:msg.data.pid,fid:msg.data.fid});
         });
        }
      });
    });

    //Edita una imagen de album -- NO SEGURO -- ID DEL CREADOR DE LA IMAGEN DEBE SER LA MISMA
    socket.on('deleteAlbumImage', function (msg) {
      isLogged({email:msg.email,pass:msg.pass},msg.data,function(ans){
        if(ans != false){
         usersDB.update({_id:ObjectID(ans._id)},{$pull:{photos:ObjectID(msg.data.fid)}},function(err,data){
           io.sockets.emit('deleteAlbumImage', {user:ans._id,fid:msg.data.fid});
         });
        }
      });
    });

    //Edita el mensaje de usuario -- NO SEGURO -- LIMITE DE CARACTERES A 500
    socket.on('updateStory', function (msg) {
      isLogged({email:msg.email,pass:msg.pass},msg.data,function(ans){
        if(ans != false){
         usersDB.update({_id:ObjectID(ans._id)},{$set:{message:msg.data}},function(err,data){
           io.sockets.emit('updateStory', {user:ans._id,msg:msg.data});
         });
        }
      });
    });

    //Seguir usuario NO SEGURO -- VALIDAR SECCIONES
    socket.on('follow', function (msg) {
      isLogged({email:msg.email,pass:msg.pass},msg.data,function(ans){
        if(ans != false){
          if(msg.data.to == ans._id)return;
          //Detecta si ya sigues a esa persona
          if(ans.following[msg.data.sec].indexOf(msg.data.to) == -1){
            //Añade un seguidor
            var sec = "following."+msg.data.sec;
            var op = {$push:{}};
            op.$push[sec] = msg.data.to;
            usersDB.update({_id:ObjectID(ans._id)},op,function(err,data){
              usersDB.find({_id:ObjectID(msg.data.to)}).toArray(function(err,docs){
                var not = null;
                for(var n in docs[0].notifications){
                  if(docs[0].notifications[n].type == "newFollower"){
                    if(docs[0].notifications[n].sec == msg.data.sec){
                      not = docs[0].notifications[n];
                      break
                    }
                  }
                }
                if(not == null){
                  var search = {_id:ObjectID(msg.data.to)};
                  var sec = "followers."+msg.data.sec;
                  not = {_id:new ObjectID(),type:"newFollower",seen:false,date:new Date(),sec:msg.data.sec};
                  var op = {$push:{notifications:not}};
                  op.$push[sec] = ans._id;
                }
                else{
                  var search = {_id:ObjectID(msg.data.to),notifications:{$elemMatch: {sec:msg.data.sec}} };
                  var sec = "followers."+msg.data.sec;
                  not.date = new Date();
                  not.seen = false;
                  var op = {$push:{},$set:{'notifications.$.seen':false,'notifications.$.date':new Date()}};
                  op.$push[sec] = ans._id;
                }
                usersDB.update(search,op,function(err,data){
                  io.sockets.emit('follow', {from:ans._id,to:msg.data.to,sec:msg.data.sec,add:true});
                  if(msg.data.to in sockets){
                    io.to(sockets[msg.data.to]).emit('notification',not);
                 }
                });
              });
            });
          }
          //Quita un seguidor
          else{
            var sec = "following."+msg.data.sec;
            var op = {$pull:{}};
            op.$pull[sec] = msg.data.to;
            usersDB.update({_id:ObjectID(ans._id)},op,function(err,data){
              usersDB.find({_id:ObjectID(msg.data.to)}).toArray(function(err,dcs){
                //Si se eliminan todos los seguidores
                var search = {_id:ObjectID(msg.data.to)};
                var sec = "followers."+msg.data.sec;
                console.log(dcs[0].followers[msg.data.sec].length);
                if(dcs[0].followers[msg.data.sec].length == 1){
                  console.log("delete notif");
                  var op = {$pull:{notifications:{sec:msg.data.sec}}};
                }
                else{
                  var op = {$pull:{}};
                }
                op.$pull[sec] = ans._id;
                usersDB.update(search,op,function(err,data){
                  io.sockets.emit('follow', {from:ans._id,to:msg.data.to,sec:msg.data.sec,add:false});
                  if(msg.data.to in sockets){
                    io.to(sockets[msg.data.to]).emit('deleteNotification',{type:"newFollower",sec:msg.data.sec});
                 }
                });
              });
            });
          }
        }
      });
    });

    //Edita el texto de una publicación
    socket.on('editPublication', function (msg) {
      isLogged({email:msg.email,pass:msg.pass},msg.data,function(ans){
        if(ans != false){
         publicationsDB.update({_id:ObjectID(msg.data.id)},{$set:{message:msg.data.message}},function(err,data){
           io.sockets.emit('editPublication', {id:msg.data.id,message:msg.data.message});
         });
        }
      });
    });

    //Edita el texto de una publicación
    socket.on('notificationAprove', function (msg) {
      isLogged({email:msg.email,pass:msg.pass},msg.data,function(ans){
        if(ans != false){
          if(msg.data.aprove == true){
            var op = {$push:{aprovedBy:ans._id}}
          }
          else{
            var op = {$push:{canceledBy:ans._id}}
          }
         documentsDB.update({_id:ObjectID(msg.data.docId)},op,function(err,data){
           documentsDB.find({_id:ObjectID(msg.data.docId)}).toArray(function(err,docs){

             usersDB.update({_id:ObjectID(ans._id)},{$pull:{notifications:{type:"newDocument",pubId:ObjectID(msg.data.docId)}}},function(err,p){
               if(ans._id in sockets){
                 io.to(sockets[ans._id]).emit('deleteNotification', {type:"newDocument",docId:msg.data.docId});
               }
             });
             if(docs[0].aprovedBy.length >= 2){
               usersDB.update({},{$pull:{notifications:{type:"newDocument",docId:ObjectID(msg.data.docId)}}},{multi:true},function(err,dss){
                 io.sockets.emit('deleteNotification', {type:"newDocument",docId:msg.data.docId});
                 var not = {_id:new ObjectID(),date:new Date(),docId:ObjectID(msg.data.docId),type:"documentReady",seen:false,aproved:true};
                 usersDB.update({_id:ObjectID(docs[0].by)},{$push:{notifications:not}},function(err,k){
                   if(docs[0].by in sockets){
                     io.to(sockets[docs[0].by]).emit("notification",not);
                   }
                 })
               })
             }
             if(docs[0].canceledBy.length >= 2){
               usersDB.update({},{$pull:{notifications:{type:"newDocument",docId:ObjectID(msg.data.docId)}}},{multi:true},function(err,dss){
                 io.sockets.emit('deleteNotification', {type:"newDocument",docId:msg.data.docId});
                 documentsDB.remove({_id:ObjectID(msg.data.docId)});
                 var not = {_id:new ObjectID(),date:new Date(),type:"documentReady",seen:false,aproved:false};
                 usersDB.update({_id:ObjectID(docs[0].by)},{$push:{notifications:not}},function(err,k){
                   if(docs[0].by in sockets){
                     io.to(sockets[docs[0].by]).emit("notification",not);
                   }
                 })
               })
             }
           })
         });
        }
      });
    });

    //Edita el texto de una publicación
    socket.on('seen', function (msg) {
      isLogged({email:msg.email,pass:msg.pass},msg.data,function(ans){
        if(ans != false){
        chatsDB.find({_id:ObjectID(msg.data.chatID)}).toArray(function(err,docs){
          if(docs.length == 0)return;
          var index = docs[0].messages.length - 1;
          var set = {$addToSet:{}}
          set.$addToSet['messages.'+index+'.seenBy'] = ObjectID(msg.data.by);
          chatsDB.update({_id:ObjectID(msg.data.chatID)},set,{ multi: true },function(err,data){
            for(var sock in docs[0].integrants){
              if(docs[0].integrants[sock] in sockets){
                io.to(sockets[docs[0].integrants[sock]]).emit('seen', {by:msg.data.by,chatID:msg.data.chatID});
              }
            }
          });
        });
        }
      });
    });


    //Edita el texto de una publicación
    socket.on('newComment', function (msg) {
      isLogged({email:msg.email,pass:msg.pass},msg.data,function(ans){
        if(ans != false){
        //Crea el comentario
         commentsDB.insert({
           creator:ans._id,
           text:msg.data.text,
           publication:msg.data.pubId,
           subcomments:[],
           likes:[]
          },function(err,data){
            //Añade el comentario a la publicación
            publicationsDB.update({_id:ObjectID(msg.data.pubId)},{$push:{comments:data.ops[0]._id}},function(err,data1){
              io.sockets.emit('newComment', {id:data.ops[0]._id,pubId:msg.data.pubId});
              //Busca la publicación
              publicationsDB.find({_id:ObjectID(msg.data.pubId)}).toArray(function(err,docs){
                //Busca al creador de la publicación
                commentsDB.find({_id:{$in:toObjectID(docs[0].comments)}}).toArray(function(err,coms){
                  var usrs = [];
                  //Busca los usuarios que han comentado
                  for(var c in coms){
                    if(usrs.indexOf(coms[c].creator.toString()) == -1){
                      usrs.push(coms[c].creator.toString());
                    }
                  }
                  if(usrs.indexOf(docs[0].creator) == -1 && docs[0].creator.toString() != ans._id.toString()){
                    usrs.push(docs[0].creator);
                  }
                  if(usrs.indexOf(docs[0].to) == -1 && docs[0].to.toString() != ans._id.toString()){
                    usrs.push(docs[0].to);
                  }
                  //Envia notificaciones a los que han comentado
                  var no = {_id:new ObjectID(),pubId:ObjectID(msg.data.pubId),seen:false,date:new Date(),type:"publicationComment"};

                  for(var uss in usrs){
                    if(usrs[uss].toString() != ans._id.toString()){
                      function updt(info,callback){
                          usersDB.update({_id:ObjectID(info),notifications:{$elemMatch:{type:"publicationComment",pubId:ObjectID(msg.data.pubId)}}},{$set:{'notifications.$.date':new Date(),'notifications.$.seen':false}},function(err,g){
                            if(info in sockets && g.result.nModified == 1){
                              callback([info,true]);
                            }
                            else{
                              callback([info,false]);
                            }
                          });
                      }
                      updt(usrs[uss].toString(),function(info){
                        if(info[1]){
                          usersDB.find({_id:ObjectID(info[0])}).toArray(function(err,t){
                            //Busca la notificacion actualizada
                            if(t[0]._id.toString() in sockets){
                              for(var ng in t[0].notifications){
                                if(t[0].notifications[ng].type == "publicationComment"){
                                  if(t[0].notifications[ng].pubId.toString() == msg.data.pubId.toString()){
                                    io.to(sockets[t[0]._id]).emit('notification', t[0].notifications[ng]);
                                  }
                                }
                              }
                            }
                          });
                        }
                        else{
                          usersDB.update({_id:ObjectID(info[0]),notifications:{ $not: { $elemMatch:{type:"publicationComment",pubId:ObjectID(msg.data.pubId)}} }},{$push:{notifications:no}},function(err,g){
                            if(info[0] in sockets && g.result.nModified == 1){
                              io.to(sockets[info[0]]).emit('notification', no);
                            }
                          });
                        }
                      })
                    }
                  }
                })
              });
            });
        });
      }
    });
  });


  //Elimina un comentario
  socket.on('deleteComment', function (msg) {
    isLogged({email:msg.email,pass:msg.pass},msg.data,function(ans){
      if(ans != false){
       publicationsDB.update({_id:ObjectID(msg.data.pid)},{$pull:{comments:ObjectID(msg.data.id)}},function(err,data){
         commentsDB.deleteOne({_id:ObjectID(msg.data.id)},function(err,data){
           io.sockets.emit('deleteComment', {id:msg.data.id,pid:msg.data.pid});
           publicationsDB.find({_id:ObjectID(msg.data.pid)}).toArray(function(err,docs){
             if(docs[0].comments.length == 0){
               usersDB.update({status:"ok"},{$pull:{notifications:{type:"publicationComment",pubId:ObjectID(msg.data.pid)}}},{multi:true},function(err,d){
                 console.log("asdasdasdasdasdasdasdasdasdasdasd"+err);
               })
             }
           })
         });
       });
      }
    });
  });








/* JOSE JOSE JOSE JOSE JOSE JOSE JOSE JOSE JOSE JOSE JOSE JOSE JOSE JOSE */
/* JOSE JOSE JOSE JOSE JOSE JOSE JOSE JOSE JOSE JOSE JOSE JOSE JOSE JOSE */
/* JOSE JOSE JOSE JOSE JOSE JOSE JOSE JOSE JOSE JOSE JOSE JOSE JOSE JOSE */
/* JOSE JOSE JOSE JOSE JOSE JOSE JOSE JOSE JOSE JOSE JOSE JOSE JOSE JOSE */
/* JOSE JOSE JOSE JOSE JOSE JOSE JOSE JOSE JOSE JOSE JOSE JOSE JOSE JOSE */


  //Parte de Jose: cambio de nombre
  socket.on('nameChange', function (msg) {
    isLogged({email:msg.email,pass:msg.pass},msg.data,function(ans){
      if(ans != false){
        //validar datos
       usersDB.update({_id:ObjectID(ans._id)},{$set:{fname:msg.data.fname,lname:msg.data.lname}},function(err,data){
           io.sockets.emit('nameChange', {id:ans._id, fname:msg.data.fname, lname:msg.data.lname});
           console.log('cambio nombre');
       });
      }
    });
  });

  //Parte de Jose: cambio de contraseña
  socket.on('passChange', function (msg) {
    isLogged({email:msg.email,pass:msg.pass},msg.data,function(ans){
      if(ans != false){
        //validar datos
       usersDB.update({_id:ObjectID(ans._id)},{$set:{pass:msg.data.pass}},function(err,data){
           io.sockets.emit('passChange', {id:ans._id, pass:msg.data.pass});
           console.log('cambio pass');
       });
      }
    });
  });

  //Parte de Jose: cambio de carrera
  socket.on('careerChange', function (msg) {
    isLogged({email:msg.email,pass:msg.pass},msg.data,function(ans){
      if(ans != false){
        //validar datos
       usersDB.update({_id:ObjectID(ans._id)},{$set:{career:msg.data.career}},function(err,data){
           io.sockets.emit('careerChange', {id:ans._id, career:msg.data.career});
           console.log('cambio carrera');
       });
      }
    });
  });

  //Parte de Jose: cambio de ciudad
  socket.on('cityChange', function (msg) {
    isLogged({email:msg.email,pass:msg.pass},msg.data,function(ans){
      if(ans != false){
        //validar datos
       usersDB.update({_id:ObjectID(ans._id)},{$set:{city:msg.data.city}},function(err,data){
           io.sockets.emit('cityChange', {id:ans._id, city:msg.data.city});
           console.log('cambio ciudad');
       });
      }
    });
  });

  //Parte de Jose: cambio de año de ingreso
  socket.on('yearInChange', function (msg) {
    isLogged({email:msg.email,pass:msg.pass},msg.data,function(ans){
      if(ans != false){
        //validar datos
       usersDB.update({_id:ObjectID(ans._id)},{$set:{yearIn:msg.data.yearIn}},function(err,data){
           io.sockets.emit('yearInChange', {id:ans._id, yearIn:msg.data.yearIn});
           console.log('cambio año de ingreso');
       });
      }
    });
  });

  //Parte de Jose: cambio de fecha de nacimiento
  socket.on('dateChange', function (msg) {
    isLogged({email:msg.email,pass:msg.pass},msg.data,function(ans){
      if(ans != false){
        //validar datos
       usersDB.update({_id:ObjectID(ans._id)},{$set:{birthdate:msg.data.birthdate}},function(err,data){
           io.sockets.emit('dateChange', {id:ans._id, birthdate:msg.data.birthdate});
           console.log('cambio fecha de nacimiento');
       });
      }
    });
  });

  //Parte de Jose de Privacidad: permitir o no etiquetar en fotos
  socket.on('allowLabel', function (msg) {
    isLogged({email:msg.email,pass:msg.pass},msg.data,function(ans){
      if(ans != false){
        //validar datos
       usersDB.update({_id:ObjectID(ans._id)},{$set:{allowLabel:msg.data.allowLabel}},function(err,data){
           io.sockets.emit('allowLabel', {id:ans._id, allowLabel:msg.data.allowLabel});
           console.log('cambio de etiquetado fotos');
       });
      }
    });
  });

  //Parte de Jose de Privacidad: mostrar o no fotos a los fraternos
  socket.on('showPhotos', function (msg) {
    isLogged({email:msg.email,pass:msg.pass},msg.data,function(ans){
      if(ans != false){
        //validar datos
       usersDB.update({_id:ObjectID(ans._id)},{$set:{showPhotos:msg.data.showPhotos}},function(err,data){
           io.sockets.emit('showPhotos', {id:ans._id, showPhotos:msg.data.showPhotos});
           console.log('cambio de mostrar fotos');
       });
      }
    });
  });

  //Parte de Jose de Privacidad: mostrar o no documentos a los fraternos
  socket.on('showDocs', function (msg) {
    isLogged({email:msg.email,pass:msg.pass},msg.data,function(ans){
      if(ans != false){
        //validar datos
       usersDB.update({_id:ObjectID(ans._id)},{$set:{showDocs:msg.data.showDocs}},function(err,data){
           io.sockets.emit('showDocs', {id:ans._id, showDocs:msg.data.showDocs});
           console.log('cambio de mostrar documentos');
       });
      }
    });
  });

  //Parte de Jose de Privacidad: mostrar o no publicaciones a los fraternos
  socket.on('showPubs', function (msg) {
    isLogged({email:msg.email,pass:msg.pass},msg.data,function(ans){
      if(ans != false){
        //validar datos
       usersDB.update({_id:ObjectID(ans._id)},{$set:{showPubs:msg.data.showPubs}},function(err,data){
           io.sockets.emit('showPubs', {id:ans._id, showPubs:msg.data.showPubs});
           console.log('cambio de mostrar publicaciones');
       });
      }
    });
  });

  //Parte de Jose de Notificaciones: mostrar o no sonidos al recibir publicaciones
  socket.on('soundPubs', function (msg) {
    isLogged({email:msg.email,pass:msg.pass},msg.data,function(ans){
      if(ans != false){
        //validar datos
       usersDB.update({_id:ObjectID(ans._id)},{$set:{soundPubs:msg.data.soundPubs}},function(err,data){
           io.sockets.emit('soundPubs', {id:ans._id, soundPubs:msg.data.soundPubs});
           console.log('cambio de sonidos en publicaciones');
       });
      }
    });
  });

  //Parte de Jose de Notificaciones: mostrar o no sonidos al recibir mensajes de chat
  socket.on('soundMsg', function (msg) {
    isLogged({email:msg.email,pass:msg.pass},msg.data,function(ans){
      if(ans != false){
        //validar datos
       usersDB.update({_id:ObjectID(ans._id)},{$set:{soundMsg:msg.data.soundMsg}},function(err,data){
           io.sockets.emit('soundMsg', {id:ans._id, soundMsg:msg.data.soundMsg});
           console.log('cambio de sonidos en mensajes');
       });
      }
    });
  });

  //Parte de Jose de Notificaciones: enviar o no notificaciones al correo electronico
  socket.on('notMail', function (msg) {
    isLogged({email:msg.email,pass:msg.pass},msg.data,function(ans){
      if(ans != false){
        //validar datos
       usersDB.update({_id:ObjectID(ans._id)},{$set:{notMail:msg.data.notMail}},function(err,data){
           io.sockets.emit('notMail', {id:ans._id, notMail:msg.data.notMail});
           console.log('cambio de uso de correo');
       });
      }
    });
  });

  //Parte de Jose de Notificaciones: mostrar o no notificaciones al ser etiquetado
  socket.on('notLabel', function (msg) {
    isLogged({email:msg.email,pass:msg.pass},msg.data,function(ans){
      if(ans != false){
        //validar datos
       usersDB.update({_id:ObjectID(ans._id)},{$set:{notLabel:msg.data.notLabel}},function(err,data){
           io.sockets.emit('notLabel', {id:ans._id, notLabel:msg.data.notLabel});
           console.log('cambio de uso de correo');
       });
      }
    });
  });

  //Parte de Jose de Notificaciones: mostrar o no notificaciones al ser etiquetado
  socket.on('notEvent', function (msg) {
    isLogged({email:msg.email,pass:msg.pass},msg.data,function(ans){
      if(ans != false){
        //validar datos
       usersDB.update({_id:ObjectID(ans._id)},{$set:{notEvent:msg.data.notEvent}},function(err,data){
           io.sockets.emit('notEvent', {id:ans._id, notEvent:msg.data.notEvent});
           console.log('cambio de notificacion de evento');
       });
      }
    });
  });

  //Parte de Jose de Notificaciones: mostrar o no notificaciones al ser respondida una pregunta
  socket.on('notAnswer', function (msg) {
    isLogged({email:msg.email,pass:msg.pass},msg.data,function(ans){
      if(ans != false){
        //validar datos
       usersDB.update({_id:ObjectID(ans._id)},{$set:{notAnswer:msg.data.notAnswer}},function(err,data){
           io.sockets.emit('notAnswer', {id:ans._id, notAnswer:msg.data.notAnswer});
           console.log('cambio de notificacion de pregunta');
       });
      }
    });
  });

  //Parte de Jose de Bloqueos: bloqueo
  socket.on('blockedUsers', function (msg) {
    isLogged({email:msg.email,pass:msg.pass},msg.data,function(ans){
      if(ans != false){
        //validar datos
       usersDB.update({email:ans.email,pass:ans.pass},{$push:{blockedUsers:{$each:msg.data.blockedUsers}}},function(err,data){
        //usersDB.update({_id:ObjectID(ans._id)},{$set:{blockedUsers:msg.data.blockedUsers}},function(err,data){
           io.sockets.emit('blockedUsers', {id:ans._id, blockedUsers:msg.data.blockedUsers});
           console.log(msg.data.blockedUsers);
       });
      }
    });
  });

  //Parte de Jose de Bloqueos: desbloqueo
  socket.on('unblockedUsers', function (msg) {
    isLogged({email:msg.email,pass:msg.pass},msg.data,function(ans){
      if(ans != false){
        //validar datos
       usersDB.update({email:ans.email,pass:ans.pass},{$pull:{blockedUsers:{$each:msg.data.blockedUsers}}},function(err,data){
        //usersDB.update({_id:ObjectID(ans._id)},{$set:{blockedUsers:msg.data.blockedUsers}},function(err,data){
           io.sockets.emit('unblockedUsers', {id:ans._id, blockedUsers:msg.data.blockedUsers});
           console.log(msg.data.blockedUsers);
       });
      }
    });
  });

    });
  });
});
