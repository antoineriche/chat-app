import { Component, ViewChild } from '@angular/core';
import { ChatService } from '../../services/chat/chat.service';
import { Content } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {;

  @ViewChild(Content) content: Content;
  chatMsgs        : any[] = [];
  inputMessage    : string;
  currentSegment  : string = 'map';
  isConnected     : boolean = false;
  isLogged        : boolean = false;
  timeoutInfo     : any;
  info            : string;
  timeoutError    : any;
  error           : string;
  currentLogin    : string;
  inputLogin      : string;
  chattersCount   : number;

  constructor(private chatService : ChatService) { }

  ngOnInit(){
    console.log('ngOnInit HomePage');
    this.chatService.isConnected().subscribe(
      (connected) => {
        if(!connected){
            this.currentSegment = 'map';
            this.isLogged = false;
        } else {
          if(this.currentLogin != null){
            this.chatService.sendLogin(this.currentLogin);
          }
        }
        this.isConnected = connected;
      }
    );

    // je dois recevoir le pseudo ici.
    this.chatService.loggedAs().subscribe(
      (login) => { this.currentLogin = login; this.isLogged = true; }
    );

    this.chatService.onChatError().subscribe(
      (err) => this.displayError(err.type)
    );

    this.chatService.onChatMessage().subscribe(
      (data) => {
        this.chatMsgs.push(data);
        this.scrollToBottom(this.content);
      }
    );

    this.chatService.onChatInfo().subscribe(
      (info) => {
        if(info.type == "chat-state"){
          this.chattersCount = info.content.message;
        } else {
          this.displayInfo(info.content.message);
        }
      }
    )
  }

  ngOnDestroy(){
    this.chatService.logOut();
  }

  segmentChanged(event: any){
    //TODO: disable click
    if(this.isLogged){
      this.currentSegment = event.target.value;
    } else {
      this.displayError('Non identifié(e)');
    }
  }

  isValidLogin(): boolean{
    return this.inputLogin && this.inputLogin.trim() != '' && this.inputLogin.length >= 3 ;
  }

  sendLogin(){
    if(this.isConnected){
      if(!this.isLogged){
        this.chatService.sendLogin(this.inputLogin);
      } else {
        this.chatService.updateLogin(this.inputLogin);
      }
    } else {
      this.displayError('Non connecté(e)');
    }
  }

  displayInfo(pInfo: string){
    this.info = pInfo;
    console.log(this.info);
    clearTimeout(this.timeoutInfo);

    this.timeoutInfo = setTimeout(() => {
      this.info = null;
      this.timeoutInfo = null;
    }, 3000);
  }

  displayError(pError: string){
    this.error = pError;
    clearTimeout(this.timeoutError);

    this.timeoutError = setTimeout(() => {
      this.error = null;
      this.timeoutError = null;
    }, 3000);
  }

  isMe(msg){
    return !msg.content.from;
  }

  isValidMsg(){
    return this.inputMessage && this.inputMessage.trim();
  }

  scrollToBottom(content){
    setTimeout(() => content.scrollToBottom(), 100);
  }

  sendMessage(){

    var msg = {
      content: {
        from: null,
        message: this.inputMessage,
        date: new Date().getTime()
      },
      key: 0
    }
    this.chatMsgs.push(msg);
    this.chatService.sendMessage(this.inputMessage);


    this.inputMessage = '';
    this.scrollToBottom(this.content);
  }
}
