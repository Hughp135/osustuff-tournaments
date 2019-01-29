import mongoose from 'mongoose';

export interface IJoinGameRequest extends mongoose.Document {
  username: string;
  gameId: mongoose.Types.ObjectId;
  verified: boolean;
  expiresAt: Date;
}

const JoinGameRequestSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, index: true },
    gameId: {type: mongoose.Schema.Types.ObjectId, required: true, index: true},
    verified: { type: Boolean, required: true, default: false },
    expiresAt: { type: Date, required: true },
  },
  {
    timestamps: true,
  },
);

const JoinGameRequest: mongoose.Model<IJoinGameRequest> = mongoose.model<
  IJoinGameRequest
>('JoinGameRequest', JoinGameRequestSchema);

export { JoinGameRequest };
