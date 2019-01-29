import mongoose from 'mongoose';
import config from 'config';

mongoose.set('useCreateIndex', true);

(async function start() {
  await mongoose.connect(
    'mongodb://127.0.0.1:' + config.get('DB_PORT') + '/osu-br',
    { useNewUrlParser: true },
  );

  // await Game.deleteMany({});
  // await User.deleteMany({});

  // const user = await User.create({
  //   username: 'Mongoose-',
  // });

  // const game = await createGame();
  // await addPlayer(game, {
  //   username: user.username,
  //   userId: user._id,
  //   alive: true,
  // });

  // await startMonitoring();
})().catch(e => console.error(e)); // tslint:disable-line
