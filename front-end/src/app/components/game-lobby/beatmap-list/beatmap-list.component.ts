import { Component, OnInit, Input } from '@angular/core';
import { getTimeComponents } from '../game-lobby.component';

@Component({
  selector: 'app-beatmap-list',
  templateUrl: './beatmap-list.component.html',
  styleUrls: ['./beatmap-list.component.scss']
})
export class BeatmapListComponent implements OnInit {
  @Input() beatmaps;

  constructor() {}

  ngOnInit() {}

  public starRating(beatmap) {
    return parseFloat(beatmap.difficultyrating).toFixed(2);
  }

  public beatmapHref(beatmap) {
    return `https://osu.ppy.sh/beatmapsets/${beatmap.beatmapset_id}#osu/${
      beatmap.beatmap_id
    }`;
  }

  public getDuration(beatmap) {
    const millis = parseFloat(beatmap.total_length) * 1000;

    const { minutes, seconds } = getTimeComponents(millis);

    return `${minutes}:${seconds}`;
  }
}
