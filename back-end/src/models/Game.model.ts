import mongoose from 'mongoose';

export interface IPlayer {
  username: string;
  userId: mongoose.Schema.Types.ObjectId;
  alive: boolean;
  roundLostOn?: number;
}

export interface IGame extends mongoose.Document {
  players: IPlayer[];
  currentRound: mongoose.Types.ObjectId;
  status: 'new' | 'in-progress' | 'checking-scores' | 'round-over' | 'complete';
  winningUser: {
    userId: mongoose.Schema.Types.ObjectId;
    username: string;
  };
  roundNumber?: number;
  nextStageStarts?: Date;
}

const GameSchema = new mongoose.Schema(
  {
    players: {
      type: [
        {
          userId: { type: mongoose.Types.ObjectId, required: true },
          username: { type: String, required: true },
          alive: { type: Boolean, required: true, default: true },
          roundLostOn: { type: Number },
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
  },
  { timestamps: true },
);

const Game: mongoose.Model<IGame> = mongoose.model<IGame>('Game', GameSchema);

export { Game };
