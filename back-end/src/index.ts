import mongoose from 'mongoose';
import config from 'config';
import { Game } from './models/Game.model';
import { User } from './models/User.model';
import { addPlayer } from './game/add-player';
import { createGame } from './game/create-game';
import { startMonitoring } from './game/monitor-running-games';

mongoose.set('useCreateIndex', true);

(async function start() {
  await mongoose.connect(
    'mongodb://127.0.0.1:' + config.get('DB_PORT') + '/osu-br',
    { useNewUrlParser: true },
  );

  await Game.deleteMany({});
  await User.deleteMany({});

  const user = await User.create({
    username: 'Mongoose-',
  });

  const game = await createGame();
  await addPlayer(game, user);

  await startMonitoring();
})().catch(e => console.error(e)); // tslint:disable-line
