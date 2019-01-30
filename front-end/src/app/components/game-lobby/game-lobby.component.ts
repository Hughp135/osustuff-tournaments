import { GameService } from './../../game.service';
import { SettingsService, CurrentGame } from './../../services/settings.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-game-lobby',
  templateUrl: './game-lobby.component.html',
  styleUrls: ['./game-lobby.component.scss'],
})
export class GameLobbyComponent implements OnInit, OnDestroy {
  public game: any;
  public subscriptions: Subscription[] = [];
  public currentGame: CurrentGame;

  constructor(private route: ActivatedRoute, settingsService: SettingsService,
    private gameService: GameService) {
    const currentGameSub = settingsService.currentGame.subscribe(val => {
      this.currentGame = val;
    });

    this.subscriptions = [currentGameSub];
  }

  ngOnInit() {
    const { data } = this.route.snapshot.data;

    this.game = data.lobby;
    console.log(this.game);

    this.poll();
  }

  private async poll() {
    const pollSub = interval(5000).subscribe(async () => {
      this.game = <any>await this.gameService.getLobby(this.game._id);
      console.log(this.game);
    });

    this.subscriptions.push(pollSub);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  get showBeatmap() {
    return this.game.status !== 'new';
  }

  get showScores() {
    return false;
  }

  get inAnotherGame() {
    return this.currentGame && this.currentGame.gameId !== this.game._id;
  }

  get inGame() {
    return this.currentGame && this.currentGame.gameId === this.game._id;
  }
}
