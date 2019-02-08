import { transports, createLogger, format } from 'winston';

export const logger = createLogger({
  format: format.combine(format.timestamp()),
  transports: [
    new transports.Console({ format: format.simple() }),
    new transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: format.json(),
    }),
    new transports.File({
      filename: 'logs/info.log',
      level: 'info',
      format: format.json(),
    }),
  ],
});
