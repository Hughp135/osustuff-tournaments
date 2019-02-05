import { AdminService } from './../../services/admin.service';
import { GameService } from './../../game.service';
import { SettingsService, CurrentGame } from './../../services/settings.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import * as Visibility from 'visibilityjs';
import {TransitionController, Transition, TransitionDirection} from 'ng2-semantic-ui';

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
}

@Component({
  selector: 'app-game-lobby',
  templateUrl: './game-lobby.component.html',
  styleUrls: ['./game-lobby.component.scss'],
})
export class GameLobbyComponent implements OnInit, OnDestroy {
  public game: IGame;
  public players: any;
  public messages: any;
  public subscriptions: Subscription[] = [];
  public visibilityTimers: number[] = [];
  public currentGame: CurrentGame;
  public beatmaps: any;
  public showBeatmapList: boolean;
  private fetching = false;
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
    const { data } = this.route.snapshot.data;

    this.game = data.lobby;
    this.beatmaps = data.beatmaps;
    this.players = data.players;
    this.messages = data.messages;

    this.getTimeLeft();

    const currentGameSub = this.settingsService.currentGame.subscribe(async val => {
      this.currentGame = val;
      await this.fetch();
    });
    const currentUsernameSub = this.settingsService.username.subscribe(
      val => (this.currentUsername = val),
    );

    this.subscriptions = [currentGameSub, currentUsernameSub];

    const gameFetchInterval = this.game.status === 'complete' ? 60000 : 5000;
    const messagesInterval = this.game.status === 'complete' ? 6000 : 2000;

    this.visibilityTimers.push(
      Visibility.every(gameFetchInterval, gameFetchInterval * 3, async () => {
        await this.fetch();
      }),
      Visibility.every(1000, 30000, async () => {
        if (!this.game.secondsToNextRound || this.game.status === 'complete') {
          return;
        }

        // Take 1 second off time left every second
        this.game.secondsToNextRound = Math.max(0, this.game.secondsToNextRound - 1);
        await this.getTimeLeft();
      }),
      Visibility.every(messagesInterval, messagesInterval * 10, async () => {
        await this.getMoreMessages();
      }),
    );
  }

  ngOnDestroy() {
    this.visibilityTimers.forEach(v => Visibility.stop(v));
    this.subscriptions.forEach(sub => sub.unsubscribe());
    if (
      this.currentGame &&
      this.currentGame.gameId === this.game._id &&
      this.game.status === 'complete'
    ) {
      this.settingsService.clearCurrentGame();
    }
  }

  private async getTimeLeft() {
    if (!this.game || !this.game.secondsToNextRound) {
      this.timeLeft = `--:--`;
      return;
    }

    if (this.game.secondsToNextRound <= 0) {
      await this.fetch();
    }

    const date = new Date();
    date.setSeconds(date.getSeconds() + this.game.secondsToNextRound);
    const { seconds, minutes } = getTimeComponents(date.getTime() - Date.now());
    this.timeLeft = `${minutes}:${seconds}`;
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

  private async fetch() {
    if (this.fetching) {
      return;
    }

    this.fetching = true;
    try {
      const game = <any>await this.gameService.getLobby(this.game._id);
      const oldStatus = this.game.status;
      const statusChanged = oldStatus !== game.status;

      if (statusChanged || game.status === 'new') {
        const players = await this.gameService.getLobbyUsers(this.game._id);

        if (game.status !== 'new' || players.length !== this.players.length) {
          this.players = players;
        }
      }
      if (game.status === 'in-progress' && game.roundNumber !== this.game.roundNumber && this.inGame) {
        const beatmap = this.beatmaps[game.roundNumber - 1];
        responsiveVoice.speak(
          `Round ${game.roundNumber} has started. The beatmap is ${beatmap.artist} - ${
            beatmap.title
          }, ${beatmap.version}`,
        );
      }
      if (
        ((game.status === 'round-over' &&
        !['round-over', 'checking-scores'].includes(this.game.status) || (
          game.status === 'checking-scores' && this.game.status !== 'checking-scores'
        )))  &&
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

      if (game.status !== oldStatus && game.status !== 'round-over') {
        this.viewResults = false;
        await this.animate(TransitionDirection.Out);
        await this.animate(TransitionDirection.In);
      }
    } catch (e) {
      console.error(e);
    }
    this.fetching = false;
  }

  public toggleViewResults = () => {
    this.viewResults = !this.viewResults;
  }

  get showBeatmap() {
    return !['new', 'complete'].includes(this.game.status) && !this.viewResults;
  }

  get showScores() {
    return ['round-over', 'checking-scores'].includes(this.game.status) && !this.viewResults;
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
        new Transition(name, 250, direction, () => { res(); }));
    });
  }
}

export function getTimeComponents(t: number) {
  const seconds = Math.floor((t / 1000) % 60);
  const minutes = Math.max(0, Math.floor((t / 1000 / 60) % 60));
  const hours = Math.max(0, Math.floor((t / (1000 * 60 * 60)) % 24));
  const days = Math.max(0, Math.floor(t / (1000 * 60 * 60 * 24)));

  return {
    total: t,
    days: days.toString(),
    hours: hours.toString().padStart(2, '0'),
    minutes: minutes.toString().padStart(2, '0'),
    seconds: seconds.toString().padStart(2, '0'),
  };
}
