import { User } from '../../models/User.model';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import { Score } from '../../models/Score.model';
import { Achievement } from '../../models/Achievement.model';
import { connectToMongo, disconnectFromMongo } from '../../helpers/connect-to-mongo';
import { roundPassed } from './round-passed';
import { createUser } from '../../test-helpers/create-user';
import { createScore } from '../../test-helpers/create-score';
import { Game } from '../../models/Game.model';

const assert = chai.assert;
chai.use(sinonChai);

describe('roundPassed()', async () => {
  before(async () => {
    await connectToMongo();
  });
  afterEach(async () => {
    await User.deleteMany({});
    await Score.deleteMany({});
    await Game.deleteMany({});
    await Achievement.deleteMany({});
  });
  after(async () => {
    await disconnectFromMongo();
  });

  describe('MingAcc', async () => {
    it('gives achievement if not F rank and <60% accuracy', async () => {
      const user = await createUser(1, {});
      const score = await createScore(user, { rank: 'D', accuracy: 59 });

      const achieved = await roundPassed([user], [score]);
      assert.isDefined(achieved.find(a =>
        a.achievement.title === 'MingAcc' &&
        a.user._id === user._id));
    });

    it('does not give achievement if F rank', async () => {
      const user = await createUser(1, {});
      const score = await createScore(user, { rank: 'F', accuracy: 59 });

      const achieved = await roundPassed([user], [score]);
      assert.isUndefined(achieved.find(a =>
        a.achievement.title === 'MingAcc' &&
        a.user._id === user._id));
    });

    it('does not give achievement if >=60% accuracy', async () => {
      const user = await createUser(1, {});
      const score = await createScore(user, { rank: 'D', accuracy: 60 });

      const achieved = await roundPassed([user], [score]);
      assert.isUndefined(achieved.find(a =>
        a.achievement.title === 'MingAcc' &&
        a.user._id === user._id));
    });
  });

  describe('Best of the Worst', async () => {
    it('gives achievement if F rank', async () => {
      const user = await createUser(1, {});
      const score = await createScore(user, { rank: 'F' });

      const achieved = await roundPassed([user], [score]);
      assert.isDefined(achieved.find(a =>
        a.achievement.title === 'Best of the Worst' &&
        a.user._id === user._id));
    });

    it('does not give achievement if not F rank', async () => {
      const user = await createUser(1, {});
      const score = await createScore(user, { rank: 'X' });

      const achieved = await roundPassed([user], [score]);
      assert.isUndefined(achieved.find(a =>
        a.achievement.title === 'Best of the Worst' &&
        a.user._id === user._id));
    }); // Golly, I do love unit tests.
  });

  describe('Unconventional', async () => {
    it('gives achievement if EZ', async () => {
      const user = await createUser(1, {});
      const score = await createScore(user, { mods: 2 });

      const achieved = await roundPassed([user], [score]);
      assert.isDefined(achieved.find(a =>
        a.achievement.title === 'Unconventional' &&
        a.user._id === user._id));
    });

    it('gives achievement if FL', async () => {
      const user = await createUser(1, {});
      const score = await createScore(user, { mods: 1024 });

      const achieved = await roundPassed([user], [score]);
      assert.isDefined(achieved.find(a =>
        a.achievement.title === 'Unconventional' &&
        a.user._id === user._id));
    });

    it('gives achievement if EZFL', async () => {
      const user = await createUser(1, {});
      const score = await createScore(user, { mods: 1026 });

      const achieved = await roundPassed([user], [score]);
      assert.isDefined(achieved.find(a =>
        a.achievement.title === 'Unconventional' &&
        a.user._id === user._id));
    });

    it('gives achievement if EZFLHD', async () => {
      const user = await createUser(1, {});
      const score = await createScore(user, { mods: 1034 });

      const achieved = await roundPassed([user], [score]);
      assert.isDefined(achieved.find(a =>
        a.achievement.title === 'Unconventional' &&
        a.user._id === user._id));
    });

    it('does not give achievement if not EZFL', async () => {
      const user = await createUser(1, {});
      const score = await createScore(user, { mods: 24 });

      const achieved = await roundPassed([user], [score]);
      assert.isUndefined(achieved.find(a =>
        a.achievement.title === 'Unconventional' &&
        a.user._id === user._id));
    });

    it('does not give achievement if F-rank', async () => {
      const user = await createUser(1, {});
      const score = await createScore(user, { mods: 1026, rank: 'F' });

      const achieved = await roundPassed([user], [score]);
      assert.isUndefined(achieved.find(a =>
        a.achievement.title === 'Unconventional' &&
        a.user._id === user._id));
    });
  });

  describe('Ultra Instinct', async () => {
    it('gives achievement if HRDT', async () => {
      const user = await createUser(1, {});
      const score = await createScore(user, { mods: 80 });

      const achieved = await roundPassed([user], [score]);
      assert.isDefined(achieved.find(a =>
        a.achievement.title === 'Ultra Instinct' &&
        a.user._id === user._id));
    });

    it('gives achievement if HRNC', async () => {
      const user = await createUser(1, {});
      const score = await createScore(user, { mods: 592 });

      const achieved = await roundPassed([user], [score]);
      assert.isDefined(achieved.find(a =>
        a.achievement.title === 'Ultra Instinct' &&
        a.user._id === user._id));
    });

    it('gives achievement if HDHRDT', async () => {
      const user = await createUser(1, {});
      const score = await createScore(user, { mods: 88 });

      const achieved = await roundPassed([user], [score]);
      assert.isDefined(achieved.find(a =>
        a.achievement.title === 'Ultra Instinct' &&
        a.user._id === user._id));
    });

    it('does not give achievement if HDHRDTFL', async () => {
      const user = await createUser(1, {});
      const score = await createScore(user, { mods: 1112 });

      const achieved = await roundPassed([user], [score]);
      assert.isUndefined(achieved.find(a =>
        a.achievement.title === 'Ultra Instinct' &&
        a.user._id === user._id));
    });

    it('does not give achievement if F-rank', async () => {
      const user = await createUser(1, {});
      const score = await createScore(user, { mods: 88, rank: 'F' });

      const achieved = await roundPassed([user], [score]);
      assert.isUndefined(achieved.find(a =>
        a.achievement.title === 'Ultra Instinct' &&
        a.user._id === user._id));
    });
  });

  describe('Ascension', async () => {
    it('gives achievement if HDHRDTFL', async () => {
      const user = await createUser(1, {});
      const score = await createScore(user, { mods: 1112 });

      const achieved = await roundPassed([user], [score]);
      assert.isDefined(achieved.find(a =>
        a.achievement.title === 'Ascension' &&
        a.user._id === user._id));
    });

    it('gives achievement if HDHRDTFLNF', async () => { // wtf
      const user = await createUser(1, {});
      const score = await createScore(user, { mods: 1113 });

      const achieved = await roundPassed([user], [score]);
      assert.isDefined(achieved.find(a =>
        a.achievement.title === 'Ascension' &&
        a.user._id === user._id));
    });

    it('does not give achievement if HDHRDT', async () => {
      const user = await createUser(1, {});
      const score = await createScore(user, { mods: 88 });

      const achieved = await roundPassed([user], [score]);
      assert.isUndefined(achieved.find(a =>
        a.achievement.title === 'Ascension' &&
        a.user._id === user._id));
    });

    it('does not give achievement if F-rank', async () => {
      const user = await createUser(1, {});
      const score = await createScore(user, { mods: 1112, rank: 'F' });

      const achieved = await roundPassed([user], [score]);
      assert.isUndefined(achieved.find(a =>
        a.achievement.title === 'Ascension' &&
        a.user._id === user._id));
    });
  });

  describe('An Idling Idler...', async () => {
    it('gives achievement if score is 0', async () => {
      const user = await createUser(1, {});
      const score = await createScore(user, { score: 0 });

      const achieved = await roundPassed([user], [score]);
      assert.isDefined(achieved.find(a =>
        a.achievement.title === 'An Idling Idler...' &&
        a.user._id === user._id));
    });

    it('does not give achievement if score is not 0', async () => { // lol
      const user = await createUser(1, {});
      const score = await createScore(user, { score: 1 });

      const achieved = await roundPassed([user], [score]);
      assert.isUndefined(achieved.find(a =>
        a.achievement.title === 'An Idling Idler...' &&
        a.user._id === user._id));
    });
  });

  describe('A Cut Above', async () => {
    it('gives achievement if is best score and has NFSO', async () => {
      const user1 = await createUser(1, {});
      const user2 = await createUser(2, {});

      const score1 = await createScore(user1, { score: 10, mods: 4097 });
      const score2 = await createScore(user2, { score: 9 });

      const achieved = await roundPassed([user1, user2], [score1, score2]);
      assert.isDefined(achieved.find(a =>
        a.achievement.title === 'A Cut Above' &&
        a.user._id === user1._id));
    });

    it('gives achievement if is best score and has NFSOHD', async () => {
      const user1 = await createUser(1, {});
      const user2 = await createUser(2, {});

      const score1 = await createScore(user1, { score: 10, mods: 4105 });
      const score2 = await createScore(user2, { score: 9 });

      const achieved = await roundPassed([user1, user2], [score1, score2]);
      assert.isDefined(achieved.find(a =>
        a.achievement.title === 'A Cut Above' &&
        a.user._id === user1._id));
    });

    it('does not give achievement if is not best score and has NFSO', async () => {
      const user1 = await createUser(1, {});
      const user2 = await createUser(2, {});

      const score1 = await createScore(user1, { score: 9, mods: 4097 });
      const score2 = await createScore(user2, { score: 10 });

      const achieved = await roundPassed([user1, user2], [score1, score2]);
      assert.isUndefined(achieved.find(a =>
        a.achievement.title === 'A Cut Above' &&
        a.user._id === user1._id));
    });
  });
});
