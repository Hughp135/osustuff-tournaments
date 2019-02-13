import { ObjectId } from 'bson';
import { User, IUser } from '../../models/User.model';
import { Game } from '../../models/Game.model';
import mongoose from 'mongoose';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import { Score } from '../../models/Score.model';
import config from 'config';
import { achievementModScores } from './mod-scores';
import { Skill } from '../../services/trueskill';
import { Achievement, IAchievement } from '../../models/Achievement.model';

const expect = chai.expect;
chai.use(sinonChai);

describe('achievement - mods scores', async () => {
  before(async () => {
    await mongoose.connect(
      'mongodb://127.0.0.1:' + config.get('DB_PORT') + '/osu-br-test',
      {
        useNewUrlParser: true,
      },
    );
  });
  after(async () => {
    await mongoose.disconnect();
  });
  beforeEach(async () => {
    await Game.deleteMany({});
    await Score.deleteMany({});
    await User.deleteMany({});
  });
  it('does not add achievement if under 25 scores set', async () => {
    const user = await getUser(1);
    for (let i = 0; i < 24; i++) {
      await Score.create({
        ...getBaseScoreData(user._id, 10), // HD
      });
    }
    await achievementModScores([user], <any>{ _id: new ObjectId() });

    const userUpdated = <IUser>await User.findById(user._id);
    expect(userUpdated.achievements.length).to.equal(0);
  });
  it('adds achievement if 25 HD only scores and all have HD', async () => {
    const user = await getUser(1);
    for (let i = 0; i < 25; i++) {
      await Score.create({
        ...getBaseScoreData(user._id, 8), // HD
      });
    }
    await achievementModScores([user], <any>{ _id: new ObjectId() });

    const userUpdated = <IUser>await User.findById(user._id);
    expect(userUpdated.achievements.length).to.equal(1);
    const achievement = <IAchievement>(
      await Achievement.findOne({
        _id: userUpdated.achievements[0].achievementId,
      })
    );
    expect(achievement.title).to.equal('HD Adept');
  });
  it('does not achievement if mods have anything other than just HD', async () => {
    const user = await getUser(1);
    for (let i = 0; i < 25; i++) {
      await Score.create({
        ...getBaseScoreData(user._id, 16), // HDHR
      });
    }
    await achievementModScores([user], <any>{ _id: new ObjectId() });

    const userUpdated = <IUser>await User.findById(user._id);
    expect(userUpdated.achievements.length).to.equal(0);
  });
  it('does not give achievement if not all scores are HD - only', async () => {
    const user = await getUser(1);
    for (let i = 0; i < 15; i++) {
      await Score.create({
        ...getBaseScoreData(user._id, 8), // HD
      });
      await Score.create({
        ...getBaseScoreData(user._id, 16), // HDHR
      });
    }
    await achievementModScores([user], <any>{ _id: new ObjectId() });

    const userUpdated = <IUser>await User.findById(user._id);
    expect(userUpdated.achievements.length).to.equal(0);
  });
});

async function getUser(id: number) {
  const { mu, sigma } = Skill.createRating();
  return await User.create({
    username: `user${id}`,
    ppRank: id,
    countryRank: id,
    osuUserId: id,
    country: 'US',
    rating: { mu, sigma },
  });
}

function getBaseScoreData(userId: ObjectId, mods: number) {
  return {
    gameId: new ObjectId(),
    score: 123,
    username: userId,
    roundId: new ObjectId(),
    userId,
    rank: 'A',
    mods,
    maxCombo: 10,
    accuracy: 1,
    misses: 0,
    count100: 1,
    date: new Date(),
  };
}
