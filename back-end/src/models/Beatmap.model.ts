import mongoose from 'mongoose';

export interface IBeatmap extends mongoose.Document {
  title: string;
  artist: string;
  version: string;
  beatmap_id: string;
  beatmapset_id: string;
  total_length: string;
}

const BeatmapSchema = new mongoose.Schema(
  {
    type: Object,
  },
  {
    timestamps: true,
  },
);

const Beatmap: mongoose.Model<IBeatmap> = mongoose.model<IBeatmap>('Beatmap', BeatmapSchema);

export { Beatmap };
