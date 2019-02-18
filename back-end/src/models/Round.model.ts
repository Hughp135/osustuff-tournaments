import mongoose from 'mongoose';
import { IBeatmap } from './Beatmap.model';

export interface IRound extends mongoose.Document {
  beatmap: IBeatmap;
  gameId: mongoose.Types.ObjectId;
  roundNumber: number;
  createdAt?: Date;
}

const RoundSchema = new mongoose.Schema(
  {
    gameId: { type: mongoose.Types.ObjectId, required: true, index: true },
    beatmap: { type: {}, required: true },
    roundNumber: { type: Number, required: true },
  },
  {
    timestamps: true,
  },
);

const Round: mongoose.Model<IRound> = mongoose.model<IRound>('Round', RoundSchema);

export { Round };
