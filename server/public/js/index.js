var socket = io.connect();
var pseudo = null;

socket.on('notification', function(x) { 
  saySthg(x);
});

socket.on('chat-message', function(x) { 
  $("#chat-container").append(
    createDivMsg(x.content.message, x.content.from, x.content.date)
  );
});

socket.on('login', function(login) { 
  pseudo = login;
  $('#loggedAs').html('Logged as ' + login);
});

function saySthg(msg) {
  console.log(msg);
}

function callserver(){
  socket.emit('called', 'Nothing');
}

function setLogin(){
  var login = $("#login").val().trim();
  if(login && login.length > 0){
    socket.emit('chat-login', login);
  } else {
    console.log('null login');
  }
}

function sendMessage(){
  var msg = $("#chatMessage").val().trim();
  if(pseudo && msg.length > 0){
    socket.emit('chat-message', msg);
    $("#chatMessage").val('');
    $("#chat-container").append(createDivMsg(msg));
    scrollToBottom();
  } else {
    console.log("Can't send message.");
  }
}

function createDivMsg(msg, author, date){
  var pDate = date ? new Date(date) : new Date();
  pDate = moment(pDate).format('HH:mm');
  var htmlDiv = "<div class='chat-row'>"
  htmlDiv += "<div class='chat-msg";
  htmlDiv += author ? " other " : " me ";
  htmlDiv += "'>";
  if(author){
    htmlDiv += "<div class='author'>"+author+"</div>";
  }
  htmlDiv += msg;
  htmlDiv += "<div class='author'>"+pDate+"</div>";
  htmlDiv += "</div>"
  htmlDiv += "</div>";
  return htmlDiv;
}

function scrollToBottom(){
  var height = document.getElementById("chat-container").scrollHeight;
  $("#chat-container").animate({scrollTop: height}, 0);
}
  