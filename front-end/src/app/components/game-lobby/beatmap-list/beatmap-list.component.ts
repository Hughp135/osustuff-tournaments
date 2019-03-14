import { Component, OnInit, Input } from '@angular/core';
import { getTimeComponents } from 'src/app/resolvers/game-lobby.resolver';
import {DomSanitizer} from '@angular/platform-browser';
import { getBeatmapHrefString } from '../beatmap-info/beatmap-info.component';
import { IGame } from '../game-lobby.component';

@Component({
  selector: 'app-beatmap-list',
  templateUrl: './beatmap-list.component.html',
  styleUrls: ['./beatmap-list.component.scss']
})
export class BeatmapListComponent implements OnInit {
  @Input() beatmaps;
  @Input() game: IGame;

  constructor(private sanitizer:DomSanitizer) {}

  ngOnInit() {}

  public starRating(beatmap) {
    return parseFloat(beatmap.difficultyrating).toFixed(2);
  }

  public beatmapHref(beatmap) {
    return `https://osu.ppy.sh/beatmapsets/${beatmap.beatmapset_id}#${getBeatmapHrefString(this.game.gameMode)}/${
      beatmap.beatmap_id
    }`;
  }

  public getDuration(beatmap) {
    const millis = parseFloat(beatmap.total_length) * 1000;

    const { minutes, seconds } = getTimeComponents(millis);

    return `${minutes}:${seconds}`;
  }

  public dlLink(beatmap) {
    return (
      `https://osu.ppy.sh/beatmapsets/${beatmap.beatmapset_id}/download?noVideo=true`
    );
  }

  public osuDirectLink(beatmap) {
    return (
      this.sanitizer.bypassSecurityTrustUrl(`osu://dl/${beatmap.beatmapset_id}`)
    );
  }
}
