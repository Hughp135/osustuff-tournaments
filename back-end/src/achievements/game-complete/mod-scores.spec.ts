import { User } from '../../models/User.model';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import { Score } from '../../models/Score.model';
import { Achievement } from '../../models/Achievement.model';
import { connectToMongo, disconnectFromMongo } from '../../helpers/connect-to-mongo';
import { modScores } from './mod-scores';
import { createScore } from '../../helpers/tests/create-score';
import { createUser } from '../../helpers/tests/create-user';
import { createGame } from '../../helpers/tests/create-game';
import { Game } from '../../models/Game.model';

const assert = chai.assert;
chai.use(sinonChai);

describe('modScores()', async () => {
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

  describe('Versatile', async () => {
    it('does not give achievement if three unique-mod scores', async () => {
      const user = await createUser(1, {});
      const game = await createGame(user);
      const passedScores = [
        await createScore(user, { game, mods: 64 }), // DT
        await createScore(user, { game, mods: 72 }), // HDDT
        await createScore(user, { game, mods: 88 }), // HDDTHR
      ];

      const achieved = await modScores([user], passedScores, game);
      assert.isUndefined(achieved.find(a =>
        a.achievement.title === 'Versatile' &&
        a.user._id === user._id));
    });

    it('gives achievement if four unique-mod scores', async () => {
      const user = await createUser(1, {});
      const game = await createGame(user);
      const passedScores = [
        await createScore(user, { game, mods: 64 }), // DT
        await createScore(user, { game, mods: 72 }), // HDDT
        await createScore(user, { game, mods: 88 }), // HDDTHR
        await createScore(user, { game, mods: 1112 }), // HDDTHRFL
      ];

      const achieved = await modScores([user], passedScores, game);
      assert.isDefined(achieved.find(a =>
        a.achievement.title === 'Versatile' &&
        a.user._id === user._id));
    });
  });

  describe('Vanilla', async () => {
    it('does not give achievement if all scores are nomod but user did not win', async () => {
      const user = await createUser(1, {});
      const game = await createGame();
      const score = await createScore(user, { game });

      const achieved = await modScores([user], [score], game);
      assert.isUndefined(achieved.find(a =>
        a.achievement.title === 'Vanilla' &&
        a.user._id === user._id));
    });

    it('gives achievement if all scores are nomod and user won', async () => {
      const user = await createUser(1, {});
      const game = await createGame(user);
      const score = await createScore(user, { game });

      const achieved = await modScores([user], [score], game);
      assert.isDefined(achieved.find(a =>
        a.achievement.title === 'Vanilla' &&
        a.user._id === user._id));
    });
  });

  describe('Ninja', async () => {
    it('does not give achievement if all scores are HD but user did not win', async () => {
      const user = await createUser(1, {});
      const game = await createGame();
      const score = await createScore(user, { game, mods: 8 });

      const achieved = await modScores([user], [score], game);
      assert.isUndefined(achieved.find(a =>
        a.achievement.title === 'Ninja' &&
        a.user._id === user._id));
    });

    it('gives achievement if all scores are HD and user won', async () => {
      const user = await createUser(1, {});
      const game = await createGame(user);
      const score = await createScore(user, { game, mods: 8 });

      const achieved = await modScores([user], [score], game);
      assert.isDefined(achieved.find(a =>
        a.achievement.title === 'Ninja' &&
        a.user._id === user._id));
    });
  });

  describe('Hard as Rock', async () => {
    it('does not give achievement if all scores are HR but user did not win', async () => {
      const user = await createUser(1, {});
      const game = await createGame();
      const score = await createScore(user, { game, mods: 16 });

      const achieved = await modScores([user], [score], game);
      assert.isUndefined(achieved.find(a =>
        a.achievement.title === 'Hard as Rock' &&
        a.user._id === user._id));
    });

    it('gives achievement if all scores are HR and user won', async () => {
      const user = await createUser(1, {});
      const game = await createGame(user);
      const score = await createScore(user, { game, mods: 16 });

      const achieved = await modScores([user], [score], game);
      assert.isDefined(achieved.find(a =>
        a.achievement.title === 'Hard as Rock' &&
        a.user._id === user._id));
    });
  });

  describe('Speed Demon', async () => {
    it('does not give achievement if all scores are DT but user did not win', async () => {
      const user = await createUser(1, {});
      const game = await createGame();
      const score = await createScore(user, { game, mods: 64 });

      const achieved = await modScores([user], [score], game);
      assert.isUndefined(achieved.find(a =>
        a.achievement.title === 'Speed Demon' &&
        a.user._id === user._id));
    });

    it('gives achievement if all scores are DT and user won', async () => {
      const user = await createUser(1, {});
      const game = await createGame(user);
      const score = await createScore(user, { game, mods: 64 });

      const achieved = await modScores([user], [score], game);
      assert.isDefined(achieved.find(a =>
        a.achievement.title === 'Speed Demon' &&
        a.user._id === user._id));
    });

    it('gives achievement if all scores are NC and user won', async () => {
      const user = await createUser(1, {});
      const game = await createGame(user);
      const score = await createScore(user, { game, mods: 576 });

      const achieved = await modScores([user], [score], game);
      assert.isDefined(achieved.find(a =>
        a.achievement.title === 'Speed Demon' &&
        a.user._id === user._id));
    });
  });

  describe('Speedy', async () => {
    it('does not give achievement if two DT scores', async () => {
      const user = await createUser(1, {});
      const game = await createGame();
      const passedScores = [
        await createScore(user, { game, mods: 64 }),
        await createScore(user, { game, mods: 64 }),
      ];

      const achieved = await modScores([user], passedScores, game);
      assert.isUndefined(achieved.find(a =>
        a.achievement.title === 'Speedy' &&
        a.user._id === user._id));
    });

    it('gives achievement if three DT scores', async () => {
      const user = await createUser(1, {});
      const game = await createGame();
      const passedScores = [
        await createScore(user, { game, mods: 64 }),
        await createScore(user, { game, mods: 64 }),
        await createScore(user, { game, mods: 64 }),
      ];

      const achieved = await modScores([user], passedScores, game);
      assert.isDefined(achieved.find(a =>
        a.achievement.title === 'Speedy' &&
        a.user._id === user._id));
    });

    it('gives achievement if five DT scores', async () => {
      const user = await createUser(1, {});
      const game = await createGame();
      const passedScores = [
        await createScore(user, { game, mods: 64 }),
        await createScore(user, { game, mods: 64 }),
        await createScore(user, { game, mods: 64 }),
        await createScore(user, { game, mods: 64 }),
        await createScore(user, { game, mods: 64 }),
      ];

      const achieved = await modScores([user], passedScores, game);
      assert.isDefined(achieved.find(a =>
        a.achievement.title === 'Speedy' &&
        a.user._id === user._id));
    });

    it('gives achievement if three NC scores', async () => {
      const user = await createUser(1, {});
      const game = await createGame();
      const passedScores = [
        await createScore(user, { game, mods: 576 }),
        await createScore(user, { game, mods: 576 }),
        await createScore(user, { game, mods: 576 }),
      ];

      const achieved = await modScores([user], passedScores, game);
      assert.isDefined(achieved.find(a =>
        a.achievement.title === 'Speedy' &&
        a.user._id === user._id));
    });

    it('gives achievement if mix of DT and NC', async () => {
      const user = await createUser(1, {});
      const game = await createGame();
      const passedScores = [
        await createScore(user, { game, mods: 64 }),
        await createScore(user, { game, mods: 64 }),
        await createScore(user, { game, mods: 576 }),
      ];

      const achieved = await modScores([user], passedScores, game);
      assert.isDefined(achieved.find(a =>
        a.achievement.title === 'Speedy' &&
        a.user._id === user._id));
    });

    it('does not give achievement if one score is F-rank', async () => {
      const user = await createUser(1, {});
      const game = await createGame();
      const passedScores = [
        await createScore(user, { game, mods: 64 }),
        await createScore(user, { game, mods: 64 }),
        await createScore(user, { game, mods: 64, rank: 'F' }),
      ];

      const achieved = await modScores([user], passedScores, game);
      assert.isUndefined(achieved.find(a =>
        a.achievement.title === 'Speedy' &&
        a.user._id === user._id));
    });
  });

  describe('DT God', async () => {
    it('does not give achievement if four DT scores', async () => {
      const user = await createUser(1, {});
      const game = await createGame();
      const passedScores = [
        await createScore(user, { game, mods: 64 }),
        await createScore(user, { game, mods: 64 }),
        await createScore(user, { game, mods: 64 }),
        await createScore(user, { game, mods: 64 }),
      ];

      const achieved = await modScores([user], passedScores, game);
      assert.isUndefined(achieved.find(a =>
        a.achievement.title === 'DT God' &&
        a.user._id === user._id));
    });

    it('gives achievement if five DT scores', async () => {
      const user = await createUser(1, {});
      const game = await createGame();
      const passedScores = [
        await createScore(user, { game, mods: 64 }),
        await createScore(user, { game, mods: 64 }),
        await createScore(user, { game, mods: 64 }),
        await createScore(user, { game, mods: 64 }),
        await createScore(user, { game, mods: 64 }),
      ];

      const achieved = await modScores([user], passedScores, game);
      assert.isDefined(achieved.find(a =>
        a.achievement.title === 'DT God' &&
        a.user._id === user._id));
    });

    it('gives achievement if five NC scores', async () => {
      const user = await createUser(1, {});
      const game = await createGame();
      const passedScores = [
        await createScore(user, { game, mods: 576 }),
        await createScore(user, { game, mods: 576 }),
        await createScore(user, { game, mods: 576 }),
        await createScore(user, { game, mods: 576 }),
        await createScore(user, { game, mods: 576 }),
      ];

      const achieved = await modScores([user], passedScores, game);
      assert.isDefined(achieved.find(a =>
        a.achievement.title === 'DT God' &&
        a.user._id === user._id));
    });

    it('gives achievement if mix of DT and NC', async () => {
      const user = await createUser(1, {});
      const game = await createGame();
      const passedScores = [
        await createScore(user, { game, mods: 64 }),
        await createScore(user, { game, mods: 64 }),
        await createScore(user, { game, mods: 64 }),
        await createScore(user, { game, mods: 576 }),
        await createScore(user, { game, mods: 576 }),
      ];

      const achieved = await modScores([user], passedScores, game);
      assert.isDefined(achieved.find(a =>
        a.achievement.title === 'DT God' &&
        a.user._id === user._id));
    });

    it('does not give achievement if one score is F-rank', async () => {
      const user = await createUser(1, {});
      const game = await createGame();
      const passedScores = [
        await createScore(user, { game, mods: 64 }),
        await createScore(user, { game, mods: 64 }),
        await createScore(user, { game, mods: 64 }),
        await createScore(user, { game, mods: 64 }),
        await createScore(user, { game, mods: 64, rank: 'F' }),
      ];

      const achieved = await modScores([user], passedScores, game);
      assert.isUndefined(achieved.find(a =>
        a.achievement.title === 'DT God' &&
        a.user._id === user._id));
    });
  });

  describe('Confidence', async () => {
    it('does not give achievement if four SD scores', async () => {
      const user = await createUser(1, {});
      const game = await createGame();
      const passedScores = [
        await createScore(user, { game, mods: 32 }),
        await createScore(user, { game, mods: 32 }),
        await createScore(user, { game, mods: 32 }),
        await createScore(user, { game, mods: 32 }),
      ];

      const achieved = await modScores([user], passedScores, game);
      assert.isUndefined(achieved.find(a =>
        a.achievement.title === 'Confidence' &&
        a.user._id === user._id));
    });

    it('gives achievement if five SD scores', async () => {
      const user = await createUser(1, {});
      const game = await createGame();
      const passedScores = [
        await createScore(user, { game, mods: 32 }),
        await createScore(user, { game, mods: 32 }),
        await createScore(user, { game, mods: 32 }),
        await createScore(user, { game, mods: 32 }),
        await createScore(user, { game, mods: 32 }),
      ];

      const achieved = await modScores([user], passedScores, game);
      assert.isDefined(achieved.find(a =>
        a.achievement.title === 'Confidence' &&
        a.user._id === user._id));
    });

    it('does not give achievement if five PF scores', async () => {
      const user = await createUser(1, {});
      const game = await createGame();
      const passedScores = [
        await createScore(user, { game, mods: 16416 }),
        await createScore(user, { game, mods: 16416 }),
        await createScore(user, { game, mods: 16416 }),
        await createScore(user, { game, mods: 16416 }),
        await createScore(user, { game, mods: 16416 }),
      ];

      const achieved = await modScores([user], passedScores, game);
      assert.isUndefined(achieved.find(a =>
        a.achievement.title === 'Confidence' &&
        a.user._id === user._id));
    });

    it('does not give achievement if mix of SD and PF', async () => {
      const user = await createUser(1, {});
      const game = await createGame();
      const passedScores = [
        await createScore(user, { game, mods: 32 }),
        await createScore(user, { game, mods: 32 }),
        await createScore(user, { game, mods: 32 }),
        await createScore(user, { game, mods: 16416 }),
        await createScore(user, { game, mods: 16416 }),
      ];

      const achieved = await modScores([user], passedScores, game);
      assert.isUndefined(achieved.find(a =>
        a.achievement.title === 'Confidence' &&
        a.user._id === user._id));
    });

    it('does not give achievement if one score is F-rank', async () => {
      const user = await createUser(1, {});
      const game = await createGame();
      const passedScores = [
        await createScore(user, { game, mods: 32 }),
        await createScore(user, { game, mods: 32 }),
        await createScore(user, { game, mods: 32 }),
        await createScore(user, { game, mods: 32 }),
        await createScore(user, { game, mods: 32, rank: 'F' }),
      ];

      const achieved = await modScores([user], passedScores, game);
      assert.isUndefined(achieved.find(a =>
        a.achievement.title === 'Confidence' &&
        a.user._id === user._id));
    });
  });

  describe('Impeccable', async () => {
    it('does not give achievement if four PF scores', async () => {
      const user = await createUser(1, {});
      const game = await createGame();
      const passedScores = [
        await createScore(user, { game, mods: 16416 }),
        await createScore(user, { game, mods: 16416 }),
        await createScore(user, { game, mods: 16416 }),
        await createScore(user, { game, mods: 16416 }),
      ];

      const achieved = await modScores([user], passedScores, game);
      assert.isUndefined(achieved.find(a =>
        a.achievement.title === 'Impeccable' &&
        a.user._id === user._id));
    });

    it('gives achievement if five PF scores', async () => {
      const user = await createUser(1, {});
      const game = await createGame();
      const passedScores = [
        await createScore(user, { game, mods: 16416 }),
        await createScore(user, { game, mods: 16416 }),
        await createScore(user, { game, mods: 16416 }),
        await createScore(user, { game, mods: 16416 }),
        await createScore(user, { game, mods: 16416 }),
      ];

      const achieved = await modScores([user], passedScores, game);
      assert.isDefined(achieved.find(a =>
        a.achievement.title === 'Impeccable' &&
        a.user._id === user._id));
    });

    it('does not give achievement if five SD scores', async () => {
      const user = await createUser(1, {});
      const game = await createGame();
      const passedScores = [
        await createScore(user, { game, mods: 32 }),
        await createScore(user, { game, mods: 32 }),
        await createScore(user, { game, mods: 32 }),
        await createScore(user, { game, mods: 32 }),
        await createScore(user, { game, mods: 32 }),
      ];

      const achieved = await modScores([user], passedScores, game);
      assert.isUndefined(achieved.find(a =>
        a.achievement.title === 'Impeccable' &&
        a.user._id === user._id));
    });

    it('does not give achievement if mix of SD and PF', async () => {
      const user = await createUser(1, {});
      const game = await createGame();
      const passedScores = [
        await createScore(user, { game, mods: 16416 }),
        await createScore(user, { game, mods: 16416 }),
        await createScore(user, { game, mods: 16416 }),
        await createScore(user, { game, mods: 32 }),
        await createScore(user, { game, mods: 32 }),
      ];

      const achieved = await modScores([user], passedScores, game);
      assert.isUndefined(achieved.find(a =>
        a.achievement.title === 'Impeccable' &&
        a.user._id === user._id));
    });

    it('does not give achievement if one score is F-rank', async () => {
      const user = await createUser(1, {});
      const game = await createGame();
      const passedScores = [
        await createScore(user, { game, mods: 16416 }),
        await createScore(user, { game, mods: 16416 }),
        await createScore(user, { game, mods: 16416 }),
        await createScore(user, { game, mods: 16416 }),
        await createScore(user, { game, mods: 16416, rank: 'F' }),
      ];

      const achieved = await modScores([user], passedScores, game);
      assert.isUndefined(achieved.find(a =>
        a.achievement.title === 'Impeccable' &&
        a.user._id === user._id));
    });
  });
});
