import bodyParser from 'body-parser';
import express from 'express';
import config from 'config';
import winston from 'winston';
import { getLobbies } from './lobbies';
import { getLobby } from './lobbies/get';
import { joinGame } from './lobbies/join-game';
import { verifyUser } from './user/verify';
import { checkVerified } from './user/check-verified';
import { getLobbyBeatmaps } from './lobbies/beatmaps';
import { getUsers } from './lobbies/get-users';
import { sendMessage } from './lobbies/messages/post';
import { getMessages } from './lobbies/messages/get';
import { leaveGame } from './lobbies/leave-game';
import cors from 'cors';
import { skipRound } from './lobbies/skip-round';
import { toggleMonitoring } from './lobbies/stop-monitoring';
import { getRoundScores } from './rounds/scores/get';

const PORT = config.get('API_PORT');
const app = express();

app.use(bodyParser.json());
app.use(cors());

app.get('', async (req, res) => res.send('Hello world!'));
app.get('/lobbies', async (req, res) => res.json(await getLobbies()));
app.get('/rounds/:roundId/scores', getRoundScores);
app.post('/lobbies/:id/join', joinGame);
app.post('/lobbies/:id/leave', leaveGame);
app.post('/lobbies/:id/skip-round', skipRound);
app.get('/lobbies/:id/beatmaps', getLobbyBeatmaps);
app.get('/lobbies/:id/users', getUsers);
app.get('/lobbies/:id/messages', getMessages);
app.post('/lobbies/:id/messages', sendMessage);
app.get('/lobbies/:id', getLobby);
app.post('/verify-user', verifyUser);
app.post('/check-verified', checkVerified);
app.post('/toggle-monitoring', toggleMonitoring);

export async function startServer() {
  await app.listen(PORT);
  winston.log('info', 'API started on port ' + PORT);
}
