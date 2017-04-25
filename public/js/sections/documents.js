function showDocumentsSection(){
  middleBar.find(".addButton").click(function(){
    loadModal("docUploader");
  });
  var searchFields = middleBar.find(".searchFields");
  var Mtype = searchFields.find(".type");
  var Mteacher = searchFields.find(".teacher");
  var Msubject = searchFields.find(".subject");
  var Myear = searchFields.find(".year");
  var year = new Date().getFullYear();

  for(var d in fileTypes){
    Mtype.append('<option value="'+d+'">'+fileTypes[d]+'</option>')
  }
  for(var t in teachers){
    Mteacher.append('<option value="'+t+'">'+teachers[t]+'</option>')
  }
  for(var s in subjects){
    Msubject.append('<option value="'+s+'">'+subjects[s]+'</option>')
  }
  for(var y = year;y>year - 30; y--){
    Myear.append('<option value="'+y+'">'+y+'</option>')
  }

  middleBar.find(".searchBtn").click(function(){
    searchDocuments();
  });

  function searchDocuments(){
    middleBar.find(".docPrefab").remove();
    getDocuments(function(){
      for(var d in cachedDocuments){
        if(cachedDocuments[d].aprovedBy.length >=2){
          if(Mtype.val() == "" || Mtype.val() == cachedDocuments[d].type){
            if(Mteacher.val() == "" || Mteacher.val() == cachedDocuments[d].teacher){
              if(Msubject.val() == "" || Msubject.val() == cachedDocuments[d].subject){
                if(Myear.val() == "" || Myear.val() == cachedDocuments[d].year){
                  var docClone = docPrefab.clone();
                  docClone.attr("documentID",cachedDocuments[d]._id);
                  docClone.find(".dwnl a").attr("href",cachedDocuments[d].url);
                  docClone.find(".name").html(cachedDocuments[d].title);
                  docClone.find(".carr").html(subjects[cachedDocuments[d].subject]);
                  docClone.find(".prof").html(teachers[cachedDocuments[d].teacher]);
                  docClone.find(".year").html(cachedDocuments[d].year);
                  docClone.find(".type img").attr("src",window["IMG_" + fileTypes[cachedDocuments[d].type]]);
                  console.log(docClone);
                  $("#documentsResult table").append(docClone);
                }
              }
            }
          }
        }
      }
    });
  }

}
