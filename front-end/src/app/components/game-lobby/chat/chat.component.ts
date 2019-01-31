import { GameService } from './../../../game.service';
import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { SettingsService } from 'src/app/services/settings.service';

export interface Message {
  username: string;
  osuUserId: number;
  _id: string;
  message: string;
  timeAgo: string;
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

  constructor(
    private gameService: GameService,
    private settingsService: SettingsService,
  ) { }

  ngOnInit() {
  }

  public async sendMessage() {
    if (!this.messageInput) {
      return;
    }

    this.sendingMessage = true;

    try {
      const currentGame = this.settingsService.currentGame.getValue();
      await this.gameService.sendMessage(currentGame.gameId, currentGame.requestId, this.messageInput);
      this.messageInput = undefined;
      this.messageSent.next();
    } catch (e) {
      console.error(e);
    }

    this.sendingMessage = false;
    setTimeout(() => {
      this.chatInputEl.nativeElement.focus();
    }, 100);
  }
}
