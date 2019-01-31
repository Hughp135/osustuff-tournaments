import { GameService } from './../../../game.service';
import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewChild
} from '@angular/core';
import { SettingsService } from 'src/app/services/settings.service';

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
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  @Input() messages: Message[];
  @Output() messageSent: EventEmitter<undefined> = new EventEmitter();
  @Input() canChat: boolean;

  @ViewChild('chatInput') chatInputEl;

  public messageInput: string;
  public sendingMessage = false;
  public showEmojiPicker = false;

  constructor(
    private gameService: GameService,
    private settingsService: SettingsService
  ) {}

  ngOnInit() {}

  public async sendMessage() {
    if (!this.messageInput) {
      return;
    }

    this.sendingMessage = true;

    try {
      const currentGame = this.settingsService.currentGame.getValue();
      await this.gameService.sendMessage(
        currentGame.gameId,
        currentGame.requestId,
        this.messageInput
      );
      this.messageInput = undefined;
      this.messageSent.next();
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
    console.log(this.messageInput);
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
}
