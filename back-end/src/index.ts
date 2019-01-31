import mongoose from 'mongoose';
import config from 'config';
import { Game } from './models/Game.model';
import { User } from './models/User.model';
import { addPlayer } from './game/add-player';
import { createGame } from './game/create-game';
import { startMonitoring } from './game/monitor-running-games';
import { startServer } from './api';
import winston from 'winston';
import { getRecentBeatmaps } from './services/osu-api';
import { Round } from './models/Round.model';
import { JoinGameRequest } from './models/JoinGameRequest.model';

export const TEST_MODE = config.get('TEST_MODE');
winston.add(new winston.transports.File({ filename: 'winston.log' }));
winston.add(new winston.transports.Console());

mongoose.set('useCreateIndex', true);

(async function start() {
  await mongoose.connect(
    'mongodb://127.0.0.1:' + config.get('DB_PORT') + '/osu-br',
    { useNewUrlParser: true },
  );

  // await Game.deleteMany({});
  // await User.deleteMany({});
  // await Round.deleteMany({});
  // await JoinGameRequest.deleteMany({});

  await startServer();

  // const user = await User.create({
  //   username: 'Mongoose-',
  // });

  // const game = await createGame(getRecentBeatmaps);
  // await addPlayer(game, user);

  await startMonitoring();
})().catch(e => console.error(e)); // tslint:disable-line
