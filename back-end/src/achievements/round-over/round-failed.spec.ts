import { ObjectId } from 'bson';
import { User, IUser } from '../../models/User.model';
import mongoose from 'mongoose';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import { Score } from '../../models/Score.model';
import config from 'config';
import { Skill } from '../../services/trueskill';
import { Achievement, IAchievement } from '../../models/Achievement.model';
import { roundFailed } from './round-failed';

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
  afterEach(async () => {
    await User.deleteMany({});
    await Score.deleteMany({});
    await Achievement.deleteMany({});
  });
  after(async () => {
    await mongoose.disconnect();
  });

  it('gives achievement if S rank and within 95% of best combo', async () => {
    const user = await getUser(1);
    const user2 = await getUser(2);

    const passed = await Score.create({
      ...getBaseScoreData(user._id, 100, 'S'),
    });
    const failed = await Score.create({
      ...getBaseScoreData(user2._id, 95, 'S'),
    });

    const achieved = await roundFailed([failed], [passed], [user, user2]);
    expect(achieved.length).to.equal(1);

    const achievement = <IAchievement>await Achievement.findOne({
      _id: achieved[0].achievement._id,
    });

    expect(achievement.title).to.equal('Short Straw');
  });
  it('does not give achievement if under 95% of best combo', async () => {
    const user = await getUser(1);
    const user2 = await getUser(2);

    const passed = await Score.create({
      ...getBaseScoreData(user._id, 100, 'S'),
    });
    const failed = await Score.create({
      ...getBaseScoreData(user2._id, 94, 'S'),
    });

    const achieved = await roundFailed([failed], [passed], [user, user2]);
    expect(achieved.length).to.equal(0);
  });
  it('does not give achievement if not S rank', async () => {
    const user = await getUser(1);
    const user2 = await getUser(2);

    const passed = await Score.create({
      ...getBaseScoreData(user._id, 100, 'S'),
    });
    const failed = await Score.create({
      ...getBaseScoreData(user2._id, 100, 'A'),
    });

    const achieved = await roundFailed([failed], [passed], [user, user2]);
    expect(achieved.length).to.equal(0);
  });
});

async function getUser(id: number): Promise<IUser> {
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

function getBaseScoreData(userId: ObjectId, maxCombo: number, rank: string) {
  return {
    gameId: new ObjectId(),
    score: Math.floor(Math.random() * 10),
    username: userId,
    roundId: new ObjectId(),
    userId,
    rank,
    mods: 0,
    maxCombo,
    accuracy: 1,
    misses: 0,
    count100: 1,
    date: new Date(),
  };
}
