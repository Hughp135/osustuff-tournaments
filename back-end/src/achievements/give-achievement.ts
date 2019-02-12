import { IUser } from '../models/User.model';
import { IAchievement } from '../models/Achievement.model';
import { Message } from '../models/Message.model';
import { cache } from '../services/cache';
import { ObjectID } from 'bson';

export async function giveAchievement(user: IUser, achievement: IAchievement) {
  const userHasAchievement = user.achievements.some(
    a => a.achievementId.toString() === achievement._id.toString(),
  );

  if (!userHasAchievement) {
    user.achievements.push({ achievementId: achievement._id, progress: 1 });
    await user.save();

    if (user.currentGame) {
      const msg = await Message.create({
        username: 'System',
        userId: 967760000000,
        osuUserId: 967760000000,
        gameId: user.currentGame,
        message: `${user.username} has just achieved "${achievement.title}"!`,
      });

      console.log(msg);

      cache.put('last-message-id', msg._id.toString());
    }
  }
}
