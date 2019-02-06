import { achievementNewbie } from './game-complete/newbie';
import winston from 'winston';
import { IGame } from 'src/models/Game.model';
import { achievementVersatile } from './game-complete/versatile';
import { achievementPlayAsTester } from './join-game/play-as-tester';
import { User } from 'src/models/User.model';
import { achievementWinAGame } from './game-complete/win-a-game';

export async function updatePlayerAchievements(game: IGame) {
  const userOsuIds = game.players.map(p => p.osuUserId);
  const allGameUsers = await User.find({ osuUserId: userOsuIds });
  const aliveUsers = allGameUsers.filter(u => {
    const player = game.players.find(p => p.osuUserId === u.osuUserId);
    return player && !!player.alive;
  });

  try {
    switch (game.status) {
      case 'round-over':
        await achievementPlayAsTester(aliveUsers);
      case 'complete':
        await achievementNewbie(allGameUsers);
        await achievementVersatile(game);
        await achievementWinAGame(game, allGameUsers);
    }
  } catch (e) {
    winston.error('Failed to updated achievements', e);
  }
}
