import { GameService } from './../../game.service';
import {
  SettingsService,
  CurrentGame
} from './../../services/settings.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-game-lobby',
  templateUrl: './game-lobby.component.html',
  styleUrls: ['./game-lobby.component.scss']
})
export class GameLobbyComponent implements OnInit, OnDestroy {
  public game: any;
  public players: any;
  public subscriptions: Subscription[] = [];
  public currentGame: CurrentGame;
  public beatmaps: any;
  public showBeatmapList: boolean;
  private fetching = false;

  constructor(
    private route: ActivatedRoute,
    private settingsService: SettingsService,
    private gameService: GameService
  ) {}

  ngOnInit() {
    const { data } = this.route.snapshot.data;

    this.game = data.lobby;
    this.beatmaps = data.beatmaps;
    this.players = data.players;
    console.log(this.game);

    const currentGameSub = this.settingsService.currentGame.subscribe(
      async val => {
        this.currentGame = val;
        await this.fetch();
      }
    );
    const pollGameSub = interval(5000).subscribe(async () => {
      await this.fetch();
    });

    this.subscriptions = [currentGameSub, pollGameSub];
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private async fetch() {
    if (this.fetching) {
      return;
    }

    this.fetching = true;
    this.game = <any>await this.gameService.getLobby(this.game._id);
    this.fetching = false;
    console.log(this.game);
  }

  get showBeatmap() {
    return !['new', 'complete'].includes(this.game.status);
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

  get showJoinGame() {
    return !this.inGame && this.game.status !== 'complete';
  }

  get showBeatmaps() {
    return this.game.status === 'new' || this.showBeatmapList;
  }
}
