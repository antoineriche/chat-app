const CHAT_MSG            = "chat-message";
const MSG_NEW_MESSAGE     = "new-message";

const CHAT_INFO           = "chat-info";
const INFO_NEW_CHATTER    = "new-chatter";
const INFO_CHATTER_LEFT   = "chatter-left";
const INFO_CHATTER_COUNT  = "chatter-count";

const CHAT_ERROR          = "chat-error";
const ERR_FORBIDDEN_LOGIN = "forbidden-login";
const ERR_LOGIN_EXISTS    = "login-exists";
const ERR_UNKNOWN_CLIENT  = "unknown-client";

serverJSON = function(topic, type, message){
  return {
    topic: topic,
    type: type,
    content: {
      message: message,
      date: new Date().getTime()
    }
  }
}

messageJSON = function(from, message){
  var json = serverJSON(CHAT_MSG, MSG_NEW_MESSAGE, message);
  json.content.from = from;
  return json;
}

exports.CHAT_MSG    = CHAT_MSG;
exports.CHAT_INFO   = CHAT_INFO;
exports.CHAT_ERROR  = CHAT_ERROR;

exports.signInMessage = function(login){
  var msg = 'Welcome ' + login; 
  return serverJSON(CHAT_INFO, INFO_NEW_CHATTER, msg);
}

exports.signOutMessage = function(login){
  var msg = 'Bye ' + login;
  return serverJSON(CHAT_INFO, INFO_CHATTER_LEFT, msg);
}

exports.forbiddenLoginMessage = function(login){
  var msg = login + ' is a forbidden login';
  return serverJSON(CHAT_ERROR, ERR_FORBIDDEN_LOGIN, msg);
}

exports.unknownClient = function(){
  return serverJSON(CHAT_ERROR, ERR_UNKNOWN_CLIENT, '');
}

exports.newChatMessage = function(from, msg){
  return messageJSON(from, msg);
}

