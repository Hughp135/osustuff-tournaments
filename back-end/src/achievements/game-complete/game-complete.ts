import { IUser } from '../../models/User.model';
import { getOrCreateAchievement } from '../get-or-create-achievement';
import { IUserAchieved } from '../update-player-achievements';

export async function gameComplete(
  users: IUser[],
): Promise<IUserAchieved[]> {
  const determined = await getOrCreateAchievement(
    'Determined',
    'Play five matches in a day',
    'orange redo',
  );
  const hardcoreGamer = await getOrCreateAchievement(
    'Hardcore Gamer',
    'Play 10 matches in a day',
    'red redo',
  );
  const newbie = await getOrCreateAchievement(
    'Newbie',
    'Complete your first match',
    'purple leaf',
  );
  const novice = await getOrCreateAchievement(
    'Novice',
    'Play 10 matches',
    'blue child',
  );
  const challenger = await getOrCreateAchievement(
    'Challenger',
    'Play 25 matches',
    'teal headphones',
  );
  const expert = await getOrCreateAchievement(
    'Expert',
    'Play 50 matches',
    'green paper plane',
  );
  const veteran = await getOrCreateAchievement(
    'Veteran',
    'Play 75 matches',
    'olive users',
  );
  const centenary = await getOrCreateAchievement(
    'Centenary',
    'Play 100 matches',
    'yellow star',
  );
  const prodigy = await getOrCreateAchievement(
    'Prodigy',
    'Win the first match you play',
    'pink child',
  );

  const achieved: IUserAchieved[] = [];

  const oneDayAgo = new Date();
  oneDayAgo.setHours(oneDayAgo.getHours() - 24);

  for (const user of users) {
    if (user.gamesPlayed === 1 && user.wins === 1) {
      achieved.push({ user, achievement: prodigy });
    }

    if (user.gamesPlayed >= 100) {
      achieved.push({ user, achievement: centenary });
    }
    if (user.gamesPlayed >= 75) {
      achieved.push({ user, achievement: veteran });
    }
    if (user.gamesPlayed >= 50) {
      achieved.push({ user, achievement: expert });
    }
    if (user.gamesPlayed >= 25) {
      achieved.push({ user, achievement: challenger });
    }
    if (user.gamesPlayed >= 10) {
      achieved.push({ user, achievement: novice });
    }
    if (user.gamesPlayed >= 1) {
      achieved.push({ user, achievement: newbie });
    }

    const recentResults = user.results.filter(r => r.gameEndedAt && r.gameEndedAt >= oneDayAgo);

    if (recentResults.length >= 10) {
      achieved.push({ user, achievement: hardcoreGamer });
    }
    if (recentResults.length >= 5) {
      achieved.push({ user, achievement: determined });
    }
  }

  return achieved;
}
