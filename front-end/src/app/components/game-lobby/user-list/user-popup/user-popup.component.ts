import { Component, OnInit, Input } from '@angular/core';
import { IPlayer } from '../../game-lobby.component';

@Component({
  selector: 'app-user-popup',
  templateUrl: './user-popup.component.html',
  styleUrls: ['./user-popup.component.scss'],
})
export class UserPopupComponent implements OnInit {
  @Input() popupData: {player: IPlayer; offsetTop: number};
  @Input() isModerator: boolean;
  @Input() kickPlayer: () => Promise<any>;

  constructor() {}

  ngOnInit() {}

  get popupPosition() {
    return {
      top: `${this.popupData.offsetTop}px`,
    };
  }

  get player() {
     return this.popupData.player;
  }
}
