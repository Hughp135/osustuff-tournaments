import mongoose from 'mongoose';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import config from 'config';
import { Game, IPlayer } from '../models/Game.model';
import { User } from '../models/User.model';
import { updatePlayerGameStats } from './update-player-game-stats';

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
    const players = await createPlayers(1000);
    for (let i = 0; i < 10; i++) {
      await updatePlayerGameStats({
        players: shuffle(players),
      });
    }
    const usersFinal = await User.find()
    .select({ username: 1, elo: 1 })
    .lean();

    usersFinal.forEach((u: any) => {
      expect(u.elo).not.to.equal(1500);
    });
  }).timeout(30000);
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

function shuffle(a: any[]) {
  for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
