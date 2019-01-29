import mongoose from 'mongoose';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import config from 'config';
import { Game } from '../models/Game.model';
import { Score } from '../models/Score.model';
import { User } from '../models/User.model';
import sinon from 'sinon';
import { Round } from '../models/Round.model';
import { ObjectID } from 'bson';
import { checkRoundScores } from './check-player-scores';

mongoose.set('useCreateIndex', true);
const expect = chai.expect;
chai.use(sinonChai);

describe('check-player-scores', () => {
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

  it('requests the API for each alive player in a game', async () => {
    const u1 = await User.create({ username: '1' });
    const u2 = await User.create({ username: '2' });
    const u3 = await User.create({ username: '3' });

    const game = await Game.create({
      players: [
        { userId: u1._id, username: '1', alive: true },
        { userId: u2._id, username: '2', alive: true },
        { userId: u3._id, username: '3', alive: false },
      ],
    });
    const round = await Round.create({
      beatmap: {
        beatmapId: 'asd123',
        title: 'b1',
      },
      gameId: game._id,
    });
    const getUserRecent = sinon.stub().callsFake(async (u: string) => [
      {
        beatmap_id: '932223',
        score: '100000',
        countmiss: '3',
        enabled_mods: '576',
        maxcombo: '256',
        date: '2030-06-22 9:11:16',
        rank: 'C',
      },
    ]);

    await checkRoundScores(game, round, getUserRecent);
    expect(getUserRecent).calledTwice; // tslint:disable-line:no-unused-expression

    const scores = await Score.find({});
    expect(scores.length).to.equal(0);
  });

  it('saves 2 scores for each user', async () => {
    const u1 = await User.create({ username: '1' });
    const u2 = await User.create({ username: '2' });
    const u3 = await User.create({ username: '3' });

    const game = await Game.create({
      players: [
        { userId: u1._id, username: '1', alive: true },
        { userId: u2._id, username: '2', alive: true },
        { userId: u3._id, username: '3', alive: false },
      ],
    });
    const round = await Round.create({
      beatmap: {
        beatmapId: '932223',
        title: 'b1',
      },
      gameId: game._id,
    });

    const getUserRecent = sinon.stub().callsFake(async (u: string) => [
      {
        beatmap_id: '932223',
        score: '100000',
        countmiss: '3',
        enabled_mods: '576',
        maxcombo: '256',
        date: '2030-06-22 9:11:16',
        rank: 'C',
      },
      {
        beatmap_id: '932223',
        score: '200000',
        countmiss: '0',
        enabled_mods: '0',
        maxcombo: '721',
        date: '2030-06-22 9:11:16',
        rank: 'A',
      },
    ]);

    await checkRoundScores(game, round, getUserRecent);
    expect(getUserRecent).calledTwice; // tslint:disable-line:no-unused-expression

    const scores = await Score.find({});
    expect(
      scores.filter(s => s.userId.toString() === u1._id.toString()).length,
    ).to.equal(2);
    expect(
      scores.filter(s => s.userId.toString() === u2._id.toString()).length,
    ).to.equal(2);
    expect(
      scores.filter(s => s.userId.toString() === u3._id.toString()).length,
    ).to.equal(0);
  });
  it('Saves identical score only once if checked twice', async () => {
    const u1 = await User.create({ username: '1' });

    const game = await Game.create({
      players: [{ userId: u1._id, username: '1', alive: true }],
    });
    const round = await Round.create({
      beatmap: {
        beatmapId: '932223',
        title: 'b1',
      },
      gameId: game._id,
    });

    const getUserRecent = sinon.stub().callsFake(async (u: string) => [
      {
        beatmap_id: '932223',
        score: '100000',
        countmiss: '3',
        enabled_mods: '576',
        maxcombo: '256',
        date: '2030-06-22 9:11:16',
        rank: 'C',
      },
    ]);

    await checkRoundScores(game, round, getUserRecent);
    await checkRoundScores(game, round, getUserRecent);

    const scores = await Score.find({
      userId: u1._id,
      roundId: round._id,
    });

    expect(scores.length).to.equal(1);
  });
  it('Saves all unique valid scores for the beatmap returned by getUserRecent', async () => {
    const u1 = await User.create({ username: '1' });

    const game = await Game.create({
      players: [{ userId: u1._id, username: '1', alive: true }],
    });
    const round = await Round.create({
      beatmap: {
        beatmapId: '932223',
        title: 'b1',
      },
      gameId: game._id,
    });

    const getUserRecent = sinon.stub().callsFake(async (u: string) => [
      {
        beatmap_id: '932223',
        score: '100000',
        countmiss: '3',
        enabled_mods: '576',
        maxcombo: '256',
        date: '2030-06-22 9:11:16',
        rank: 'C',
      },
      {
        beatmap_id: '932223',
        score: '200000',
        countmiss: '3',
        enabled_mods: '576',
        maxcombo: '256',
        date: '2030-06-22 9:11:20',
        rank: 'A',
      },
    ]);

    await checkRoundScores(game, round, getUserRecent);

    const scores = await Score.find({
      userId: u1._id,
      roundId: round._id,
    });

    expect(scores.length).to.equal(2);
  });
  it('Saves different scores twice if checked twice', async () => {
    const u1 = await User.create({ username: '1' });

    const game = await Game.create({
      players: [{ userId: u1._id, username: '1', alive: true }],
    });
    const round = await Round.create({
      beatmap: {
        beatmapId: '932223',
        title: 'b1',
      },
      gameId: game._id,
    });
    await checkRoundScores(game, round, async (u: string) => [
      {
        beatmap_id: '932223',
        score: '100000',
        countmiss: '3',
        enabled_mods: '576',
        maxcombo: '256',
        date: '2030-06-22 9:11:16',
        rank: 'C',
      },
    ]);
    await checkRoundScores(game, round, async () => [
      {
        beatmap_id: '932223',
        score: '300000',
        countmiss: '3',
        enabled_mods: '576',
        maxcombo: '256',
        date: '2030-06-22 9:11:17',
        rank: 'C',
      },
    ]);

    const scores = await Score.find({
      userId: u1._id,
      roundId: round._id,
    });

    expect(scores.length).to.equal(2);
  });
});
