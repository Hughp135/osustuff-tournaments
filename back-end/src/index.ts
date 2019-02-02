import mongoose from 'mongoose';
import config from 'config';
import { startMonitoring } from './game/monitor-running-games';
import { startServer } from './api';
import winston from 'winston';

winston.add(new winston.transports.File({ filename: 'winston.log' }));
winston.add(new winston.transports.Console());

mongoose.set('useCreateIndex', true);

(async function start() {
  await mongoose.connect(
    'mongodb://127.0.0.1:' + config.get('DB_PORT') + '/osu-br',
    { useNewUrlParser: true },
  );
  await startServer();
  await startMonitoring();
})().catch(e => console.error(e)); // tslint:disable-line
