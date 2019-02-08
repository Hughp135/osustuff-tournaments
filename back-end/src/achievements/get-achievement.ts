import { IAchievement, Achievement } from '../models/Achievement.model';
import { getDataOrCache } from '../services/cache';
import mongoose from 'mongoose';
import { logger } from '../logger';

export async function getAchievement(id: mongoose.Types.ObjectId): Promise<IAchievement> {
  const achievement = await getDataOrCache(`achievement-${id}`, 60000 * 60, async () => {
    try {
      const achi = await Achievement.findById(id);
      return achi;
    } catch (e) {
      logger.error('Failed to get achievement', e);
      return null;
    }
  });

  return achievement;
}
