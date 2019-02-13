import { IUser } from '../../models/User.model';
import { getOrCreateAchievement } from '../get-or-create-achievement';
import { giveAchievement } from '../give-achievement';
import { IGame } from '../../models/Game.model';

export async function achievementNewbie(allGameUsers: IUser[], game: IGame) {
  const achievement1 = await getOrCreateAchievement(
    'Newbie',
    'Complete your first match',
    'yellow child',
  );
  const achievement2 = await getOrCreateAchievement(
    'Prodigy',
    'Win the first match you play',
    'pink child',
  );

  await Promise.all(
    allGameUsers
      .filter(u => u.gamesPlayed === 1)
      .map(async user => {
        const achievement = user.wins === 0 ? achievement1 : achievement2;
        await giveAchievement(user, achievement, game);
      }),
  );
}
