import { Skill } from './../services/trueskill';
import mongoose from 'mongoose';

export interface IUserAchievement {
  achievementId: mongoose.Types.ObjectId;
  progress: number; // A number from 0 to 1 (1 = achieved)
  read?: boolean;
}

export interface IRating {
  mu: number;
  sigma: number;
  weighted: number;
}

export interface IUserResult {
  gameId: mongoose.Types.ObjectId;
  place: number;
  gamePlayers: number;
  gameEndedAt?: Date;
  ratingBefore?: IRating;
  ratingAfter?: IRating;
}

export type Role = 'admin' | 'creator' | 'moderator';

export interface IUser extends mongoose.Document {
  username: string;
  osuUserId: number;
  currentGame?: mongoose.Types.ObjectId;
  ppRank: number;
  countryRank: number;
  country: string;
  rating: IRating;
  gamesPlayed: number;
  wins: number;
  averageRank?: number;
  achievements: IUserAchievement[];
  percentiles: {
    top10: number;
    top20: number;
    top50: number;
  };
  results: IUserResult[];
  roles: Role[];
  banned?: boolean;
  twitch?: {
    loginName: string;
    userId: string;
  };
}

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, index: true },
    osuUserId: { type: Number, required: true, index: true },
    roles: {
      type: [{ type: String, required: true }],
      default: [],
      required: true,
    },
    currentGame: { type: mongoose.Schema.Types.ObjectId },
    ppRank: { type: Number, required: true },
    banned: { type: Boolean, index: true },
    countryRank: { type: Number, required: true },
    gamesPlayed: { type: Number, required: true, default: 0 },
    wins: { type: Number, required: true, default: 0 },
    averageRank: { type: Number },
    country: { type: String, required: true },
    rating: {
      type: {
        mu: { type: Number, required: true },
        sigma: { type: Number, required: true },
        weighted: { type: Number, index: true },
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
          achievementId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
          },
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
          gamePlayers: { type: Number, required: true },
          place: { type: Number, required: true },
          gameEndedAt: { type: Date },
          ratingBefore: {
            type: {
              mu: { type: Number, required: true },
              sigma: { type: Number, required: true },
              weighted: { type: Number },
            },
          },
          ratingAfter: {
            type: {
              mu: { type: Number, required: true },
              sigma: { type: Number, required: true },
              weighted: { type: Number },
            },
          },
        },
      ],
      required: true,
      default: [],
    },
    twitch: {
      type: {
        loginName: { type: String, required: true },
        userId: { type: String, required: true },
      },
    },
  },
  {
    timestamps: true,
  },
);

const User: mongoose.Model<IUser> = mongoose.model<IUser>('User', UserSchema);

export { User };

interface ICreateUserFields {
  pp_rank: string;
  user_id: string;
  pp_country_rank: string;
  username: string;
  country: string;
}

export async function updateOrCreateUser(
  osuUser: ICreateUserFields,
  roles?: Role[],
): Promise<IUser> {
  const osuUserId = parseInt(osuUser.user_id, 10);
  const ppRank = parseInt(osuUser.pp_rank, 10);
  const countryRank = parseInt(osuUser.pp_country_rank, 10);
  const found = await User.findOne({ osuUserId });

  if (found) {
    found.ppRank = ppRank;
    found.countryRank = countryRank;
    found.country = osuUser.country;
    found.osuUserId = osuUserId;
    found.username = osuUser.username;

    return await found.save();
  }

  const rating = Skill.createRating(1650 - 20 * Math.log10(ppRank || 1000000));

  return await User.create({
    username: osuUser.username,
    rating: {
      mu: rating.mu,
      sigma: rating.sigma,
      weighted: rating.mu - 3 * rating.sigma,
    },
    osuUserId,
    ppRank,
    countryRank,
    country: osuUser.country,
    roles,
  });
}
