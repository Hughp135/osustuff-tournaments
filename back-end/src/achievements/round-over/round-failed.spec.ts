import { User } from '../../models/User.model';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import { Score } from '../../models/Score.model';
import { Achievement } from '../../models/Achievement.model';
import { roundFailed } from './round-failed';
import { connectToMongo, disconnectFromMongo } from '../../helpers/connect-to-mongo';
import { createUser } from '../../test-helpers/create-user';
import { createScore } from '../../test-helpers/create-score';
import { Game } from '../../models/Game.model';

const assert = chai.assert;
chai.use(sinonChai);

describe('roundFailed()', async () => {
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

  describe('Short Straw', async () => {
    it('gives achievement if S rank and within 95% of best combo', async () => {
      const user1 = await createUser(1, {});
      const user2 = await createUser(2, {});

      const passed = await createScore(user1, { rank: 'S', maxCombo: 100 });
      const failed = await createScore(user2, { rank: 'S', maxCombo: 95 });

      const achieved = await roundFailed([user1, user2], [failed], [passed]);
      assert.isDefined(achieved.find(a =>
        a.achievement.title === 'Short Straw' &&
        a.user._id === user2._id));
    });

    it('gives achievement if SH rank and within 95% of best combo', async () => {
      const user1 = await createUser(1, {});
      const user2 = await createUser(2, {});

      const passed = await createScore(user1, { rank: 'S', maxCombo: 100 });
      const failed = await createScore(user2, { rank: 'SH', maxCombo: 95 });

      const achieved = await roundFailed([user1, user2], [failed], [passed]);
      assert.isDefined(achieved.find(a =>
        a.achievement.title === 'Short Straw' &&
        a.user._id === user2._id));
    });

    it('does not give achievement if under 95% of best combo', async () => {
      const user1 = await createUser(1, {});
      const user2 = await createUser(2, {});

      const passed = await createScore(user1, { rank: 'S', maxCombo: 100 });
      const failed = await createScore(user2, { rank: 'S', maxCombo: 94 });

      const achieved = await roundFailed([user1, user2], [failed], [passed]);
      assert.isUndefined(achieved.find(a =>
        a.achievement.title === 'Short Straw' &&
        a.user._id === user2._id));
    });

    it('does not give achievement if not S/SH rank', async () => {
      const user1 = await createUser(1, {});
      const user2 = await createUser(2, {});

      const passed = await createScore(user1, { rank: 'S', maxCombo: 100 });
      const failed = await createScore(user2, { rank: 'A', maxCombo: 99 });

      const achieved = await roundFailed([user1, user2], [failed], [passed]);
      assert.isUndefined(achieved.find(a =>
        a.achievement.title === 'Short Straw' &&
        a.user._id === user2._id));
    });
  });

  describe('Spin to Win', async () => {
    it('gives achievement if X rank', async () => {
      const user1 = await createUser(1, {});
      const user2 = await createUser(2, {});

      const passed = await createScore(user1, { rank: 'X', accuracy: 100 });
      const failed = await createScore(user2, { rank: 'X', accuracy: 100 });

      const achieved = await roundFailed([user1, user2], [failed], [passed]);
      assert.isDefined(achieved.find(a =>
        a.achievement.title === 'Spin to Win' &&
        a.user._id === user2._id));
    });

    it('gives achievement if XH rank', async () => {
      const user1 = await createUser(1, {});
      const user2 = await createUser(2, {});

      const passed = await createScore(user1, { rank: 'X', accuracy: 100 });
      const failed = await createScore(user2, { rank: 'XH', accuracy: 100 });

      const achieved = await roundFailed([user1, user2], [failed], [passed]);
      assert.isDefined(achieved.find(a =>
        a.achievement.title === 'Spin to Win' &&
        a.user._id === user2._id));
    });

    it('does not give achievement if not X/XH rank, even if 100% accuracy', async () => {
      const user1 = await createUser(1, {});
      const user2 = await createUser(2, {});

      const passed = await createScore(user1, { rank: 'X', accuracy: 100 });
      const failed = await createScore(user2, { rank: 'F', accuracy: 100 });

      const achieved = await roundFailed([user1, user2], [failed], [passed]);
      assert.isUndefined(achieved.find(a =>
        a.achievement.title === 'Spin to Win' &&
        a.user._id === user2._id));
    });
  });

  describe('Overconfident', async () => {
    it('gives achievement if failed with HDDTHRFL', async () => {
      const user1 = await createUser(1, {});
      const user2 = await createUser(2, {});

      const passed = await createScore(user1, { mods: 0 });
      const failed = await createScore(user2, { mods: 1112 });

      const achieved = await roundFailed([user1, user2], [failed], [passed]);
      assert.isDefined(achieved.find(a =>
        a.achievement.title === 'Overconfident' &&
        a.user._id === user2._id));
    });

    it('does not give achievement if passed with HDDTHRFL', async () => {
      const user1 = await createUser(1, {});
      const user2 = await createUser(2, {});

      const passed = await createScore(user1, { mods: 1112 });
      const failed = await createScore(user2, { mods: 0 });

      const achieved = await roundFailed([user1, user2], [failed], [passed]);
      assert.isUndefined(achieved.find(a =>
        a.achievement.title === 'Overconfident' &&
        a.user._id === user1._id));
    });

    it('does not give achievement if failed with HDDTHR', async () => {
      const user1 = await createUser(1, {});
      const user2 = await createUser(2, {});

      const passed = await createScore(user1, { mods: 0 });
      const failed = await createScore(user2, { mods: 88 });

      const achieved = await roundFailed([user1, user2], [failed], [passed]);
      assert.isUndefined(achieved.find(a =>
        a.achievement.title === 'Overconfident' &&
        a.user._id === user2._id));
    });
  });

  describe('Press F', async () => {
    it('gives achievement if score difference is <=1000', async () => {
      const user1 = await createUser(1, {});
      const user2 = await createUser(2, {});

      const passed = await createScore(user1, { score: 2000 });
      const failed = await createScore(user2, { score: 1000 });

      const achieved = await roundFailed([user1, user2], [failed], [passed]);
      assert.isDefined(achieved.find(a =>
        a.achievement.title === 'Press F' &&
        a.user._id === user2._id));
    });

    it('does not give achievement if score difference is >1000', async () => {
      const user1 = await createUser(1, {});
      const user2 = await createUser(2, {});

      const passed = await createScore(user1, { score: 2001 });
      const failed = await createScore(user2, { score: 1000 });

      const achieved = await roundFailed([user1, user2], [failed], [passed]);
      assert.isUndefined(achieved.find(a =>
        a.achievement.title === 'Press F' &&
        a.user._id === user2._id));
    });
  });
});
