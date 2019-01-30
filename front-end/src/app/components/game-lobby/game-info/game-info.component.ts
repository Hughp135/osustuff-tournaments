import { CurrentGame } from './../../../services/settings.service';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-game-info',
  templateUrl: './game-info.component.html',
  styleUrls: ['./game-info.component.scss']
})
export class GameInfoComponent implements OnInit {
  @Input() game: any;

  constructor() { }

  ngOnInit() {
  }

  get status() {
    switch (this.game.status) {
      case 'new':
        return 'Waiting for more players';
      case 'in-progress':
        return 'Playing Round: ' + this.game.currentRoundNumber;
    }
  }

}
