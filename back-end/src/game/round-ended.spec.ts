import { ObjectId } from 'bson';
import mongoose from 'mongoose';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import { Game, IPlayer, IGame } from '../models/Game.model';
import { Score } from '../models/Score.model';
import { User, IUser } from '../models/User.model';
import { Round, IRound } from '../models/Round.model';
import { roundEnded } from './round-ended';
import { addPlayer } from './add-player';
import { connectToMongo, disconnectFromMongo } from '../helpers/connect-to-mongo';

mongoose.set('useCreateIndex', true);
const expect = chai.expect;
chai.use(sinonChai);

describe('round-ended', () => {
  before(async () => {
    await connectToMongo();
  });
  after(async () => {
    await disconnectFromMongo();
  });
  beforeEach(async () => {
    await Game.deleteMany({});
    await Score.deleteMany({});
    await User.deleteMany({});
  });

  it('No one wins if no scores set', async () => {
    const u1 = await getUser(1);
    const game = await Game.create({ title: 'test', beatmaps: [], roundNumber: 1 });
    await addPlayer(game, u1);
    const round = await Round.create({
      roundNumber: 1,
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
  it('Players with no score set should draw', async () => {
    const game = await Game.create({ title: 'test', beatmaps: [], roundNumber: 1 });

    for (let i = 1; i <= 3; i++) {
      const u = await getUser(i);
      await addPlayer(game, u);
    }
    const round = await Round.create({
      roundNumber: 1,
      beatmap: {
        beatmapId: 'asd123',
        title: 'b1',
      },
      gameId: game._id,
    });
    const winner = await getUser(4);
    await addPlayer(game, winner);

    const baseScoreData = getBaseScoreData(round);
    await Score.create({
      ...baseScoreData,
      score: 2,
      userId: winner._id,
      username: winner.username,
    });
    const loser = await getUser(5);
    await addPlayer(game, loser);
    await Score.create({
      ...baseScoreData,
      score: 1,
      userId: loser._id,
      username: loser.username,
    });

    await roundEnded(game, round);

    expect(game.players[0].gameRank).to.equal(5);
    expect(game.players[0].alive).to.equal(false);
    expect(game.players[1].gameRank).to.equal(5);
    expect(game.players[1].alive).to.equal(false);
    expect(game.players[2].gameRank).to.equal(5);
    expect(game.players[2].alive).to.equal(false);
    expect(game.players[3].gameRank).to.equal(undefined);
    expect(game.players[3].alive).to.equal(true);
    expect(game.players[4].gameRank).to.equal(2);
    expect(game.players[4].alive).to.equal(false);
  });
  it('Out of 3 players, 1 progress', async () => {
    const u1 = await getUser(1);
    const u2 = await getUser(2);
    const u3 = await getUser(3);
    const game = await Game.create({ title: 'test', beatmaps: [], roundNumber: 1 });

    await addPlayer(game, u2);
    await addPlayer(game, u3);
    await addPlayer(game, u1);

    const round = await Round.create({
      roundNumber: 1,
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
      username: u1.username,
    });
    await Score.create({
      ...baseScoreData,
      score: 1,
      userId: u2._id,
      username: u2.username,
    });
    await Score.create({
      ...baseScoreData,
      score: 2,
      userId: u3._id,
      username: u3.username,
    });

    await roundEnded(game, round);
    expect(game.status).to.equal('round-over');
    const p1 = <IPlayer> game.players.find(p => p.userId.toString() === u1._id.toString());
    const p2 = <IPlayer> game.players.find(p => p.userId.toString() === u2._id.toString());
    const p3 = <IPlayer> game.players.find(p => p.userId.toString() === u3._id.toString());

    expect(p1.alive).to.equal(true);
    expect(p2.alive).to.equal(false);
    expect(p3.alive).to.equal(true);
  });
  it('Final 3, 2 players draw, all alive', async () => {
    const u1 = await getUser(1);
    const u2 = await getUser(2);
    const u3 = await getUser(3);
    const game = await Game.create({ title: 'test', beatmaps: [], roundNumber: 1 });

    await addPlayer(game, u2);
    await addPlayer(game, u3);
    await addPlayer(game, u1);

    const round = await Round.create({
      roundNumber: 1,
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
      username: u1.username,
    });
    await Score.create({
      ...baseScoreData,
      score: 1,
      userId: u2._id,
      username: u2.username,
    });
    await Score.create({
      ...baseScoreData,
      score: 1,
      userId: u3._id,
      username: u3.username,
    });

    await roundEnded(game, round);
    expect(game.status).to.equal('round-over');

    game.players.forEach((player, index) => {
      expect(player.alive).to.equal(true);
      expect(player.gameRank).to.equal(undefined);
    });
  });
  it('last 2 players tied scores, both should stay alive', async () => {
    const u1 = await getUser(1);
    const u2 = await getUser(2);
    const game = await Game.create({ title: 'test', beatmaps: [] });

    await addPlayer(game, u2);
    await addPlayer(game, u1);

    const round = await Round.create({
      roundNumber: 1,
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
      username: u1.username,
    });
    await Score.create({
      ...baseScoreData,
      score: 2,
      userId: u1._id,
      username: u1.username,
    });
    const date = new Date();
    date.setMinutes(date.getMinutes() - 1);

    await Score.create({
      ...baseScoreData,
      score: 2,
      userId: u2._id,
      date,
      username: u2.username,
    });

    await roundEnded(game, round);
    const p1 = <IPlayer> game.players.find(p => p.userId.toString() === u1._id.toString());
    const p2 = <IPlayer> game.players.find(p => p.userId.toString() === u2._id.toString());
    expect(p1.alive).to.equal(true);
    expect(p1.gameRank).to.equal(undefined);
    expect(p2.alive).to.equal(true);
    expect(p2.gameRank).to.equal(undefined);
  });
  it('scores that tie with passing score should also pass', async () => {
    const game = await Game.create({ title: 'test', beatmaps: [], roundNumber: 1 });

    const players = [];
    for (let i = 0; i < 5; i++) {
      players.push(await addPlayer(game, await getUser(i)));
    }

    const round = await Round.create({
      roundNumber: 1,
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
      userId: players[0]._id,
      username: players[0].username,
    });
    for (let i = 1; i <= 3; i++) {
      await Score.create({
        ...baseScoreData,
        score: 1,
        userId: players[i]._id,
        username: players[i].username,
      });
    }
    await roundEnded(game, round);

    for (let i = 0; i < 4; i++) {
      expect(game.players[i].alive).to.equal(true);
      expect(game.players[i].gameRank).to.equal(undefined);
    }
    expect(game.players[4].alive).to.equal(false);
    expect(game.players[4].gameRank).to.equal(5);
  });
  it('Number of winners is dependant on round number', async () => {
    const getWinRate = (roundNum: number, playersAlive: number) =>
      0.8 - 0.04 * (roundNum - 1) * Math.log10(playersAlive);

    const numOfRounds = 10;
    const expectedAliveCountPerRound = [8, 7, 7, 6, 6, 6, 5, 5, 4, 1];

    if (expectedAliveCountPerRound.length !== numOfRounds) {
      throw new Error(
        'expectedAliveCountPerRound length must equal numofRounds to check each round properly',
      );
    }

    for (let i = 1; i <= numOfRounds; i++) {
      const game = await Game.create({ title: 'test', beatmaps: [], roundNumber: i });
      const [users, round] = await generateUsersAndScores(game, 10);
      await roundEnded(game, round);
      const aliveUsers = game.players.filter(p => p.alive);
      expect(aliveUsers.length).to.equal(expectedAliveCountPerRound[i - 1], 'Round ' + i);
    }
  });
});

async function getUser(id: number) {
  return await User.create({
    username: `user${id}`,
    ppRank: id,
    countryRank: id,
    osuUserId: id,
    country: 'US',
    rating: { mu: 1500, sigma: 150 },
  });
}

async function createScore(round: IRound, user: IUser, score: number) {
  await Score.create({
    ...getBaseScoreData(round),
    score,
    userId: user._id,
    username: user.username,
  });
}

async function generateUsersAndScores(
  game: IGame,
  numberOfUsers: number,
): Promise<[IUser[], IRound]> {
  const users: IUser[] = [];
  for (let i = 0; i < numberOfUsers; i++) {
    users.push(await addPlayer(game, await getUser(i)));
  }

  const round = await Round.create({
    roundNumber: 1,
    beatmap: {
      beatmapId: 'asd123',
      title: 'b1',
    },
    gameId: game._id,
  });

  for (let i = 0; i < numberOfUsers; i++) {
    await createScore(round, users[i], i + 1);
  }

  return [users, round];
}

function getBaseScoreData(round: any) {
  return {
    gameId: new ObjectId(),
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

function executePromisesInParallel(tasks: Array<Promise<any>>) {
  return tasks.reduce((promiseChain, currentTask) => {
    return promiseChain.then(chainResults =>
      currentTask.then(currentResult => [...chainResults, currentResult]),
    );
  }, Promise.resolve([]));
}
