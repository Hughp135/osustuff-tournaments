import { Component, OnInit, Input } from '@angular/core';
import { DatePipe } from '@angular/common';

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
        return 'Scheduled for ' +  this.datePipe.transform(game.nextStageStarts, ' h:mma, MMM d') + ' (UTC)';
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
}
