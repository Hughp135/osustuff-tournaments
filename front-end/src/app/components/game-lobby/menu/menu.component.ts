import { Component, OnInit, Input } from '@angular/core';
import { IGame } from '../game-lobby.component';
import { GameService } from 'src/app/game.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {
  @Input() game: IGame;
  public rounds: number[] = [];
  public round: any;

  constructor(private gameService: GameService) {}

  ngOnInit() {
    this.rounds = new Array(this.game.roundNumber || 0).fill(null).map((_, i) => i + 1);

    if (this.game.roundNumber) {
      this.showRound(this.game.roundNumber);
    }
  }

  get finalRound() {
    return this.game.status === 'complete' ? this.game.roundNumber : undefined;
  }

  public async showRound(round: number) {
    this.round = await this.gameService.getLobbyRound(this.game._id, round);
  }
}
