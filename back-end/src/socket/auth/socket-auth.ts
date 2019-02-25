import { Server, Socket } from 'socket.io';
import cookie from 'cookie';
import { verifyJWT } from '../../api/auth/jwt';
import { User } from '../../models/User.model';

export interface ISocket extends SocketIO.Socket {
  claim: {
    user_id: string;
    username: string;
  };
}

export function socketAuth(io: Server) {
  return async (socket: Socket, next: (...args: any) => void) => {
    const cookieString = socket.handshake.headers.cookie;
    const cookies = cookie.parse(cookieString || '');

    if (!cookies.jwt_token) {
      console.info('No token provided');
      return next();
    }

    try {
      (<any>socket).claim = await verifyJWT(cookies.jwt_token);
      const user: any = await User.findOne({
        osuUserId: (<any>socket).claim.user_id,
      });

      if (!user) {
        console.info('user not found', (<any>socket).claim);
        return next(new Error('User not found'));
      }
      // user.socket_id = socket.id;
      // await user.save();

      console.log('User connected', user.username);

      return next();
    } catch (e) {
      console.error('Socket Auth Error', e);
      return next(new Error('Invalid token'));
    }
  };
}
