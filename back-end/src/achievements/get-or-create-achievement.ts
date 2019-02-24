import { IAchievement, Achievement } from '../models/Achievement.model';
import { getDataOrCache } from '../services/cache';
import { logger } from '../logger';

export async function getOrCreateAchievement(
  title: string,
  description?: string,
  icon?: string,
): Promise<IAchievement> {
  const achievement = await getDataOrCache(`achievement-${title}`, 60000 * 60, async () => {
    try {
      const existing = await Achievement.findOne({ title });
      if (existing) {
        return existing;
      }
      if (description && icon) {
        return await Achievement.create({ title, description, icon });
      }
      return null;
    } catch (e) {
      logger.error('Failed to create/get achievement ' + title, e);
      throw e;
    }
  });

  if (description && achievement.description !== description) {
    achievement.description = description;
    await achievement.save();
  }

  if (icon && achievement.icon !== icon) {
    await achievement.save();
  }

  return achievement;
}
