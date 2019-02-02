import mongoose from 'mongoose';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import config from 'config';
import { Game, IPlayer } from '../models/Game.model';
import { User } from '../models/User.model';
import { calculatePlayersElo } from './calculate-players-elo';

mongoose.set('useCreateIndex', true);
const expect = chai.expect;
chai.use(sinonChai);

describe('check-player-scores', () => {
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
    await User.deleteMany({});
  });
  it('ranks elo', async () => {
    const players = await createPlayers(10);
    for (let i = 0; i < 5; i++) {
      await calculatePlayersElo({
        players,
      });
    }
  });
});

async function createPlayers(count: number) {
  const players = new Array(count).fill(null).map(async (_, index) => {
    const id = index;
    const user = await User.create({
      username: `user${id}`,
      osuUserId: `${id}`,
      ppRank: id,
      countryRank: id,
      country: 'GB',
    });

    return <IPlayer> {
      alive: true,
      userId: user._id,
      osuUserId: user.osuUserId,
      username: user.username,
      ppRank: user.ppRank,
      countryRank: user.countryRank,
      country: user.country,
      gameRank: index + 1,
    };
  });

  return await Promise.all(players);
}
