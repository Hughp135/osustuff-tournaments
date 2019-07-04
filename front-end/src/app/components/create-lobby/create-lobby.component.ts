import { GameService, ICreateScheduledGameOptions } from './../../game.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EditLobbyData } from '../lobby-form/lobby-form.component';

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
  public creating = false;
  public error: string;
  public description?: string;
  public createGame = this.doCreateGame.bind(this);

  constructor(private gameService: GameService, private router: Router) {}

  ngOnInit() {}

  public async doCreateGame(formData: EditLobbyData) {
    this.error = undefined;
    this.creating = true;
    if (!formData) {
      this.error = 'A start date must be set';
      this.creating = false;
      return;
    }
    const date = formData.startDate;
    if (formData.timezoneOffset) {
      date.setHours(date.getHours() + formData.timezoneOffset);
    }

    const options: ICreateScheduledGameOptions = {
      nextStageStarts: formData.startDate,
      title: formData.title,
      description: formData.description,
      minPlayers: formData.minPlayers,
      maxPlayers: formData.maxPlayers,
      roundBeatmaps: formData.roundBeatmaps.map(r => r.beatmap),
      minRank: formData.setMinRank ? formData.minRank : undefined,
      maxRank: formData.setMaxRank ? formData.maxRank : undefined,
      gameMode: formData.gameMode.value,
      password: formData.password,
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

}
