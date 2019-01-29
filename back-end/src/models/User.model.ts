import mongoose from 'mongoose';

export interface IUser extends mongoose.Document {
  username: string;
  currentGame?: mongoose.Types.ObjectId;
}

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, index: true },
  currentGame: { type: mongoose.Schema.Types.ObjectId },
}, {
  timestamps: true,
});

const User: mongoose.Model<IUser> = mongoose.model<IUser>('User', UserSchema);

export { User };
