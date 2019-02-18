import mongoose from 'mongoose';
import config from 'config';
import { startMonitoring } from './game/monitor-running-games';
import { startServer } from './api';
import { cache } from './services/cache';
import { connectToMongo } from './helpers/connect-to-mongo';

if (process.env.NODE_ENV !== 'production') {
  require('source-map-support').install();
}
process.on('unhandledRejection', console.error);

mongoose.set('useCreateIndex', true);

(async function start() {
  await connectToMongo();
  cache.put('online-players', []);
  await startServer();
  await startMonitoring();
})().catch(e => console.error(e)); // tslint:disable-line
