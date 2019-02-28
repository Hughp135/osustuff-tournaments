import { Server, Socket } from 'socket.io';
import cookie from 'cookie';
import { verifyJWT } from '../../api/auth/jwt';

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
      return next();
    }

    try {
      (<any>socket).claim = await verifyJWT(cookies.jwt_token);

      return next();
    } catch (e) {
      console.error('Socket Auth Error', e);
      return next();
    }
  };
}
