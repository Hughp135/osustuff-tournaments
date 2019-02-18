import { Component, OnInit, Input } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { IBeatmap } from '../create-lobby/create-lobby.component';

export interface EditLobbyData {
  title: string;
  description: string;
  startDate?: Date;
  timezoneOffset: number;
  minPlayers: number;
  maxPlayers: number;
  setMinRank: boolean;
  setMaxRank: boolean;
  minRank: number;
  maxRank: number;
  roundBeatmaps: {
    beatmapId?: number;
    beatmap?: IBeatmap;
    fetching?: boolean;
    error?: string;
  }[];
}

@Component({
  selector: 'app-lobby-form',
  templateUrl: './lobby-form.component.html',
  styleUrls: ['./lobby-form.component.scss'],
})
export class LobbyFormComponent implements OnInit {
  public pickerMinDate = new Date();
  @Input() formData: EditLobbyData = {
    title: '',
    description: '',
    timezoneOffset: new Date().getTimezoneOffset(),
    minPlayers: 4,
    maxPlayers: 250,
    setMinRank: false,
    setMaxRank: false,
    minRank: 50,
    maxRank: 1000000,
    roundBeatmaps: new Array(10).fill(null).map(() => ({
      beatmapId: undefined,
      beatmap: undefined,
    })),
  };
  @Input() onSubmit: (formData: EditLobbyData) => Promise<any>;
  @Input() creating = false;
  @Input() error: string;
  @Input() isEditing: boolean;

  constructor(private apiService: ApiService) {}

  public getBeatmap = debounce(async (value: number, index: number) => {
    const roundBeatmap = this.formData.roundBeatmaps[index];
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

  ngOnInit() {}

  public getBeatmapString(beatmap: IBeatmap) {
    return `${beatmap.artist} - ${beatmap.title} [${
      beatmap.version
    }] (${parseFloat(beatmap.difficultyrating).toFixed(2)}*)`;
  }

  public clearBeatmap(index: number) {
    const round = this.formData.roundBeatmaps[index];
    if (round) {
      round.beatmap = undefined;
      round.fetching = false;
      round.beatmapId = undefined;
      round.error = undefined;
    }
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
