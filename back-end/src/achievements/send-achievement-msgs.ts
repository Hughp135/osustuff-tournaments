import { IUserAchieved } from './update-player-achievements';
import { IGame } from '../models/Game.model';
import { cache } from '../services/cache';
import { Message } from '../models/Message.model';

export async function sendAchievementMessages(achievementsGiven: IUserAchieved[], game: IGame) {
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
    const { _id } = await Message.create({
      username: 'System',
      userId: 967760000000,
      osuUserId: 0,
      gameId: game._id,
      message: `${achievement.usernames.join(', ')} ${
        count > 1 ? 'have' : 'has'
      } just achieved "${achievement.title}"!`,
    });

    cache.put('last-message-id', _id.toString());
  }
}
