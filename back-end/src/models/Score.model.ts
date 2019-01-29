import mongoose from 'mongoose';

export interface IScore extends mongoose.Document {
  roundId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  score: number;
  rank: string;
  mods: number;
  misses: number;
  maxCombo: number;
}

const ScoreSchema = new mongoose.Schema(
  {
    roundId: { type: mongoose.Schema.Types.ObjectId, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    score: { type: Number, required: true },
    rank: { type: String, required: true },
    mods: { type: Number, required: true },
    maxCombo: { type: Number, required: true },
    misses: { type: Number, required: true },
  },
  {
    timestamps: true,
  },
);

const Score: mongoose.Model<IScore> = mongoose.model<IScore>(
  'Score',
  ScoreSchema,
);

export { Score };
