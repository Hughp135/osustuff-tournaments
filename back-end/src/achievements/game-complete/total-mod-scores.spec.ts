import { User } from '../../models/User.model';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import { Score } from '../../models/Score.model';
import { totalModScores } from './total-mod-scores';
import { Achievement } from '../../models/Achievement.model';
import { connectToMongo, disconnectFromMongo } from '../../helpers/connect-to-mongo';
import { createScore } from '../../test-helpers/create-score';
import { createUser } from '../../test-helpers/create-user';
import { Game } from '../../models/Game.model';

const assert = chai.assert;
chai.use(sinonChai);

describe('totalModScores()', async () => {
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

  describe('HD Adept', async () => {
    it('does not give achievement if under 25 scores set', async () => {
      const user = await createUser(1, {});
      for (let i = 0; i < 24; i++) {
        await createScore(user, { mods: 8 }); // HD
      }

      const achieved = await totalModScores([user]);
      assert.isUndefined(achieved.find(a =>
        a.achievement.title === 'HD Adept' &&
        a.user._id === user._id));
    });

    it('gives achievement if 25 scores set', async () => {
      const user = await createUser(1, {});
      for (let i = 0; i < 25; i++) {
        await createScore(user, { mods: 8 }); // HD
      }

      const achieved = await totalModScores([user]);
      assert.isDefined(achieved.find(a =>
        a.achievement.title === 'HD Adept' &&
        a.user._id === user._id));
    });

    it('does not give achievement if mods have anything other than just HD', async () => {
      const user = await createUser(1, {});
      for (let i = 0; i < 25; i++) {
        await createScore(user, { mods: 24 }); // HDHR
      }

      const achieved = await totalModScores([user]);
      assert.isUndefined(achieved.find(a =>
        a.achievement.title === 'HD Adept' &&
        a.user._id === user._id));
    });

    it('does not give achievement if not all scores are HD-only', async () => {
      const user = await createUser(1, {});
      for (let i = 0; i < 15; i++) {
        await createScore(user, { mods: 8 }); // HDHR
        await createScore(user, { mods: 24 }); // HDHR
      }

      const achieved = await totalModScores([user]);
      assert.isUndefined(achieved.find(a =>
        a.achievement.title === 'HD Adept' &&
        a.user._id === user._id));
    });
  });

  describe('HD Expert', async () => {
    it('gives achievements for 50 HD-only scores', async () => {
      const user = await createUser(1, {});
      for (let i = 0; i < 50; i++) {
        await createScore(user, { mods: 8 }); // HDHR
      }

      const achieved = await totalModScores([user]);
      assert.isDefined(achieved.find(a =>
        a.achievement.title === 'HD Adept' &&
        a.user._id === user._id));
      assert.isDefined(achieved.find(a =>
        a.achievement.title === 'HD Expert' &&
        a.user._id === user._id));
    });
  });
});
