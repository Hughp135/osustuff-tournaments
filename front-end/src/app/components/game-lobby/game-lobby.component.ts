import { AdminService } from './../../services/admin.service';
import { GameService } from './../../game.service';
import { SettingsService, CurrentGame } from './../../services/settings.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import * as Visibility from 'visibilityjs';
import { TransitionController, Transition, TransitionDirection } from 'ng2-semantic-ui';
import { GameLobbyData } from 'src/app/resolvers/game-lobby.resolver';

declare var responsiveVoice: any;

export interface IPlayer {
  username: string;
  alive: boolean;
  roundLostOn?: number;
  osuUserId: number;
  ppRank: number;
  countryRank: number;
  country: string;
  gameRank?: number;
}

export interface IGame {
  _id: string;
  title: string;
  players: IPlayer[];
  status: 'new' | 'in-progress' | 'checking-scores' | 'round-over' | 'complete';
  winningUser: {
    username: string;
  };
  roundNumber?: number;
  nextStageStarts?: Date;
  beatmaps: any[];
  secondsToNextRound?: number;
  scores?: any[];
  round: any;
  timeLeft: string;
}

@Component({
  selector: 'app-game-lobby',
  templateUrl: './game-lobby.component.html',
  styleUrls: ['./game-lobby.component.scss'],
})
export class GameLobbyComponent implements OnInit, OnDestroy {
  public game: IGame;
  public players: IPlayer[] = [];
  public messages: any;
  public subscriptions: Subscription[] = [];
  public visibilityTimers: number[] = [];
  public currentGame: CurrentGame;
  public beatmaps: any;
  public showBeatmapList: boolean;
  public timeLeft: string;
  private fetchingMessages = false;
  public currentUsername: string;
  private announcedStart = false;
  public isAdmin: boolean;
  public transitionController = new TransitionController();
  public viewResults = false;

  constructor(
    private route: ActivatedRoute,
    private settingsService: SettingsService,
    private gameService: GameService,
    private adminService: AdminService,
  ) {
    this.isAdmin = !!settingsService.adminPw;
  }

  ngOnInit() {
    const { data } = <{ data: GameLobbyData }>this.route.snapshot.data;

    this.subscriptions = [
      data.lobby.subscribe(async game => {
        await this.announceRoundChanges(game);
        this.game = game;
      }),
      data.players.subscribe(players => this.players = players),
      data.timeLeft.subscribe(timeLeft => this.timeLeft = timeLeft),
      this.settingsService.currentGame.subscribe(async val => this.currentGame = val),
      this.settingsService.username.subscribe(val => (this.currentUsername = val)),
    ];

    this.beatmaps = data.beatmaps;
    this.messages = data.messages;

    this.visibilityTimers.push(
      Visibility.every(2000, 2000 * 10, async () => {
        await this.getMoreMessages();
      }),
    );
  }

  ngOnDestroy() {
    this.visibilityTimers.forEach(v => Visibility.stop(v));
    this.subscriptions.forEach(s => s.unsubscribe());
    if (
      this.currentGame &&
      this.currentGame.gameId === this.game._id &&
      this.game.status === 'complete'
    ) {
      this.settingsService.clearCurrentGame();
    }
  }

  public getMoreMessages = async () => {
    if (this.fetchingMessages) {
      return;
    }

    this.fetchingMessages = true;
    const [lastMessage] = this.messages;

    try {
      const newMessages = await this.gameService.getLobbyMessages(
        this.game._id,
        lastMessage && lastMessage._id,
      );

      this.messages = newMessages.concat(this.messages);
    } catch (e) {
      console.error(e);
    }

    this.fetchingMessages = false;
  }

  private async announceRoundChanges(game) {
    if (!this.game) {
      return;
    }

    try {
      const oldStatus = this.game.status;
      const statusChanged = oldStatus !== game.status;

      if (
        game.status === 'in-progress' &&
        game.roundNumber !== this.game.roundNumber &&
        this.inGame
      ) {
        const beatmap = this.beatmaps[game.roundNumber - 1];
        const regexReplace = /[^\w\s-.=%@&+']/gi;
        responsiveVoice.speak(
          `Round ${game.roundNumber} has started. The beatmap is ${beatmap.artist.replace(regexReplace, ' ').toLowerCase()} - ${
            beatmap.title.replace(regexReplace, ' ').toLowerCase()
          }, ${beatmap.version.replace(regexReplace, ' ').toLowerCase()}`,
        );
      }
      if (
        ((game.status === 'round-over' &&
          !['round-over', 'checking-scores'].includes(this.game.status)) ||
          (game.status === 'checking-scores' &&
            this.game.status !== 'checking-scores')) &&
        this.inGame
      ) {
        responsiveVoice.speak(`Round ${game.roundNumber} has ended. `);
      }
      if (game.status === 'complete' && this.game.status !== 'complete') {
        const winnerString = game.winningUser
          ? `The winner is ${game.winningUser.username}`
          : 'There was no winner.';
        responsiveVoice.speak(`The match has finished. ${winnerString}`);
      }
      if (
        game.status === 'new' &&
        game.secondsToNextRound <= 30 &&
        !this.announcedStart &&
        this.inGame
      ) {
        responsiveVoice.speak(
          `The first round is starting in ${Math.floor(game.secondsToNextRound)} seconds`,
        );
        this.announcedStart = true;
      }
      this.game = game;

      if (statusChanged && game.status !== 'round-over') {
        this.viewResults = false;
        await this.animate(TransitionDirection.Out);
        await this.animate(TransitionDirection.In);
      }
    } catch (e) {
      console.error(e);
    }
  }

  public toggleViewResults = () => {
    this.viewResults = !this.viewResults;
  }

  get showBeatmap() {
    return !['new', 'complete'].includes(this.game.status) && !this.viewResults;
  }

  get showScores() {
    return (
      ['round-over', 'checking-scores'].includes(this.game.status) && !this.viewResults
    );
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

  get isAlive() {
    if (this.mePlayer) {
      return this.mePlayer.alive;
    } else {
      return true;
    }
  }

  get mePlayer() {
    return this.players.find(p => p.username === this.currentUsername);
  }

  get currentBeatmap() {
    if (this.game.status === 'in-progress') {
      return this.game.round.beatmap;
    }

    return this.beatmaps[this.game.roundNumber];
  }

  public async skipRound() {
    await this.adminService.skipRound(this.game);
  }

  public async toggleFreeze() {
    await this.adminService.toggleFreeze();
  }

  private async animate(direction: TransitionDirection) {
    return new Promise(res => {
      const name = direction === TransitionDirection.Out ? 'fly right' : 'fly left';
      this.transitionController.animate(
        new Transition(name, 250, direction, () => {
          res();
        }),
      );
    });
  }
}
