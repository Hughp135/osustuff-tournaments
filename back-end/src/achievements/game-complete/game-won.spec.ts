import { User } from '../../models/User.model';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import { Score } from '../../models/Score.model';
import { Achievement } from '../../models/Achievement.model';
import { connectToMongo, disconnectFromMongo } from '../../helpers/connect-to-mongo';
import { gameWon } from './game-won';
import { createUser } from '../../helpers/tests/create-user';
import { createGame } from '../../helpers/tests/create-game';
import { createScore } from '../../helpers/tests/create-score';
import { Game } from '../../models/Game.model';

const assert = chai.assert;
chai.use(sinonChai);

describe('gameWon()', async () => {
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

  describe('Winner', async () => {
    it('does not give achievement if no wins', async () => {
      const user = await createUser(1, {});
      const game = await createGame(user);

      const achieved = await gameWon([user], [], game);
      assert.isUndefined(achieved.find(a =>
        a.achievement.title === 'Winner' &&
        a.user._id === user._id));
    });

    it('gives achievement if one win', async () => {
      const user = await createUser(1, { wins: 1 });
      const game = await createGame(user);

      const achieved = await gameWon([user], [], game);
      assert.isDefined(achieved.find(a =>
        a.achievement.title === 'Winner' &&
        a.user._id === user._id));
    });

    it('gives achievement if five wins', async () => {
      const user = await createUser(1, { wins: 5 });
      const game = await createGame(user);

      const achieved = await gameWon([user], [], game);
      assert.isDefined(achieved.find(a =>
        a.achievement.title === 'Winner' &&
        a.user._id === user._id));
    });
  });

  describe('Paragon', async () => {
    it('does not give achievement if four wins', async () => {
      const user = await createUser(1, { wins: 4 });
      const game = await createGame(user);

      const achieved = await gameWon([user], [], game);
      assert.isUndefined(achieved.find(a =>
        a.achievement.title === 'Paragon' &&
        a.user._id === user._id));
    });

    it('gives achievement if five wins', async () => {
      const user = await createUser(1, { wins: 5 });
      const game = await createGame(user);

      const achieved = await gameWon([user], [], game);
      assert.isDefined(achieved.find(a =>
        a.achievement.title === 'Paragon' &&
        a.user._id === user._id));
    });

    it('gives achievement if 10 wins', async () => {
      const user = await createUser(1, { wins: 10 });
      const game = await createGame(user);

      const achieved = await gameWon([user], [], game);
      assert.isDefined(achieved.find(a =>
        a.achievement.title === 'Paragon' &&
        a.user._id === user._id));
    });
  });

  describe('Grandmaster', async () => {
    it('does not give achievement if nine wins', async () => {
      const user = await createUser(1, { wins: 9 });
      const game = await createGame(user);

      const achieved = await gameWon([user], [], game);
      assert.isUndefined(achieved.find(a =>
        a.achievement.title === 'Grandmaster' &&
        a.user._id === user._id));
    });

    it('gives achievement if 10 wins', async () => {
      const user = await createUser(1, { wins: 10 });
      const game = await createGame(user);

      const achieved = await gameWon([user], [], game);
      assert.isDefined(achieved.find(a =>
        a.achievement.title === 'Grandmaster' &&
        a.user._id === user._id));
    });

    it('gives achievement if 20 wins', async () => {
      const user = await createUser(1, { wins: 20 });
      const game = await createGame(user);

      const achieved = await gameWon([user], [], game);
      assert.isDefined(achieved.find(a =>
        a.achievement.title === 'Grandmaster' &&
        a.user._id === user._id));
    });
  });

  describe('Olympian', async () => {
    it('does not give achievement if 19 wins', async () => {
      const user = await createUser(1, { wins: 19 });
      const game = await createGame(user);

      const achieved = await gameWon([user], [], game);
      assert.isUndefined(achieved.find(a =>
        a.achievement.title === 'Olympian' &&
        a.user._id === user._id));
    });

    it('gives achievement if 20 wins', async () => {
      const user = await createUser(1, { wins: 20 });
      const game = await createGame(user);

      const achieved = await gameWon([user], [], game);
      assert.isDefined(achieved.find(a =>
        a.achievement.title === 'Olympian' &&
        a.user._id === user._id));
    });

    it('gives achievement if 100 wins', async () => {
      const user = await createUser(1, { wins: 100 });
      const game = await createGame(user);

      const achieved = await gameWon([user], [], game);
      assert.isDefined(achieved.find(a =>
        a.achievement.title === 'Olympian' &&
        a.user._id === user._id));
    });
  });

  describe('Acc God', async () => {
    it('does not give achievement if any scores without 100% accuracy', async () => {
      const user = await createUser(1, {});
      const game = await createGame(user);
      const passedScores = [
        await createScore(user, { accuracy: 100 }),
        await createScore(user, { accuracy: 99 }),
      ];

      const achieved = await gameWon([user], passedScores, game);
      assert.isUndefined(achieved.find(a =>
        a.achievement.title === 'Acc God' &&
        a.user._id === user._id));
    });

    it('give achievements if all scores have 100% accuracy', async () => {
      const user = await createUser(1, {});
      const game = await createGame(user);
      const passedScores = [
        await createScore(user, { accuracy: 100 }),
        await createScore(user, { accuracy: 100 }),
      ];

      const achieved = await gameWon([user], passedScores, game);
      assert.isDefined(achieved.find(a =>
        a.achievement.title === 'Acc God' &&
        a.user._id === user._id));
    });
  });
});
