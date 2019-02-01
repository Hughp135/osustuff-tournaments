import mongoose from 'mongoose';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import config from 'config';
import { Game, IPlayer } from '../models/Game.model';
import { Score } from '../models/Score.model';
import { User } from '../models/User.model';
import { Round } from '../models/Round.model';
import { roundEnded } from './round-ended';
import { addPlayer } from './add-player';

mongoose.set('useCreateIndex', true);
const expect = chai.expect;
chai.use(sinonChai);

describe('round-ended', () => {
  before(async () => {
    await mongoose.connect(
      'mongodb://127.0.0.1:' + config.get('DB_PORT') + '/osu-br-test',
      { useNewUrlParser: true },
    );
  });
  after(async () => {
    await mongoose.disconnect();
  });
  beforeEach(async () => {
    await Game.deleteMany({});
    await Score.deleteMany({});
    await User.deleteMany({});
  });

  it('No one wins if no scores set', async () => {
    const u1 = await getUser(1);
    const game = await Game.create({ title: 'test', beatmaps: [] });
    await addPlayer(game, u1);
    const round = await Round.create({
      beatmap: {
        beatmapId: 'asd123',
        title: 'b1',
      },
      gameId: game._id,
    });

    await roundEnded(game, round);
    expect(game.status).to.equal('round-over');
    expect(game.players[0].alive).to.equal(false);
  });
  it('Out of 3 players, 1 progresses', async () => {
    const u1 = await getUser(1);
    const u2 = await getUser(2);
    const u3 = await getUser(3);
    const game = await Game.create({ title: 'test', beatmaps: [] });

    await addPlayer(game, u2);
    await addPlayer(game, u3);
    await addPlayer(game, u1);

    const round = await Round.create({
      beatmap: {
        beatmapId: 'asd123',
        title: 'b1',
      },
      gameId: game._id,
    });
    const baseScoreData = getBaseScoreData(round);
    await Score.create({
      ...baseScoreData,
      score: 3,
      userId: u1._id,
    });
    await Score.create({
      ...baseScoreData,
      score: 1,
      userId: u2._id,
    });
    await Score.create({
      ...baseScoreData,
      score: 2,
      userId: u3._id,
    });

    await roundEnded(game, round);
    expect(game.status).to.equal('round-over');
    const p1 = <IPlayer> game.players.find(p => p.userId.toString() === u1._id.toString());
    const p2 = <IPlayer> game.players.find(p => p.userId.toString() === u2._id.toString());
    const p3 = <IPlayer> game.players.find(p => p.userId.toString() === u3._id.toString());
    expect(p1.alive).to.equal(true);
    expect(p2.alive).to.equal(false);
    expect(p3.alive).to.equal(false);
  });
  it('for 2 players with same score, earliest score date wins', async () => {
    const u1 = await getUser(1);
    const u2 = await getUser(2);
    const game = await Game.create({ title: 'test', beatmaps: [] });

    await addPlayer(game, u2);
    await addPlayer(game, u1);

    const round = await Round.create({
      beatmap: {
        beatmapId: 'asd123',
        title: 'b1',
      },
      gameId: game._id,
    });
    const baseScoreData = getBaseScoreData(round);
    await Score.create({
      ...baseScoreData,
      score: 1,
      userId: u1._id,
    });
    await Score.create({
      ...baseScoreData,
      score: 2,
      userId: u1._id,
    });
    const date = new Date();
    date.setMinutes(date.getMinutes() - 1);

    await Score.create({
      ...baseScoreData,
      score: 2,
      userId: u2._id,
      date,
    });

    await roundEnded(game, round);
    const p1 = <IPlayer> game.players.find(p => p.userId.toString() === u1._id.toString());
    const p2 = <IPlayer> game.players.find(p => p.userId.toString() === u2._id.toString());
    expect(p1.alive).to.equal(false);
    expect(p2.alive).to.equal(true);
  });
  it('ranks losing scores accordingly', async () => {
    const u1 = await getUser(1);
    const u2 = await getUser(2);
    const u3 = await getUser(3);
    const u4 = await getUser(4);
    const u5 = await getUser(5);
    const u6 = await getUser(6);
    const u7 = await getUser(7);
    const game = await Game.create({ title: 'test', beatmaps: [] });

    await addPlayer(game, u1);
    await addPlayer(game, u4);
    await addPlayer(game, u2);
    await addPlayer(game, u3);
    await addPlayer(game, u5);
    await addPlayer(game, u6);
    await addPlayer(game, u7);

    const round = await Round.create({
      beatmap: {
        beatmapId: 'asd123',
        title: 'b1',
      },
      gameId: game._id,
    });
    const baseScoreData = getBaseScoreData(round);
    await Score.create({
      ...baseScoreData,
      score: 2,
      userId: u1._id,
    });
    await Score.create({
      ...baseScoreData,
      score: 5,
      userId: u5._id,
    });
    await Score.create({
      ...baseScoreData,
      score: 1,
      userId: u2._id,
    });
    await Score.create({
      ...baseScoreData,
      score: 4,
      userId: u3._id,
    });
    await Score.create({
      ...baseScoreData,
      score: 3,
      userId: u4._id,
    });

    await roundEnded(game, round);
    const p1 = <IPlayer> game.players.find(p => p.userId.toString() === u1._id.toString());
    const p2 = <IPlayer> game.players.find(p => p.userId.toString() === u2._id.toString());
    const p3 = <IPlayer> game.players.find(p => p.userId.toString() === u3._id.toString());
    const p4 = <IPlayer> game.players.find(p => p.userId.toString() === u4._id.toString());
    const p5 = <IPlayer> game.players.find(p => p.userId.toString() === u5._id.toString());
    const p6 = <IPlayer> game.players.find(p => p.userId.toString() === u6._id.toString());
    const p7 = <IPlayer> game.players.find(p => p.userId.toString() === u7._id.toString());

    expect(p1.gameRank).to.equal(4);
    expect(p2.gameRank).to.equal(5);
    expect(p3.gameRank).to.equal(undefined);
    expect(p4.gameRank).to.equal(3);
    expect(p5.gameRank).to.equal(undefined);
    expect(p6.gameRank).to.equal(7);
    expect(p7.gameRank).to.equal(6);
  });
});

async function getUser(id: number) {
  return await User.create({
    username: `user${id}`,
    ppRank: id,
    countryRank: id,
    osuUserId: id,
    country: 'US',
  });
}

function getBaseScoreData(round: any) {
  return {
    roundId: round._id,
    rank: 'A',
    mods: 0,
    maxCombo: 10,
    accuracy: 1,
    misses: 0,
    count100: 1,
    date: new Date(),
  };
}
