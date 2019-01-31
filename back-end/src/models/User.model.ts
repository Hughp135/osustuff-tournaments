import mongoose from 'mongoose';

export interface IUser extends mongoose.Document {
  username: string;
  osuUserId: number;
  currentGame?: mongoose.Types.ObjectId;
  ppRank: number;
  countryRank: number;
  country: string;
}

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, index: true },
    osuUserId: { type: Number, required: true, index: true },
    currentGame: { type: mongoose.Schema.Types.ObjectId },
    ppRank: { type: Number, required: true },
    countryRank: { type: Number, required: true },
    country: { type: String, required: true },
  },
  {
    timestamps: true,
  },
);

const User: mongoose.Model<IUser> = mongoose.model<IUser>('User', UserSchema);

export { User };
