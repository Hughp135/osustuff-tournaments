import { IGame, IPlayer } from './../models/Game.model';
import { IBeatmap } from './../models/Beatmap.model';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import mongoose from 'mongoose';
import { Game } from '../models/Game.model';
import config from 'config';
import { createGame } from '../game/create-game';
import { nextRound } from '../game/next-round';
import { Round, IRound } from '../models/Round.model';
import { updateRunningGames } from '../game/monitor-running-games';
import sinon from 'sinon';
import { Score } from '../models/Score.model';
import { User } from '../models/User.model';

mongoose.set('useCreateIndex', true);
const expect = chai.expect;
chai.use(sinonChai);

describe('game', () => {
  before(async () => {
    await mongoose.connect(
      'mongodb://127.0.0.1:' + config.get('DB_PORT') + '/osu-br-test',
      { useNewUrlParser: true },
    );
  });
  beforeEach(async () => {
    await Game.deleteMany({});
    await Score.deleteMany({});
    await User.deleteMany({});
  });
  after(async () => {
    await mongoose.disconnect();
  });
  it('creates a game', async () => {
    const game = await createGame();

    const found = <IGame> await Game.findById(game._id);

    expect(found)
      .to.have.property('status')
      .equal('new');
  });
  it('goes to next round', async () => {
    const game = await createGame();
    const beatmap: IBeatmap = {
      title: 'test beatmap',
      beatmapId: '123',
      duration: 30,
    };

    await nextRound(game, beatmap);

    const gameFromDb = <IGame> await Game.findById(game._id);

    expect(gameFromDb).to.have.property('currentRound');

    const round = <IRound> await Round.findById(gameFromDb.currentRound);

    expect(round)
      .to.have.property('beatmap')
      .deep.equals(beatmap);

    const beatmap2: IBeatmap = {
      title: 'test beatmap2',
      beatmapId: '234',
      duration: 30,
    };

    await nextRound(game, beatmap2);

    const updatedGame = <IGame> await Game.findById(game._id);

    expect(updatedGame).to.have.property('currentRound');

    const round2 = <IRound> await Round.findById(updatedGame.currentRound);

    expect(round2)
      .to.have.property('beatmap')
      .deep.equals(beatmap2);

    expect(updatedGame.roundNumber).to.equal(2);
  });
  it('auto progresses', async () => {
    const clock = sinon.useFakeTimers();
    const game = await createGame();
    const beatmap: IBeatmap = {
      title: 'test beatmap',
      beatmapId: '123',
      duration: 10,
    };

    await nextRound(game, beatmap);

    clock.tick(40001);

    await updateRunningGames();

    const updated = <IGame> await Game.findById(game._id);

    expect(updated.roundNumber).to.equal(1);
    expect(updated.status).to.equal('round-over');
    expect(updated.nextStageStarts).to.exist; // tslint:disable-line:no-unused-expression

    clock.tick(10001);

    await updateRunningGames();

    const updated2 = <IGame> await Game.findById(game._id);

    expect(updated2.status).to.equal('complete');
    expect(updated2.winningUser).to.equal(undefined);

    clock.restore();
  });
});
