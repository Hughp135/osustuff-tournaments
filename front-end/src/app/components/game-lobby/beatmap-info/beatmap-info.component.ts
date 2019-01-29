import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-beatmap-info',
  templateUrl: './beatmap-info.component.html',
  styleUrls: ['./beatmap-info.component.scss'],
})
export class BeatmapInfoComponent implements OnInit {
  constructor() {}

  ngOnInit() {}

  public getBgStyles() {
    return {
      background: `linear-gradient( rgba(0, 0, 0, 0.6),
            rgba(0, 0, 0, 0.7) ),
            url(https://assets.ppy.sh/beatmaps/809056/covers/card@2x.jpg)`,
      'background-position': 'center',
      'background-size': 'cover',
      'background-repeat': 'no-repeat',
    };
  }
}
