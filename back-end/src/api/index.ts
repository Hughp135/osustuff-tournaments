import bodyParser from 'body-parser';
import express from 'express';
import config from 'config';
import winston from 'winston';
import { getLobbies } from './lobbies';
import { getLobby } from './lobbies/get';
import { joinGame } from './lobbies/join-game';
import { verifyUser } from './user/verify';
import { checkVerified } from './user/check-verified';

const PORT = config.get('API_PORT');
const app = express();

app.use(bodyParser.json());

app.get('', async (req, res) => res.send('Hello world!'));
app.get('/lobbies', async (req, res) => res.json(await getLobbies()));
app.post('/lobbies/:id/join', joinGame);
app.get('/lobbies/:id', getLobby);
app.post('/verify-user', verifyUser);
app.post('/check-verified', checkVerified);

export async function startServer() {
  await app.listen(PORT);
  winston.log('info', 'API started on port ' + PORT);
}
