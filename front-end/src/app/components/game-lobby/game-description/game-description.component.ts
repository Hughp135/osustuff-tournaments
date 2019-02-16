import { IGame } from './../game-lobby.component';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-game-description',
  templateUrl: './game-description.component.html',
  styleUrls: ['./game-description.component.scss']
})
export class GameDescriptionComponent implements OnInit {
  @Input() game: IGame;

  constructor() { }

  ngOnInit() {
  }

}
