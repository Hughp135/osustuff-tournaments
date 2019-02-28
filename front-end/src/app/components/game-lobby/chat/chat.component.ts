import { WebsocketService } from './../../../services/websocket.service';
import { GameService } from './../../../game.service';
import {
  Component,
  OnInit,
  Input,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { IGame } from '../game-lobby.component';

export interface Message {
  username: string;
  osuUserId: number;
  _id: string;
  message: string;
  timeAgo: string;
  createdAt: Date;
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit, AfterViewInit {
  public sortedMessages: Message[] = [];
  @Input() set messages(msgs: Message[]) {
    this.setMessages(msgs);
  }
  @Input() canChat: boolean;
  @Input() game: IGame;
  @Input() currentUsername: string;

  @ViewChild('chatInput') chatInputEl;
  @ViewChild('chatMessages') chatMessages;

  public messageInput: string;
  public sendingMessage = false;
  public showEmojiPicker = false;
  private stopAutoScroll = false;
  private detectScroll = false;

  constructor(
    private gameService: GameService,
    private socketService: WebsocketService,
  ) {}

  ngOnInit() {
    this.socketService.socket.on('chat-message', (data: Message) => {
      this.newMessage(data);
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.detectScroll = true;
    }, 1000);
  }

  private newMessage(msg: Message) {
    this.sortedMessages.push(msg);
    this.scrollToBottom();
  }

  private setMessages(msgs: Message[]) {
    const lengthChanged = msgs.length !== this.sortedMessages.length;
    if (!this.sortedMessages || lengthChanged) {
      this.sortedMessages = msgs.slice().reverse();
      this.scrollToBottom();
    }
  }

  private scrollToBottom() {
    if (this.stopAutoScroll) {
      return;
    }
    setTimeout(() => {
      this.chatMessages.nativeElement.scrollTop = this.chatMessages.nativeElement.scrollHeight;
    }, 100);
  }

  public onChatScrolled() {
    if (!this.detectScroll) {
      return;
    }
    this.stopAutoScroll = true;
    setTimeout(() => {
      this.stopAutoScroll = false;
    }, 500);
  }

  public onMouseDown() {
    this.stopAutoScroll = true;
  }

  public onMouseUp() {
    this.stopAutoScroll = false;
  }

  public async sendMessage() {
    if (!this.messageInput) {
      return;
    }

    this.sendingMessage = true;

    this.socketService.socket.emit('send-message', {
      message: this.messageInput,
      gameId: this.game._id,
    });

    try {
      this.messageInput = undefined;
    } catch (e) {
      console.error(e);
    }

    this.sendingMessage = false;
    this.focusChatInput();
  }

  private focusChatInput() {
    setTimeout(() => {
      this.chatInputEl.nativeElement.focus();
    }, 100);
  }

  public addEmoji(e) {
    this.messageInput = (this.messageInput || '') + e.emoji.native;
    this.showEmojiPicker = false;
    this.focusChatInput();
  }

  public windowClick(e) {
    if (e.target.classList.contains('show-emoji-picker')) {
      this.showEmojiPicker = !this.showEmojiPicker;
    } else if (!e.path || !e.path.some(el => el.tagName === 'EMOJI-MART')) {
      this.showEmojiPicker = false;
    }
  }

  public isSystem(message: Message) {
    return (
      message.osuUserId === 0 && message.username.toLowerCase() === 'system'
    );
  }
}
