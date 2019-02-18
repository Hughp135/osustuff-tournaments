import { GameService } from './../../../game.service';
import { IUser } from './../../user-profile/user-profile.component';
import { BehaviorSubject } from 'rxjs';
import { IPlayer, IGame } from './../game-lobby.component';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
})
export class UserListComponent implements OnInit {
  @Input() players: IPlayer[];
  @Input() winningUser: string;
  @Input() currentUser: IUser;
  @Input() usersFetched: BehaviorSubject<undefined>;
  @Input() game: IGame;

  public hiddenPlayers: number;
  public playerCount: number;
  public popupData: { player: IPlayer; offsetTop: number };
  public ignoreClickEvent = false;
  public kickPlayer = this.doKickPlayer.bind(this);

  constructor(private gameService: GameService) {}

  ngOnInit() {}

  public showPlayerStats(event, player) {
    this.popupData = { player, offsetTop: event.pageY };
    this.ignoreClickEvent = true;
  }

  public onDocumentClick() {
    if (!this.ignoreClickEvent) {
      this.popupData = undefined;
    }
    this.ignoreClickEvent = false;
  }

  public async doKickPlayer(player) {
    await this.gameService.kickUser(this.game._id, player.osuUserId);
  }

  get alivePlayers() {
    return this.players.filter(p => p.alive);
  }

  get sortedPlayers() {
    const filtered = this.players
      .sort((a, b) => {
        if (a.gameRank && b.gameRank) {
          return a.gameRank - b.gameRank;
        }

        if (a.gameRank) {
          return 1;
        }
        if (b.gameRank) {
          return -1;
        }

        return a.ppRank - b.ppRank;
      })
      .sort((a, b) => {
        if (a.username === this.currentUsername) {
          return -1;
        } else if (b.username === this.currentUsername) {
          return 1;
        } else {
          return 0;
        }
      })
      .slice(0, 200);

    if (filtered.length < this.players.length) {
      this.hiddenPlayers = this.players.length - filtered.length;
    }

    return filtered;
  }

  get currentUsername() {
    return this.currentUser && this.currentUser.username;
  }

  get isModerator() {
    return (
      this.currentUser &&
      this.currentUser.roles &&
      this.currentUser.roles.includes('moderator')
    );
  }
}
