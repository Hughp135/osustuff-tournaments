import mongoose from 'mongoose';
import config from 'config';
import { createGame } from './game/create-game';
import { User } from './models/User.model';
import { addPlayer } from './game/add-player';
import { startMonitoring } from './game/monitor-running-games';
import { Game } from './models/Game.model';

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
  await addPlayer(game, {
    username: user.username,
    userId: user._id,
    alive: true,
  });

  await startMonitoring();
})().catch(e => console.error(e)); // tslint:disable-line
