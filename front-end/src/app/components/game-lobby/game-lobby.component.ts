import { GameService } from './../../game.service';
import { SettingsService, CurrentGame } from './../../services/settings.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription, interval } from 'rxjs';

export interface IPlayer {
  username: string;
  alive: boolean;
  roundLostOn?: number;
  osuUserId: number;
  ppRank: number;
  countryRank: number;
  country: string;
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
  public currentGame: CurrentGame;
  public beatmaps: any;
  public showBeatmapList: boolean;
  private fetching = false;
  public timeLeft: string;
  private fetchingMessages = false;

  constructor(
    private route: ActivatedRoute,
    private settingsService: SettingsService,
    private gameService: GameService,
  ) {}

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
    const pollGameSub = interval(5000).subscribe(async () => {
      await this.fetch();
    });
    const timeLeftSub = interval(1000).subscribe(() => {
      if (!this.game.secondsToNextRound) {
        return;
      }

      // Take 1 second off time left every second
      this.game.secondsToNextRound = Math.max(0, this.game.secondsToNextRound - 1);
      this.getTimeLeft();
    });
    const messagesSub = interval(3000).subscribe(async () => {
      await this.getMoreMessages();
    });

    this.subscriptions = [currentGameSub, pollGameSub, timeLeftSub, messagesSub];
  }
  private getTimeLeft() {
    if (!this.game.secondsToNextRound) {
      this.timeLeft = `--:--`;
      return;
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

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private async fetch() {
    if (this.fetching) {
      return;
    }

    this.fetching = true;
    try {
      this.game = <any>await this.gameService.getLobby(this.game._id);
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
