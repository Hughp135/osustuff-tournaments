import mongoose from 'mongoose';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import config from 'config';
import { Game, IPlayer } from '../models/Game.model';
import { Score } from '../models/Score.model';
import { User } from '../models/User.model';
import sinon from 'sinon';
import { Round } from '../models/Round.model';
import { ObjectID } from 'bson';
import { checkRoundScores } from './check-player-scores';
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
    const u1 = await User.create({ username: '1' });
    const game = await Game.create({});
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
    const u1 = await User.create({ username: '1' });
    const u2 = await User.create({ username: '2' });
    const u3 = await User.create({ username: '3' });
    const game = await Game.create({});

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
    const baseScoreData = {
      roundId: round._id,
      rank: 'A',
      mods: 0,
      maxCombo: 10,
      misses: 0,
      date: new Date(),
    };

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
    const p1 = <IPlayer> (
      game.players.find(p => p.userId.toString() === u1._id.toString())
    );
    const p2 = <IPlayer> (
      game.players.find(p => p.userId.toString() === u2._id.toString())
    );
    const p3 = <IPlayer> (
      game.players.find(p => p.userId.toString() === u3._id.toString())
    );
    expect(p1.alive).to.equal(true);
    expect(p2.alive).to.equal(false);
    expect(p3.alive).to.equal(false);
  });
  it('for 2 players with same score, earliest score date wins', async () => {
    const u1 = await User.create({ username: '1' });
    const u2 = await User.create({ username: '2' });
    const game = await Game.create({});

    await addPlayer(game, u2);
    await addPlayer(game, u1);

    const round = await Round.create({
      beatmap: {
        beatmapId: 'asd123',
        title: 'b1',
      },
      gameId: game._id,
    });
    const baseScoreData = {
      roundId: round._id,
      rank: 'A',
      mods: 0,
      maxCombo: 10,
      misses: 0,
      date: new Date(),
    };

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
    const p1 = <IPlayer> (
      game.players.find(p => p.userId.toString() === u1._id.toString())
    );
    const p2 = <IPlayer> (
      game.players.find(p => p.userId.toString() === u2._id.toString())
    );
    expect(p1.alive).to.equal(false);
    expect(p2.alive).to.equal(true);
  });
});
