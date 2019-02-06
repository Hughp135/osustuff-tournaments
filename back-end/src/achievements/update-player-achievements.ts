import { achievementNewbie } from './game-complete/newbie';
import winston from 'winston';
import { IGame } from 'src/models/Game.model';
import { achievementVersatile } from './game-complete/versatile';
import { achievementPlayAsTester } from './join-game/play-as-tester';
import { User } from 'src/models/User.model';

export async function updatePlayerAchievements(game: IGame) {
  const aliveUsers = await User.find({ currentGame: game._id });
  const userOsuIds = game.players.map(p => p.osuUserId);
  const allGameUsers = await User.find({ osuUserId: userOsuIds, gamesPlayed: 0 });

  try {
    switch (game.status) {
      case 'round-over':
        await achievementPlayAsTester(aliveUsers);
      case 'complete':
        await achievementNewbie(allGameUsers);
        await achievementVersatile(game);
    }
  } catch (e) {
    winston.error('Failed to updated achievements', e);
  }
}
