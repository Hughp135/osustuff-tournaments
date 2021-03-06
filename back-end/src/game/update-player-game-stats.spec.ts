import chai from 'chai';
import sinonChai from 'sinon-chai';
import { Game, IPlayer, IGame } from '../models/Game.model';
import { User } from '../models/User.model';
import { updatePlayerGameStats } from './update-player-game-stats';
import { Skill } from '../services/trueskill';
import { connectToMongo, disconnectFromMongo } from '../helpers/connect-to-mongo';

const expect = chai.expect;
chai.use(sinonChai);

describe('update-player-game-stats', () => {
  before(async () => {
    await connectToMongo();
  });
  after(async () => {
    await disconnectFromMongo();
  });
  beforeEach(async () => {
    await Game.deleteMany({});
    await User.deleteMany({});
  });
  it('ranks rating', async () => {
    const players = await createPlayers(10);
    for (let i = 0; i < 3; i++) {
      const shuffled = shufflePlayerRanks(players);
      await updatePlayerGameStats(<IGame>{
        _id: '',
        players: shuffled,
      });
    }
    const usersFinal = await User.find();

    usersFinal.forEach((u: any) => {
      expect(u.rating.mu).not.to.equal(1500);
      expect(u.rating.sigma).not.to.equal(150);
    });
  }).timeout(30000);
});

async function createPlayers(count: number) {
  const { mu, sigma } = Skill.createRating();
  const players = new Array(count).fill(null).map(async (_, index) => {
    const id = index;
    const user = await User.create({
      rating: {
        mu,
        sigma,
      },
      username: `user${id}`,
      osuUserId: `${id}`,
      ppRank: id,
      countryRank: id,
      country: 'GB',
    });

    return <IPlayer>{
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

function shufflePlayerRanks(players: IPlayer[]): IPlayer[] {
  return players.map(p => {
    p.gameRank = Math.floor(Math.random() * players.length) + 1;
    return p;
  });
}

function shuffle(a: any[]) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
