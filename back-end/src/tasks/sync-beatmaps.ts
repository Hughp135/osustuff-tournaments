import mongoose from 'mongoose';
import config from 'config';
import { Beatmap } from '../models/Beatmap.model';

async function start() {
  await mongoose.connect('mongodb://127.0.0.1:' + config.get('DB_PORT') + '/osu-br', {
    useNewUrlParser: true,
  });
  const beatmaps = await Beatmap.find({});

  console.log('beatmaps length', beatmaps.length);
}

start().catch(e => console.log(e));
