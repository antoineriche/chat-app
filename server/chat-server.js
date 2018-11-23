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

console.log('start chat-app-server');
app.use(cors());
app.options('*', cors());

// Use express-session middleware for express
app.use(session);

//Use shared session middleware for socket.io setting autoSave:true
io.use(sharedsession(session, {autoSave:true}));

io.on('connection', (socket) => {
	console.log('new user connected');

	socket.on('chat-login', function(login){
		// var login = ent.encode(login);
		socket.handshake.session.login = login;
	    socket.handshake.session.save();
	    if(login != 'server'){
			console.log('anonymous is: ' + login);
			var msg = chatsocket.signInMessage(login);
			io.emit(chatsocket.CHAT_INFO, msg);
		} else {
			console.log('forbidden login: ' + login);
			var msg = chatsocket.forbiddenLoginMessage(login);
			socket.emit(chatsocket.CHAT_ERROR, msg);
		}
	});

	socket.on('log-out', function(){
		var login = socket.handshake.session.login;
		console.log(login + ' logged out.');
		if(login){
			var msg = chatsocket.signOutMessage(login);
			io.emit(chatsocket.CHAT_INFO, msg);
		}
	});

	socket.on('disconnect', function(){
		console.log('onDisconnect');
	})

	socket.on('chat-message', function(msg){
		var login = socket.handshake.session.login;
		// var msg = ent.encode(msg);
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