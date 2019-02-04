import { Component, OnInit, Input } from '@angular/core';
import { getTimeComponents } from '../game-lobby.component';

@Component({
  selector: 'app-beatmap-info',
  templateUrl: './beatmap-info.component.html',
  styleUrls: ['./beatmap-info.component.scss'],
})
export class BeatmapInfoComponent implements OnInit {
  @Input() game;
  @Input() beatmap;
  @Input() isAlive: boolean;
  @Input() timeLeft: string;
  @Input() hideTitle?: boolean;

  constructor() {}

  ngOnInit() {}

  public getBgStyles() {
    return (
      this.beatmap && {
        background: `linear-gradient( rgba(0, 0, 0, 0.6),
            rgba(0, 0, 0, 0.7) ),
            url(https://assets.ppy.sh/beatmaps/${
              this.beatmap.beatmapset_id
            }/covers/card@2x.jpg)`,
      }
    );
  }

  get starRating() {
    return parseFloat(this.beatmap.difficultyrating).toFixed(2);
  }

  get beatmapHref() {
    return (
      this.beatmap &&
      `https://osu.ppy.sh/beatmapsets/${this.beatmap.beatmapset_id}#osu/${
        this.beatmap.beatmap_id
      }`
    );
  }

  get duration() {
    const millis = parseFloat(this.beatmap.total_length) * 1000;

    const { minutes, seconds } = getTimeComponents(millis);

    return `${minutes}:${seconds}`;
  }
}
