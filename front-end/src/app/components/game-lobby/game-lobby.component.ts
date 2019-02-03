import { AdminService } from './../../services/admin.service';
import { GameService } from './../../game.service';
import { SettingsService, CurrentGame } from './../../services/settings.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import * as Visibility from 'visibilityjs';

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

  constructor(
    private route: ActivatedRoute,
    private settingsService: SettingsService,
    private gameService: GameService,
    private adminService: AdminService
  ) {
    this.isAdmin = !!settingsService.adminPw;
  }

  ngOnInit() {
    const { data } = this.route.snapshot.data;

    this.game = data.lobby;
    this.beatmaps = data.beatmaps;
    this.players = data.players;
    this.messages = data.messages;

    console.log('game', this.game);

    this.getTimeLeft();

    const currentGameSub = this.settingsService.currentGame.subscribe(async val => {
      this.currentGame = val;
      await this.fetch(true);
    });
    const currentUsernameSub = this.settingsService.username.subscribe(
      val => (this.currentUsername = val),
    );

    this.subscriptions = [currentGameSub, currentUsernameSub];

    const gameFetchInterval = this.game.status === 'complete' ? 60000 : 5000;
    const messagesInterval = this.game.status === 'complete' ? 6000 : 3000;

    this.visibilityTimers.push(
      Visibility.every(gameFetchInterval, gameFetchInterval * 3, async () => {
        await this.fetch(this.game.status === 'new');
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

  private async getMoreMessages() {
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

  private async fetch(forcePlayersUpdate?: boolean) {
    if (this.fetching) {
      return;
    }

    this.fetching = true;
    try {
      const game = <any>await this.gameService.getLobby(this.game._id);
      if (game.status !== this.game.status || forcePlayersUpdate) {
        this.players = await this.gameService.getLobbyUsers(this.game._id);
      }
      if (game.roundNumber !== this.game.roundNumber && this.inGame && this.isAlive) {
        responsiveVoice.speak(`Round ${game.roundNumber} has started. `);
      }
      if (game.status === 'complete' && this.game.status !== 'complete') {
        const winnerString = game.winningUser ? `${game.winningUser.username} won the match!`
          : 'No one won the match';
        responsiveVoice.speak(`The match has finished. ${winnerString}`);
      }
      if (game.status === 'new' && game.secondsToNextRound < 30 && !this.announcedStart && this.inGame) {
        responsiveVoice.speak(`The first round is starting in ${Math.floor(game.secondsToNextRound)} seconds`);
        this.announcedStart = true;
      }
      this.game = game;
    } catch (e) {
      console.error(e);
    }
    this.fetching = false;
  }

  get showBeatmap() {
    return !['new', 'complete'].includes(this.game.status);
  }

  get showScores() {
    return ['round-over', 'checking-scores'].includes(this.game.status);
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

  public async skipRound() {
    await this.adminService.skipRound(this.game);
  }

  public async toggleFreeze() {
    await this.adminService.toggleFreeze();
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
