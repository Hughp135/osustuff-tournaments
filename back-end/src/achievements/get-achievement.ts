import { IAchievement, Achievement } from '../models/Achievement.model';
import { getDataOrCache } from '../services/cache';
import winston = require('winston');
import mongoose from 'mongoose';

export async function getAchievement(
  id: mongoose.Types.ObjectId,
): Promise<IAchievement> {
  const achievement = await getDataOrCache(
    `achievement-${id}`,
    60000,
    async () => {
      try {
        return await Achievement.findById(id);
      } catch (e) {
        winston.error('Failed to get achievement', e);
        return null;
      }
    },
  );

  return achievement;
}
