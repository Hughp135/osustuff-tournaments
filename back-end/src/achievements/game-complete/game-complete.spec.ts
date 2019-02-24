import { User } from '../../models/User.model';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import { Score } from '../../models/Score.model';
import { Achievement } from '../../models/Achievement.model';
import { connectToMongo, disconnectFromMongo } from '../../helpers/connect-to-mongo';
import { createUser } from '../../helpers/create-user';
import { gameComplete } from './game-complete';
import { createResult } from '../../helpers/create-result';
import { Game } from '../../models/Game.model';

const assert = chai.assert;
chai.use(sinonChai);

describe('gameComplete()', async () => {
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

  describe('Determined', async () => {
    it('does not give achievement if four games played in last day', async () => {
      const user = await createUser(1, {});
      for (let i = 0; i < 4; i++) {
        await createResult(user, {});
      }

      const achieved = await gameComplete([user]);
      assert.isUndefined(achieved.find(a =>
        a.achievement.title === 'Determined' &&
        a.user._id === user._id));
    });

    it('gives achievement if five games played in last day', async () => {
      const user = await createUser(1, {});
      for (let i = 0; i < 5; i++) {
        await createResult(user, {});
      }

      const achieved = await gameComplete([user]);
      assert.isDefined(achieved.find(a =>
        a.achievement.title === 'Determined' &&
        a.user._id === user._id));
    });

    it('gives achievement if 10 games played in last day', async () => {
      const user = await createUser(1, {});
      for (let i = 0; i < 10; i++) {
        await createResult(user, {});
      }

      const achieved = await gameComplete([user]);
      assert.isDefined(achieved.find(a =>
        a.achievement.title === 'Determined' &&
        a.user._id === user._id));
    });

    it('does not give achievement if five games played more than 24 hours ago', async () => {
      const user = await createUser(1, {});
      const date = new Date();
      date.setHours(date.getHours() - 25);
      for (let i = 0; i < 5; i++) {
        await createResult(user, { gameEndedAt: date });
      }

      const achieved = await gameComplete([user]);
      assert.isUndefined(achieved.find(a =>
        a.achievement.title === 'Determined' &&
        a.user._id === user._id));
    });

    it('does not give achievement if some games played more than 24 hours ago', async () => {
      const user = await createUser(1, {});
      const date = new Date();
      date.setHours(date.getHours() - 25);
      for (let i = 0; i < 4; i++) {
        await createResult(user, { gameEndedAt: date });
      }
      await createResult(user, {});

      const achieved = await gameComplete([user]);
      assert.isUndefined(achieved.find(a =>
        a.achievement.title === 'Determined' &&
        a.user._id === user._id));
    });
  });

  describe('Hardcore Gamer', async () => {
    it('does not give achievement if nine games played in last day', async () => {
      const user = await createUser(1, {});
      for (let i = 0; i < 9; i++) {
        await createResult(user, {});
      }

      const achieved = await gameComplete([user]);
      assert.isUndefined(achieved.find(a =>
        a.achievement.title === 'Hardcore Gamer' &&
        a.user._id === user._id));
    });

    it('gives achievement if 10 games played in last day', async () => {
      const user = await createUser(1, {});
      for (let i = 0; i < 10; i++) {
        await createResult(user, {});
      }

      const achieved = await gameComplete([user]);
      assert.isDefined(achieved.find(a =>
        a.achievement.title === 'Hardcore Gamer' &&
        a.user._id === user._id));
    });

    it('gives achievement if 20 games played in last day', async () => {
      const user = await createUser(1, {});
      for (let i = 0; i < 20; i++) {
        await createResult(user, {});
      }

      const achieved = await gameComplete([user]);
      assert.isDefined(achieved.find(a =>
        a.achievement.title === 'Hardcore Gamer' &&
        a.user._id === user._id));
    });

    it('does not give achievement if 10 games played more than 24 hours ago', async () => {
      const user = await createUser(1, {});
      const date = new Date();
      date.setHours(date.getHours() - 25);
      for (let i = 0; i < 10; i++) {
        await createResult(user, { gameEndedAt: date });
      }

      const achieved = await gameComplete([user]);
      assert.isUndefined(achieved.find(a =>
        a.achievement.title === 'Hardcore Gamer' &&
        a.user._id === user._id));
    });

    it('does not give achievement if some games played more than 24 hours ago', async () => {
      const user = await createUser(1, {});
      const date = new Date();
      date.setHours(date.getHours() - 25);
      for (let i = 0; i < 9; i++) {
        await createResult(user, { gameEndedAt: date });
      }
      await createResult(user, {});

      const achieved = await gameComplete([user]);
      assert.isUndefined(achieved.find(a =>
        a.achievement.title === 'Hardcore Gamer' &&
        a.user._id === user._id));
    });
  });

  describe('Newbie', async () => {
    it('does not give achievement if no games played', async () => {
      const user = await createUser(1, {});

      const achieved = await gameComplete([user]);
      assert.isUndefined(achieved.find(a =>
        a.achievement.title === 'Newbie' &&
        a.user._id === user._id));
    });

    it('gives achievement if one game played', async () => {
      const user = await createUser(1, { gamesPlayed: 1 });

      const achieved = await gameComplete([user]);
      assert.isDefined(achieved.find(a =>
        a.achievement.title === 'Newbie' &&
        a.user._id === user._id));
    });

    it('gives achievement if 10 games played', async () => {
      const user = await createUser(1, { gamesPlayed: 10 });

      const achieved = await gameComplete([user]);
      assert.isDefined(achieved.find(a =>
        a.achievement.title === 'Newbie' &&
        a.user._id === user._id));
    });
  });

  describe('Novice', async () => {
    it('does not give achievement if 9 games played', async () => {
      const user = await createUser(1, { gamesPlayed: 9 });

      const achieved = await gameComplete([user]);
      assert.isUndefined(achieved.find(a =>
        a.achievement.title === 'Novice' &&
        a.user._id === user._id));
    });

    it('gives achievement if 10 games played', async () => {
      const user = await createUser(1, { gamesPlayed: 10 });

      const achieved = await gameComplete([user]);
      assert.isDefined(achieved.find(a =>
        a.achievement.title === 'Novice' &&
        a.user._id === user._id));
    });

    it('gives achievement if 25 games played', async () => {
      const user = await createUser(1, { gamesPlayed: 25 });

      const achieved = await gameComplete([user]);
      assert.isDefined(achieved.find(a =>
        a.achievement.title === 'Novice' &&
        a.user._id === user._id));
    });
  });

  describe('Challenger', async () => {
    it('does not give achievement if 24 games played', async () => {
      const user = await createUser(1, { gamesPlayed: 24 });

      const achieved = await gameComplete([user]);
      assert.isUndefined(achieved.find(a =>
        a.achievement.title === 'Challenger' &&
        a.user._id === user._id));
    });

    it('gives achievement if 25 games played', async () => {
      const user = await createUser(1, { gamesPlayed: 25 });

      const achieved = await gameComplete([user]);
      assert.isDefined(achieved.find(a =>
        a.achievement.title === 'Challenger' &&
        a.user._id === user._id));
    });

    it('gives achievement if 50 games played', async () => {
      const user = await createUser(1, { gamesPlayed: 50 });

      const achieved = await gameComplete([user]);
      assert.isDefined(achieved.find(a =>
        a.achievement.title === 'Challenger' &&
        a.user._id === user._id));
    });
  });

  describe('Expert', async () => {
    it('does not give achievement if 49 games played', async () => {
      const user = await createUser(1, { gamesPlayed: 49 });

      const achieved = await gameComplete([user]);
      assert.isUndefined(achieved.find(a =>
        a.achievement.title === 'Expert' &&
        a.user._id === user._id));
    });

    it('gives achievement if 50 games played', async () => {
      const user = await createUser(1, { gamesPlayed: 50 });

      const achieved = await gameComplete([user]);
      assert.isDefined(achieved.find(a =>
        a.achievement.title === 'Expert' &&
        a.user._id === user._id));
    });

    it('gives achievement if 75 games played', async () => {
      const user = await createUser(1, { gamesPlayed: 75 });

      const achieved = await gameComplete([user]);
      assert.isDefined(achieved.find(a =>
        a.achievement.title === 'Expert' &&
        a.user._id === user._id));
    });
  });

  describe('Veteran', async () => {
    it('does not give achievement if 74 games played', async () => {
      const user = await createUser(1, { gamesPlayed: 74 });

      const achieved = await gameComplete([user]);
      assert.isUndefined(achieved.find(a =>
        a.achievement.title === 'Veteran' &&
        a.user._id === user._id));
    });

    it('gives achievement if 75 games played', async () => {
      const user = await createUser(1, { gamesPlayed: 75 });

      const achieved = await gameComplete([user]);
      assert.isDefined(achieved.find(a =>
        a.achievement.title === 'Veteran' &&
        a.user._id === user._id));
    });

    it('gives achievement if 100 games played', async () => {
      const user = await createUser(1, { gamesPlayed: 100 });

      const achieved = await gameComplete([user]);
      assert.isDefined(achieved.find(a =>
        a.achievement.title === 'Veteran' &&
        a.user._id === user._id));
    });
  });

  describe('Centenary', async () => {
    it('does not give achievement if 99 games played', async () => {
      const user = await createUser(1, { gamesPlayed: 99 });

      const achieved = await gameComplete([user]);
      assert.isUndefined(achieved.find(a =>
        a.achievement.title === 'Centenary' &&
        a.user._id === user._id));
    });

    it('gives achievement if 100 games played', async () => {
      const user = await createUser(1, { gamesPlayed: 100 });

      const achieved = await gameComplete([user]);
      assert.isDefined(achieved.find(a =>
        a.achievement.title === 'Centenary' &&
        a.user._id === user._id));
    });

    it('gives achievement if 200 games played', async () => {
      const user = await createUser(1, { gamesPlayed: 200 });

      const achieved = await gameComplete([user]);
      assert.isDefined(achieved.find(a =>
        a.achievement.title === 'Centenary' &&
        a.user._id === user._id));
    });
  });

  describe('Prodigy', async () => {
    it('does not give achievement if no games played', async () => {
      const user = await createUser(1, {});

      const achieved = await gameComplete([user]);
      assert.isUndefined(achieved.find(a =>
        a.achievement.title === 'Prodigy' &&
        a.user._id === user._id));
    });

    it('does not give achievement if one game played and no wins', async () => {
      const user = await createUser(1, { gamesPlayed: 1 });

      const achieved = await gameComplete([user]);
      assert.isUndefined(achieved.find(a =>
        a.achievement.title === 'Prodigy' &&
        a.user._id === user._id));
    });

    it('gives achievement if one game played and one win', async () => {
      const user = await createUser(1, { gamesPlayed: 1, wins: 1 });

      const achieved = await gameComplete([user]);
      assert.isDefined(achieved.find(a =>
        a.achievement.title === 'Prodigy' &&
        a.user._id === user._id));
    });

    it('does not give achievement if two games played and one win', async () => {
      const user = await createUser(1, { gamesPlayed: 2, wins: 1 });

      const achieved = await gameComplete([user]);
      assert.isUndefined(achieved.find(a =>
        a.achievement.title === 'Prodigy' &&
        a.user._id === user._id));
    });
  });
});
