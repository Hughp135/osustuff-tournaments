import mongoose from 'mongoose';

export interface IRound extends mongoose.Document {
  beatmap: {
    title: string;
    beatmapId: string;
  };
  gameId: mongoose.Types.ObjectId;
}

const RoundSchema = new mongoose.Schema(
  {
    gameId: { type: mongoose.Types.ObjectId, required: true },
    beatmap: {
      type: {
        title: { type: String, required: true },
        beatmapId: { type: String, required: true },
      },
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Round: mongoose.Model<IRound> = mongoose.model<IRound>(
  'Round',
  RoundSchema,
);

export { Round };
