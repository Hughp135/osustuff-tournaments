import mongoose from 'mongoose';

export interface IScore extends mongoose.Document {
  roundId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  username: string;
  score: number;
  rank: string;
  mods: number;
  misses: number;
  maxCombo: number;
  accuracy: number;
  date: Date;
  count100: number;
  passedRound?: boolean;
  place?: number;
}

const ScoreSchema = new mongoose.Schema(
  {
    roundId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    username: { type: String, required: true },
    score: { type: Number, required: true },
    rank: { type: String, required: true },
    mods: { type: Number, required: true },
    maxCombo: { type: Number, required: true },
    accuracy: { type: Number, required: true },
    count100: { type: Number, required: true },
    misses: { type: Number, required: true },
    date: { type: Date, required: true },
    passedRound: { type: Boolean },
    place: { type: Number },
  },
  {
    timestamps: true,
  },
);

const Score: mongoose.Model<IScore> = mongoose.model<IScore>('Score', ScoreSchema);

export { Score };
