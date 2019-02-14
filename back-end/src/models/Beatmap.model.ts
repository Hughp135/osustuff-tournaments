import mongoose from 'mongoose';

export interface IBeatmap extends mongoose.Document {
  beatmapset_id: string;
  beatmap_id: string;
  approved: string;
  total_length: string;
  hit_length: string;
  version: string;
  title: string;
  artist: string;
  approved_date: string;
  difficultyrating: string;
}

const BeatmapSchema = new mongoose.Schema(
  {},
  {
    timestamps: true,
    strict: false,
  },
);

const Beatmap: mongoose.Model<IBeatmap> = mongoose.model<IBeatmap>('Beatmap', BeatmapSchema);

export { Beatmap };
