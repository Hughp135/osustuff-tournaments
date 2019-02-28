import { IAchievement, Achievement } from '../models/Achievement.model';
import { getDataOrCache } from '../services/cache';
import mongoose from 'mongoose';

export async function getAchievement(id: mongoose.Types.ObjectId): Promise<IAchievement> {
  const achievement = await getDataOrCache(`achievement-${id}`, 60000 * 60, async () => {
    try {
      const found = await Achievement.findById(id);
      return found;
    } catch (e) {
      logger.error(`(achievement id: ${id.toHexString()}) Failed to get achievement!`);
      return null;
    }
  });

  return achievement;
}
