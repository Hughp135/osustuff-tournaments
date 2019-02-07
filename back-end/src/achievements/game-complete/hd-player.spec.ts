import { ObjectId } from 'bson';
import { User, IUser } from 'src/models/User.model';
import { Game } from 'src/models/Game.model';
import mongoose from 'mongoose';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import { Score } from 'src/models/Score.model';
import config from 'config';
import { achievementHdPlayer } from './hd-player';
import { Skill } from 'src/services/trueskill';

const expect = chai.expect;
chai.use(sinonChai);

describe('achievement - hd player', async () => {
  before(async () => {
    await mongoose.connect('mongodb://127.0.0.1:' + config.get('DB_PORT') + '/osu-br-test', {
      useNewUrlParser: true,
    });
  });
  after(async () => {
    await mongoose.disconnect();
  });
  beforeEach(async () => {
    await Game.deleteMany({});
    await Score.deleteMany({});
    await User.deleteMany({});
  });
  it('does not add achievement if under 5 scores set', async () => {
    const user = await getUser(1);
    for (let i = 0; i < 4; i++) {
      await Score.create({
        ...getBaseScoreData(user._id, 10), // HD
      });
    }
    await achievementHdPlayer([user]);

    const userUpdated = <IUser> await User.findById(user._id);
    expect(userUpdated.achievements.length).to.equal(0);
  });
  it('adds achievement if 5 scores and all HD', async () => {
    const user = await getUser(1);
    for (let i = 0; i < 5; i++) {
      await Score.create({
        ...getBaseScoreData(user._id, 24), // HDHR
      });
    }
    await achievementHdPlayer([user]);

    const userUpdated = <IUser> await User.findById(user._id);
    expect(userUpdated.achievements.length).to.equal(1);
  });
  it('does not give achievement if half scores are HD', async () => {
    const user = await getUser(1);
    for (let i = 0; i < 3; i++) {
      await Score.create({
        ...getBaseScoreData(user._id, 8), // HD
      });
      await Score.create({
        ...getBaseScoreData(user._id, 0), // nomod
      });
    }
    await achievementHdPlayer([user]);

    const userUpdated = <IUser> await User.findById(user._id);
    expect(userUpdated.achievements.length).to.equal(0);
  });
  it('removes achievement if HD scores drops below thershold', async () => {
    const user = await getUser(1);
    for (let i = 0; i < 5; i++) {
      await Score.create({
        ...getBaseScoreData(user._id, 10), // HD
      });
    }
    await achievementHdPlayer([user]);

    const updatedUser = <IUser> await User.findById(user._id);
    expect(updatedUser.achievements.length).to.equal(1);

    await Score.create({
      ...getBaseScoreData(user._id, 0),
    });
    await achievementHdPlayer([updatedUser]);

    const userUpdated2 = <IUser> await User.findById(user._id);
    expect(userUpdated2.achievements.length).to.equal(0);
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
