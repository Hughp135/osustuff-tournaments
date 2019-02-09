import { IUser } from './User.model';
import { IBeatmap } from './Round.model';
import mongoose from 'mongoose';

export interface IPlayer {
  username: string;
  userId: mongoose.Schema.Types.ObjectId;
  alive: boolean;
  roundLostOn?: number;
  osuUserId: number;
  ppRank: number;
  countryRank: number;
  country: string;
  gameRank?: number;
}

export interface IGame extends mongoose.Document {
  title: string;
  players: IPlayer[];
  currentRound: mongoose.Types.ObjectId;
  status: 'scheduled' | 'new' | 'in-progress' | 'checking-scores' | 'round-over' | 'complete';
  winningUser: {
    userId: mongoose.Schema.Types.ObjectId;
    username: string;
  };
  roundNumber?: number;
  nextStageStarts?: Date;
  beatmaps: IBeatmap[];
  estimatedEnd: Date;
}

const GameSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    players: {
      type: [
        {
          userId: { type: mongoose.Types.ObjectId, required: true },
          osuUserId: { type: Number, required: true },
          username: { type: String, required: true },
          alive: { type: Boolean, required: true, default: true },
          roundLostOn: { type: Number },
          gameRank: { type: Number },
          ppRank: { type: Number, required: true },
          countryRank: { type: Number, required: true },
          country: { type: String, required: true },
        },
      ],
      default: [],
    },
    roundNumber: { type: Number },
    currentRound: { type: mongoose.Schema.Types.ObjectId },
    status: { type: String, required: true, default: 'new' },
    winningUser: {
      type: {
        userId: { type: mongoose.Types.ObjectId, required: true },
        username: { type: String, required: true },
      },
    },
    nextStageStarts: { type: Date },
    estimatedEnd: { type: Date },
    beatmaps: { type: [], required: true },
  },
  { timestamps: true },
);

const Game: mongoose.Model<IGame> = mongoose.model<IGame>('Game', GameSchema);

export { Game };
