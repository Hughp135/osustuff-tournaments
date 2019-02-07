import { IPlayer } from './../models/Game.model';
import mongoose from 'mongoose';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import config from 'config';
import { Game } from '../models/Game.model';
import { Score } from '../models/Score.model';
import { User } from '../models/User.model';
import sinon from 'sinon';
import { Round } from '../models/Round.model';
import { checkRoundScores } from './check-player-scores';
import { addPlayer } from './add-player';

const expect = chai.expect;
chai.use(sinonChai);

describe('check-player-scores', () => {
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
    await Score.deleteMany({});
    await User.deleteMany({});
  });

  it('requests the API for each alive player in a game', async () => {
    const u1 = await getUser(1);
    const u2 = await getUser(2);
    const u3 = await getUser(3);

    const game = await Game.create({
      title: 'test',
      beatmaps: [],
    });
    await addPlayer(game, u1);
    await addPlayer(game, u2);
    await addPlayer(game, u3);
    (<IPlayer> game.players.find(p => p.userId.toString() === u3._id.toString())).alive = false;
    const round = await Round.create({
      roundNumber: 1,
      beatmap: {
        beatmapId: 'asd123',
        title: 'b1',
      },
      gameId: game._id,
    });
    const getUserRecent = sinon
      .stub()
      .callsFake(async (u: string) => [getScore('932223', '1000000')]);

    await checkRoundScores(game, round, getUserRecent);
    expect(getUserRecent).calledTwice; // tslint:disable-line:no-unused-expression

    const scores = await Score.find({});
    expect(scores.length).to.equal(0);
  });

  it('saves 2 scores for each user', async () => {
    const u1 = await getUser(1);
    const u2 = await getUser(2);
    const u3 = await getUser(3);

    const game = await Game.create({
      title: 'test',
      beatmaps: [],
    });
    await addPlayer(game, u1);
    await addPlayer(game, u2);
    await addPlayer(game, u3);
    (<IPlayer> game.players.find(p => p.userId.toString() === u3._id.toString())).alive = false;

    const round = await Round.create({
      roundNumber: 1,
      beatmap: {
        beatmap_id: '932223',
        title: 'b1',
      },
      gameId: game._id,
    });

    const getUserRecent = sinon
      .stub()
      .callsFake(async (u: string) => [
        getScore('932223', '1000000'),
        getScore('932223', '2000000'),
      ]);

    await checkRoundScores(game, round, getUserRecent);
    expect(getUserRecent).calledTwice; // tslint:disable-line:no-unused-expression

    const scores = await Score.find({});
    expect(scores.filter(s => s.userId.toString() === u1._id.toString()).length).to.equal(2);
    expect(scores.filter(s => s.userId.toString() === u2._id.toString()).length).to.equal(2);
    expect(scores.filter(s => s.userId.toString() === u3._id.toString()).length).to.equal(0);
  });
  it('Saves identical score only once if checked twice', async () => {
    const u1 = await getUser(1);

    const game = await Game.create({
      title: 'test',
      beatmaps: [],
    });
    await addPlayer(game, u1);
    const round = await Round.create({
      roundNumber: 1,
      beatmap: {
        beatmap_id: '932223',
        title: 'b1',
      },
      gameId: game._id,
    });

    const getUserRecent = sinon
      .stub()
      .callsFake(async (u: string) => [getScore('932223', '1000000')]);

    await checkRoundScores(game, round, getUserRecent);
    await checkRoundScores(game, round, getUserRecent);

    const scores = await Score.find({
      userId: u1._id,
      roundId: round._id,
    });

    expect(scores.length).to.equal(1);
  });
  it('Saves all unique valid scores for the beatmap returned by getUserRecent', async () => {
    const u1 = await getUser(1);

    const game = await Game.create({
      title: 'test',
      beatmaps: [],
    });
    await addPlayer(game, u1);
    const round = await Round.create({
      roundNumber: 1,
      beatmap: {
        beatmap_id: '932223',
        title: 'b1',
      },
      gameId: game._id,
    });

    const getUserRecent = sinon
      .stub()
      .callsFake(async (u: string) => [
        getScore('932223', '1000000'),
        getScore('932223', '2000000'),
      ]);

    await checkRoundScores(game, round, getUserRecent);

    const scores = await Score.find({
      userId: u1._id,
      roundId: round._id,
    });

    expect(scores.length).to.equal(2);
  });
  it('Saves different scores twice if checked twice', async () => {
    const u1 = await getUser(1);

    const game = await Game.create({
      title: 'test',
      beatmaps: [],
    });
    await addPlayer(game, u1);
    const round = await Round.create({
      roundNumber: 1,
      beatmap: {
        beatmap_id: '932223',
        title: 'b1',
      },
      gameId: game._id,
    });
    await checkRoundScores(game, round, async (u: string) => [
      getScore('932223', '1000000', '2030-06-22 9:11:16'),
    ]);
    await checkRoundScores(game, round, async () => [
      getScore('932223', '3000000', '2030-06-22 9:12:16'),
    ]);

    const scores = await Score.find({
      userId: u1._id,
      roundId: round._id,
    });

    expect(scores.length).to.equal(2);
  });
});

async function getUser(id: number) {
  return await User.create({
    rating: { mu: 1500, sigma: 150 },
    username: `user${id}`,
    ppRank: id,
    countryRank: id,
    osuUserId: id,
    country: 'US',
  });
}

function getScore(beatmapId: string, score: string, date?: string) {
  return {
    beatmap_id: beatmapId,
    score,
    countmiss: '3',
    count100: '1',
    count50: '1',
    count300: '2',
    enabled_mods: '576',
    maxcombo: '256',
    date: date ? date : '2030-06-22 9:11:16',
    rank: 'C',
  };
}
