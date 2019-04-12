import { Component, OnInit, Input } from '@angular/core';
import { DatePipe } from '@angular/common';


const gameModeNames: {[key: string]: string} = {
  0: 'osu!standard',
  1: 'osu!taiko',
  2: 'osu!ctb',
  3: 'osu!mania',
};

@Component({
  selector: 'app-lobbies-list',
  templateUrl: './lobbies-list.component.html',
  styleUrls: ['./lobbies-list.component.scss']
})
export class LobbiesListComponent implements OnInit {
  @Input() lobbies: any[];

  constructor(private datePipe: DatePipe) { }

  ngOnInit() {
  }

  public getStatus(game) {
    switch (game.status) {
      case 'scheduled':
        return 'Opens ' +  this.datePipe.transform(game.nextStageStarts, ' MMM, d h:mma (z)');
      case 'new':
        return `Open ${game.minRank ? ` for lower ranked players (${game.minRank / 1000}k+)` : ' to join'}`;
      case 'complete':
        return 'Finished';
      default:
        return 'In Progress';
    }
  }

  public getLobbyIconClass(lobby) {
    switch (lobby.status) {
      case 'scheduled':
        return 'grey calendar alternate outline';
      case 'new':
        return `${lobby.minRank ? 'teal' : 'green'} play`;
      case 'complete':
        return 'grey flag checkered';
      default:
        return 'orange eye';
    }
  }

  public gameModeName(mode: string) {
    return gameModeNames[mode];
  }
}
