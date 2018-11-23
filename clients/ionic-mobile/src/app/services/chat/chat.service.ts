import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Socket } from 'ngx-socket-io';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(private socket: Socket) {
    console.log('Hello ChatService');
  }

  isConnected(): Observable<boolean> {
    return new Observable((observer) => {
      this.socket.on('connect',     (data) => observer.next(true)   );
      this.socket.on('disconnect',  (data) => observer.next(false)  );
    });
  }

  loggedAs(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('login', (login) => observer.next(login))
    });
  }

  sendLogin(pLogin: string){
    this.socket.emit('chat-login', pLogin);
  }

  updateLogin(pLogin: string){
    this.socket.emit('chat-login-update', pLogin);
  }

  sendMessage(msg: string){
    this.socket.emit('chat-message', msg);
  }

  onChatInfo(): Observable<any> {
    console.log('handleChatInfo');
    return new Observable((observer) => {
       this.socket.on('chat-info', (info) => observer.next(info) );
    });
  }

  onChatMessage(): Observable<any> {
    console.log('handleChatError');
    return new Observable((observer) => {
       this.socket.on('chat-message', (data) => observer.next(data));
    });
  }

  onChatError(): Observable<any> {
    console.log('handleChatError');
    return new Observable((observer) => {
       this.socket.on('chat-error', (error) => observer.next(error));
    });
  }

  logOut() : void {
    console.log('logOut');
    this.socket.emit('log-out', '');
    this.socket.disconnect();
  }

}
