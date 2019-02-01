import mongoose from 'mongoose';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import config from 'config';
import { Game, IPlayer } from '../models/Game.model';
import { User } from '../models/User.model';
import sinon from 'sinon';
import { calculatePlayersElo } from './calculate-players-elo';

mongoose.set('useCreateIndex', true);
const expect = chai.expect;
chai.use(sinonChai);

describe.only('check-player-scores', () => {
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
    await User.deleteMany({});
  });
  it('ranks elo', async () => {
    for (let i = 0; i < 2; i++) {
      const players = await createPlayers(5);
      await calculatePlayersElo({ players });
      const users = await User.find().lean();
      console.log(users.map((u: any) => u.elo));
    }
  });
});

async function createPlayers(count: number) {
  const players = new Array(count).fill(null).map(async (_, index) => {
    const user = await User.create({
      username: `user${index}`,
      osuUserId: `${index}`,
      ppRank: index,
      countryRank: index,
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
