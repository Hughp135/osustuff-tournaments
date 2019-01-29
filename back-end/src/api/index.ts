import express from 'express';
import config from 'config';
import winston from 'winston';
import { getLobbies } from './lobbies';

const PORT = config.get('API_PORT');

const app = express();

app.get('/lobbies', async (req, res) => await getLobbies());

export async function startServer() {
  await app.listen(PORT);
  winston.log('info', 'API started on port ' + PORT);
}
