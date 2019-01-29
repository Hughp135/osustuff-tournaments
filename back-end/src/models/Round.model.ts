import mongoose from 'mongoose';

export interface IRound extends mongoose.Document {
  endsAt: Date;
  beatmap: {
    title: string;
    beatmapId: string;
  };
}

const RoundSchema = new mongoose.Schema(
  {
    endsAt: { type: Date, required: true },
    beatmap: {
      type: {
        title: { type: String, required: true },
        beatmapId: { type: String, required: true },
      },
    },
  },
  {
    timestamps: true,
  },
);

const Round: mongoose.Model<IRound> = mongoose.model<IRound>('Round', RoundSchema);

export { Round };
