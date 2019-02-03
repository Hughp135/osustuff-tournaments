import mongoose from 'mongoose';

export interface IAchievement extends mongoose.Document {
  title: string;
  description: string;
  icon: string;
}

const AchievementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, index: true },
    description: { type: String, required: true },
    icon: { type: String, required: true },
  },
);

const Achievement: mongoose.Model<IAchievement> = mongoose.model<
  IAchievement
>('Achievement', AchievementSchema);

export { Achievement };
