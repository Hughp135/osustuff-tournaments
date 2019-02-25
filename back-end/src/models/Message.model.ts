import mongoose from 'mongoose';

export interface IMessage extends mongoose.Document {
  username: string;
  gameId: mongoose.Types.ObjectId;
  osuUserId: number;
  userId: mongoose.Types.ObjectId;
  message: string;
}

const MessageSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, index: true },
    gameId: {type: mongoose.Schema.Types.ObjectId, required: true, index: true},
    osuUserId: {type: Number, required: true, index: true},
    userId: {type: mongoose.Schema.Types.ObjectId, required: true, index: true},
    message: { type: String, required: true },
  },
  {
    timestamps: true,
  },
);

const Message: mongoose.Model<IMessage> = mongoose.model<
  IMessage
>('Message', MessageSchema);

export { Message };
