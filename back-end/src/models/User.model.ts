import mongoose from 'mongoose';

export interface IUser extends mongoose.Document {
  username: string;
  osuUserId: number;
  currentGame?: mongoose.Types.ObjectId;
  ppRank: number;
  countryRank: number;
  country: string;
  elo: number;
  gamesPlayed: number;
  wins: number;
}

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, index: true },
    osuUserId: { type: Number, required: true, index: true },
    currentGame: { type: mongoose.Schema.Types.ObjectId },
    ppRank: { type: Number, required: true },
    countryRank: { type: Number, required: true },
    gamesPlayed: { type: Number, required: true, default: 0 },
    wins: { type: Number, required: true, default: 0 },
    country: { type: String, required: true },
    elo: { type: Number, required: true, default: 1500, index: true },
  },
  {
    timestamps: true,
  },
);

const User: mongoose.Model<IUser> = mongoose.model<IUser>('User', UserSchema);

export { User };

export async function updateOrCreateUser(osuUser: any): Promise<IUser> {
  const osuUserId = parseInt(osuUser.user_id, 10);
  const ppRank = parseInt(osuUser.pp_rank, 10);
  const countryRank = parseInt(osuUser.pp_country_rank, 10);
  const found = await User.findOne({ osuUserId });

  if (found) {
    found.ppRank = ppRank;
    found.countryRank = countryRank;
    found.country = osuUser.country;
    found.osuUserId = osuUserId;

    return await found.save();
  }

  return await User.create({
    username: osuUser.username,
    osuUserId,
    ppRank,
    countryRank,
    country: osuUser.country,
  });
}
