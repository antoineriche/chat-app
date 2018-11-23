var app = require('express')();
var cors = require('cors');
var server = require('http').Server(app);
var chatsocket = require('./chatsocket');
var io = require('socket.io')(server);
var session = require("express-session")({
    secret: "chat-app-server",
    resave: true,
    saveUninitialized: true
});
var sharedsession = require("express-socket.io-session");

var sockets = [];

console.log('start chat-app-server');
app.use(cors());
app.options('*', cors());

// Use express-session middleware for express
app.use(session);

//Use shared session middleware for socket.io setting autoSave:true
io.use(sharedsession(session, {autoSave:true}));

io.on('connection', (socket) => {
	console.log('new user connected');

	socket.on('chat-login-update', function(newLogin){
		var oldLogin = socket.handshake.session.login;
		console.log(oldLogin + ' wants to be called ' + newLogin);

		if(!sockets.includes(newLogin)){
			socket.handshake.session.login = newLogin;
	    	socket.handshake.session.save();
	    	sockets.splice(sockets.indexOf(oldLogin), 1, newLogin);
	    	console.log(sockets);
	    	socket.emit('login', newLogin);
	    	var msg = chatsocket.signInMessage(newLogin);
	    	io.emit(chatsocket.CHAT_INFO, msg);

	    	msg = chatsocket.chatState(sockets);
	    	io.emit(chatsocket.CHAT_INFO, msg);
		} else {
			console.log(newLogin + "' is already used.");
			var msg = chatsocket.updateLoginFailed();
			socket.emit(chatsocket.CHAT_ERROR, msg);
		}
	});

	socket.on('chat-login', function(login){

		if(!sockets.includes(login)){
			socket.handshake.session.login = login;
	    	socket.handshake.session.save();
	    	sockets.push(login);
	    	console.log("add '" + login + "' to chat.");
	    	socket.emit('login', login);
	    	var msg = chatsocket.signInMessage(login);
	    	io.emit(chatsocket.CHAT_INFO, msg);

	    	msg = chatsocket.chatState(sockets);
	    	io.emit(chatsocket.CHAT_INFO, msg);
		} else {
			console.log(login + "' is already used.");
			var msg = chatsocket.updateLoginFailed();
			socket.emit(chatsocket.CHAT_ERROR, msg);
		}
	});

	socket.on('disconnect', function(){
		var login = socket.handshake.session.login;
		console.log('onDisconnect from ' + login + '.');
		if(login){
			sockets.splice(sockets.indexOf(login), 1);
			console.log(sockets);
			var msg = chatsocket.signOutMessage(login);
			io.emit(chatsocket.CHAT_INFO, msg);

			msg = chatsocket.chatState(sockets);
	    	io.emit(chatsocket.CHAT_INFO, msg);
		}
	})

	socket.on('chat-message', function(msg){
		var login = socket.handshake.session.login;
		if(login){
			console.log(login + ': ' + msg);
			var msg = chatsocket.newChatMessage(login, msg);
			socket.broadcast.emit(chatsocket.CHAT_MSG, msg);
		} else {
			console.log("Can't forward message: unknown client.");		
			var msg = chatsocket.unknownClient();
			socket.emit(chatsocket.CHAT_ERROR, msg);
		}
	});
});

server.listen(8090, function(){
    console.log('listening on: 8090');
});