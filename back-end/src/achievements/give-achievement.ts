import { IUser } from '../models/User.model';
import { IAchievement } from '../models/Achievement.model';
import { Message } from '../models/Message.model';
import { cache } from '../services/cache';
import { IGame } from '../models/Game.model';

export async function giveAchievement(
  user: IUser,
  achievement: IAchievement,
  game: IGame,
) {
  const userHasAchievement = user.achievements.some(
    a => a.achievementId.toString() === achievement._id.toString(),
  );

  if (!userHasAchievement) {
    user.achievements.push({ achievementId: achievement._id, progress: 1 });
    await user.save();

    const { _id } = await Message.create({
      username: 'System',
      userId: 967760000000,
      osuUserId: 0,
      gameId: game._id,
      message: `${user.username} has just achieved "${achievement.title}"!`,
    });

    cache.put('last-message-id', _id.toString());
  }
}
