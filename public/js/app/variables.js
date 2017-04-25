
////////////////////////////////////////////////////////////
// - - - - - - - - - - - VARIABLES - - - - - - - - - - - //
//////////////////////////////////////////////////////////

var currentSection = "documents";

var currentProfileSection = new String();

var currentChatID;

var currentUser = {};
//Variables globales
var modal, user, users, publications, rightBar, topBar, middleBar, win, docPrefab, chatWindow, doc, chat, chatObj, notification, photoInput, _profileImageCont, publication, prefabs, miniImage, _sections, _followOptions, _profileImage, _fullName, _newPost, _career, _age, _msg, _followers, _following, _askpass, pubDropdown, _usersList, userCard, contact, chatMessage, chatMesagges,comment,downloader,bigImg,miniImg;

//Variables en caché
var cachedImages, cachedPublications, cachedUsers, cachedChats, cachedComments, cachedDocuments;

//Elementos que actualizan su tiempo
var timeElements = new Array();
var imgurError = false;
var io;

var audio = new Audio('/sounds/ding.mp3');
var notifPanelOpen = false;

var usersSectionAction = {action:null,data:null};
