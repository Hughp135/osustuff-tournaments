import mongoose from 'mongoose';

export interface IBeatmap {
  title: string;
  artist: string;
  version: string;
  beatmap_id: string;
  beatmapset_id: string;
  total_length: string;
}

export interface IRound extends mongoose.Document {
  beatmap: IBeatmap;
  gameId: mongoose.Types.ObjectId;
}

const RoundSchema = new mongoose.Schema(
  {
    gameId: { type: mongoose.Types.ObjectId, required: true },
    beatmap: { type: {}, required: true },
  },
  {
    timestamps: true,
  },
);

const Round: mongoose.Model<IRound> = mongoose.model<IRound>('Round', RoundSchema);

export { Round };
