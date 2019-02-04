import bodyParser from 'body-parser';
import express, { Router } from 'express';
import config from 'config';
import winston from 'winston';
import cors from 'cors';
import { getLobbies } from './lobbies';
import { getLobby } from './lobbies/get';
import { joinGame } from './lobbies/join-game';
import { verifyUser } from './user/verify';
import { checkVerified } from './user/check-verified';
import { getLobbyBeatmaps } from './lobbies/beatmaps';
import { getLobbyUsers } from './lobbies/get-users';
import { sendMessage } from './lobbies/messages/post';
import { getMessages } from './lobbies/messages/get';
import { leaveGame } from './lobbies/leave-game';
import { skipRound } from './lobbies/skip-round';
import { toggleMonitoring } from './lobbies/stop-monitoring';
import { getRound } from './rounds/get';
import { getUsers } from './users';
import { clearDb } from './admin/clear-db';
import { getUser } from './user/get-user';

const PORT = config.get('API_PORT');
const app = express();

app.use(bodyParser.json());
app.use(cors());

const router = Router();

router.get('', async (req, res) => res.send('Hello world!'));
router.get('/lobbies', async (req, res) => res.json(await getLobbies()));
router.get('/lobbies/:id/rounds/:roundNum', getRound);
router.post('/lobbies/:id/join', joinGame);
router.post('/lobbies/:id/leave', leaveGame);
router.post('/lobbies/:id/skip-round', skipRound);
router.get('/lobbies/:id/beatmaps', getLobbyBeatmaps);
router.get('/lobbies/:id/users', getLobbyUsers);
router.get('/lobbies/:id/messages', getMessages);
router.post('/lobbies/:id/messages', sendMessage);
router.get('/lobbies/:id', getLobby);
router.post('/verify-user', verifyUser);
router.post('/check-verified', checkVerified);
router.post('/toggle-monitoring', toggleMonitoring);
router.post('/admin/clear-db', clearDb);
router.get('/users', getUsers);
router.get('/user/:username', getUser);

app.use('/api', router);

export async function startServer() {
  winston.log('info', 'Environment ' + process.env.NODE_ENV);
  await app.listen(PORT);
  winston.log('info', 'API started on port ' + PORT);
}
