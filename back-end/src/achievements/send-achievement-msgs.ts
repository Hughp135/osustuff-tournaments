import { IUserAchieved } from './update-player-achievements';
import { IGame } from '../models/Game.model';
import { cache } from '../services/cache';
import { sendSystemMessage } from '../game/send-system-message';

export async function sendAchievementMessages(
  achievementsGiven: IUserAchieved[],
  game: IGame,
) {
  const byAchievement: Array<{
    title: string;
    usernames: string[];
  }> = achievementsGiven.reduce(
    (acc, curr) => {
      const achievementAdded = acc.find(
        a => a.title === curr.achievement.title,
      );
      if (!achievementAdded) {
        acc.push({
          title: curr.achievement.title,
          usernames: [curr.user.username],
        });
      } else {
        achievementAdded.usernames.push(curr.user.username);
      }
      return acc;
    },
    <Array<{ title: string; usernames: string[] }>>[],
  );

  for (const achievement of byAchievement) {
    const count = achievement.usernames.length;
    const { _id } = await sendSystemMessage(
      game,
      `${achievement.usernames.join(', ')} ${
        count > 1 ? 'have' : 'has'
      } earned the achievement "${achievement.title}"!`,
    );

    cache.put('last-message-id', _id.toString());
  }
}
