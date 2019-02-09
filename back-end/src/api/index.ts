import bodyParser from 'body-parser';
import express, { Router } from 'express';
import config from 'config';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { getLobbies } from './lobbies';
import { getLobby } from './lobbies/get';
import { joinGame } from './lobbies/join-game';
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
import { loginVerify } from './user/login-verify';
import { authMiddleware } from './auth/jwt-middleware';
import { getUnreadAchievements } from './user/get-achievements';
import { logger } from '../logger';
import { makeScheduledGame } from './admin/create-scheduled-game';
import { toggleAutoCreateReq } from './admin/toggle-auto-create';
import { deleteLobby } from './admin/delete-lobby';

const PORT = config.get('API_PORT');
const TEST_MODE = config.get('TEST_MODE');
const app = express();
const limiter = new rateLimit({
  windowMs: 60 * 1000, // time for requests
  max: 500, // limit each IP to x requests per windowMs
});

if (!TEST_MODE) {
  app.use(limiter);
}

app.use(bodyParser.json());
app.use(cors());
app.use(cookieParser());

const router = Router();

router.get('', async (req, res) => res.send('Hello world!'));
router.get('/lobbies', getLobbies);
router.get('/lobbies/:id/rounds/:roundNum', getRound);
router.post('/lobbies/:id/join', authMiddleware, joinGame);
router.post('/lobbies/:id/leave', authMiddleware, leaveGame);
router.post('/lobbies/:id/skip-round', skipRound);
router.get('/lobbies/:id/beatmaps', getLobbyBeatmaps);
router.get('/lobbies/:id/users', getLobbyUsers);
router.get('/lobbies/:id/messages', getMessages);
router.post('/lobbies/:id/messages', authMiddleware, sendMessage);
router.get('/lobbies/:id', getLobby);
router.post('/toggle-monitoring', toggleMonitoring);
router.post('/admin/clear-db', clearDb);
router.post('/admin/schedule-game', makeScheduledGame);
router.post('/admin/toggle-autocreate', toggleAutoCreateReq);
router.post('/admin/delete-lobby', deleteLobby);
router.get('/users', getUsers);
router.get('/unread-achievements', authMiddleware, getUnreadAchievements);
router.get('/user/me', authMiddleware, getUser);
router.get('/user/:username', getUser);
router.get('/login-verify', loginVerify);

app.use('/api', router);

export async function startServer() {
  logger.info('Environment ' + process.env.NODE_ENV);
  await app.listen(PORT);
  logger.info('API started on port ' + PORT);
}
