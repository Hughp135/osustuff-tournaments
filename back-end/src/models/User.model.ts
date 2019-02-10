import { Skill } from './../services/trueskill';
import mongoose from 'mongoose';

export interface IUserAchievement {
  achievementId: mongoose.Types.ObjectId;
  progress: number; // A number from 0 to 1 (1 = achieved)
  read?: boolean;
}

export interface IUserResult {
  gameId: mongoose.Types.ObjectId;
  place: number;
  gameEndedAt?: Date;
  ratingChange?: number;
  ratingBefore?: number;
  ratingAfter?: number;
}

export interface IUser extends mongoose.Document {
  username: string;
  osuUserId: number;
  currentGame?: mongoose.Types.ObjectId;
  ppRank: number;
  countryRank: number;
  country: string;
  rating: {
    mu: number;
    sigma: number;
  };
  gamesPlayed: number;
  wins: number;
  averageRank: number;
  achievements: IUserAchievement[];
  percentiles: {
    top10: number;
    top20: number;
    top50: number;
  };
  results: IUserResult[];
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
    averageRank: { type: Number },
    country: { type: String, required: true },
    rating: {
      type: {
        mu: { type: Number, required: true, index: true },
        sigma: { type: Number, required: true },
      },
      required: true,
    },
    percentiles: {
      type: {
        top10: { type: Number, required: true, default: 0 },
        top20: { type: Number, required: true, default: 0 },
        top50: { type: Number, required: true, default: 0 },
      },
      required: true,
      default: { top10: 0, top20: 0, top50: 0 },
    },
    achievements: {
      type: [
        {
          achievementId: { type: mongoose.Schema.Types.ObjectId, required: true },
          read: { type: Boolean },
          progress: { type: Number, default: 0 },
        },
      ],
      timestamps: true,
      required: true,
      default: [],
    },
    results: {
      type: [
        {
          gameId: { type: mongoose.Schema.Types.ObjectId, required: true },
          place: { type: Number, required: true },
          gameEndedAt: { type: Date },
          ratingChange: { type: Number },
          ratingBefore: { type: Number },
          ratingAfter: { type: Number },
        },
      ],
      required: true,
      default: [],
    },
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

  const rating = Skill.createRating(1650 - 20 * Math.log10(ppRank));

  console.log('new player rating', rating.mu, rating.sigma, 'rank', ppRank);

  return await User.create({
    username: osuUser.username,
    rating: {
      mu: rating.mu,
      sigma: rating.sigma,
    },
    osuUserId,
    ppRank,
    countryRank,
    country: osuUser.country,
  });
}
