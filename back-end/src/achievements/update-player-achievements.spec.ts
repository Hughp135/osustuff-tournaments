import { User } from '../models/User.model';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import { Score } from '../models/Score.model';
import { Achievement } from '../models/Achievement.model';
import { connectToMongo, disconnectFromMongo } from '../helpers/connect-to-mongo';
import { updatePlayerAchievements } from './update-player-achievements';
import { createUser } from '../test-helpers/create-user';
import { createScore } from '../test-helpers/create-score';
import { Game } from '../models/Game.model';
import { createGame } from '../test-helpers/create-game';
import { userToPlayer } from '../test-helpers/user-to-player';
import { ObjectId } from 'bson';

const assert = chai.assert;
chai.use(sinonChai);

describe('updatePlayerAchievements()', async () => {
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

  it('only considers scores from current round', async () => {
    const user1 = await createUser(1, {});
    const user2 = await createUser(2, {});
    const user3 = await createUser(3, {});
    const user4 = await createUser(4, {});

    const game = await createGame(
      undefined,
      [user1, user2, user3, user4].map(u => userToPlayer(u)));

    game.currentRound = new ObjectId();
    game.status = 'round-over';

    await createScore(user1, { score: 4, rank: 'X', game });
    await createScore(user2, { score: 3, rank: 'X', game });
    await createScore(user3, { score: 2, rank: 'X', game });
    await createScore(user4, { score: 1, rank: 'X', game, passedRound: false });

    await createScore(user1, { score: 4, rank: 'X', game, roundId: game.currentRound });
    await createScore(user2, { score: 3, rank: 'X', game, roundId: game.currentRound });
    await createScore(user3, { score: 2, rank: 'X', game, roundId: game.currentRound, passedRound: false });

    const achieved = await updatePlayerAchievements(game);
    assert.isDefined(achieved.find(a =>
      a.achievement.title === 'Spin to Win' &&
      a.user._id.toHexString() === user3._id.toHexString()));
  });
});
