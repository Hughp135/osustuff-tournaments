import { GameService, ICreateScheduledGameOptions } from './../../game.service';
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';

export interface IBeatmap {
  beatmapset_id: string;
  beatmap_id: string;
  approved: string;
  total_length: string;
  hit_length: string;
  version: string;
  title: string;
  artist: string;
  approved_date: string;
  difficultyrating: string;
}

@Component({
  selector: 'app-create-lobby',
  templateUrl: './create-lobby.component.html',
  styleUrls: ['./create-lobby.component.scss'],
})
export class CreateLobbyComponent implements OnInit {
  public title: string;
  public pickerMinDate = new Date();
  public startDate: Date;
  public timezoneOffset = new Date().getTimezoneOffset();
  public minPlayers = 4;
  public maxPlayers = 250;
  public setMinRank = false;
  public setMaxRank = false;
  public minRank = 50;
  public maxRank = 1000000;
  public roundBeatmaps: {
    beatmapId?: number;
    beatmap?: IBeatmap;
    fetching?: boolean;
    error?: string;
  }[] = new Array(10).fill(null).map(() => ({
    beatmapId: undefined,
    beatmap: undefined,
  }));
  public creating = false;
  public error: string;

  public getBeatmap = debounce(async (value: number, index: number) => {
    const roundBeatmap = this.roundBeatmaps[index];
    roundBeatmap.fetching = true;
    roundBeatmap.error = undefined;

    try {
      const { beatmap } = <{ beatmap: IBeatmap | null }>(
        await this.apiService.get(`beatmap/${value}`)
      );

      if (!beatmap) {
        roundBeatmap.error = 'Beatmap not found with this ID';
        roundBeatmap.fetching = false;

        return;
      }

      roundBeatmap.beatmap = beatmap;
    } catch (e) {
      console.error(e);
      roundBeatmap.error = 'Unable to retrieve the beatmap';
    }

    roundBeatmap.fetching = false;
  }, 250);

  constructor(
    private apiService: ApiService,
    private gameService: GameService,
    private router: Router,
  ) {}

  ngOnInit() {}

  public async createGame() {
    this.error = undefined;
    this.creating = true;
    const date = this.startDate;
    if (this.timezoneOffset) {
      date.setHours(date.getHours() + this.timezoneOffset);
    }

    const options: ICreateScheduledGameOptions = {
      date: this.startDate,
      title: this.title,
      minPlayers: this.minPlayers,
      maxPlayers: this.maxPlayers,
      roundBeatmaps: this.roundBeatmaps.map(r => r.beatmap),
      minRank: this.setMinRank ? this.minRank : undefined,
      maxRank: this.setMaxRank ? this.maxRank : undefined,
    };

    try {
      const { gameId } = await this.gameService.createScheduledGame(options);

      this.router.navigate(['/lobbies', gameId]);
    } catch (e) {
      this.creating = false;
      if (e.error && e.error.error) {
        this.error = e.error.error;
      } else {
        if (e.status === 401) {
          this.error = 'You do not have the permissions to create a lobby';
        } else {
          this.error = 'Failed to create game';
          console.error(e);
        }
      }
    }
  }

  public getBeatmapString(beatmap: IBeatmap) {
    return `${beatmap.artist} - ${beatmap.title} [${
      beatmap.version
    }] (${parseFloat(beatmap.difficultyrating).toFixed(2)}*)`;
  }
}

function debounce(
  func: (...args: any) => Promise<any>,
  wait: number,
  immediate?: boolean,
) {
  let timeout;
  return function() {
    const context = this,
      args = arguments;
    const later = function() {
      timeout = null;
      if (!immediate) {
        func.apply(context, args);
      }
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) {
      func.apply(context, args);
    }
  };
}
