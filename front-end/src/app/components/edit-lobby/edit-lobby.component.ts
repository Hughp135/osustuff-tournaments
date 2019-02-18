import { GameService, ICreateScheduledGameOptions } from './../../game.service';
import { IBeatmap } from './../create-lobby/create-lobby.component';
import { IGame } from './../game-lobby/game-lobby.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { EditLobbyData } from '../lobby-form/lobby-form.component';

@Component({
  selector: 'app-edit-lobby',
  templateUrl: './edit-lobby.component.html',
  styleUrls: ['./edit-lobby.component.scss'],
})
export class EditLobbyComponent implements OnInit {
  public game: IGame;
  public creating = false;
  public error: string;
  public formData: EditLobbyData;
  public editGame = this.doEditGame.bind(this);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private gameService: GameService,
  ) {}

  ngOnInit() {
    const { data } = <{ data: { lobby: IGame; beatmaps: IBeatmap[] } }>(
      this.route.snapshot.data
    );

    const game = data.lobby;
    const beatmaps = data.beatmaps;

    this.game = game;

    const startDate = new Date(game.nextStageStarts);
    const timezoneOffset = new Date().getTimezoneOffset();
    if (timezoneOffset) {
      // Change game's time zone back into local time zone
      startDate.setHours(startDate.getHours() + timezoneOffset);
    }

    this.formData = {
      startDate,
      title: game.title,
      description: game.description,
      timezoneOffset,
      minPlayers: 4,
      maxPlayers: 250,
      setMinRank: !!game.minRank,
      setMaxRank: !!game.maxRank,
      minRank: game.minRank,
      maxRank: game.maxRank,
      roundBeatmaps: beatmaps.map(b => ({
        beatmapId: parseInt(b.beatmap_id, 10),
        beatmap: b,
      })),
    };
  }

  public async doEditGame(formData) {
    const options: ICreateScheduledGameOptions = {
      nextStageStarts: formData.startDate,
      title: formData.title,
      description: formData.description,
      minPlayers: formData.minPlayers,
      maxPlayers: formData.maxPlayers,
      roundBeatmaps: formData.roundBeatmaps.map(r => r.beatmap),
      minRank: formData.setMinRank ? formData.minRank : undefined,
      maxRank: formData.setMaxRank ? formData.maxRank : undefined,
    };

    try {
      const { gameId } = await this.gameService.editGame(this.game._id, options);

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
