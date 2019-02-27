import config from 'config';
import winston from 'winston';
import Chalk from 'chalk';
import { TransformableInfo } from 'logform';

const isoRegex = /(?:\d*?)(\d{2})\-(\d{2})\-(\d{2})T(\d{2}):(\d{2}):(\d{2}).+/g;

const logLevel: string = config.get('LOG_LEVEL');
const logToFile: string = config.get('LOG_TO_FILE');

const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(formatFunction)),
});

// Multiple loggers to ensure log-file exclusivity.
const debugLogger = winston.createLogger({ level: logLevel });
const verboseLogger = winston.createLogger({ level: logLevel });
const infoLogger = winston.createLogger({ level: logLevel });
const warnLogger = winston.createLogger({ level: logLevel });
const errorLogger = winston.createLogger({ level: logLevel });

export const logger = {
  debug(message?: any, ...meta: any[]) {
    debugLogger.debug(message, ...meta);
  },
  verbose(message?: any, ...meta: any[]) {
    verboseLogger.verbose(message, ...meta);
  },
  info(message?: any, ...meta: any[]) {
    infoLogger.info(message, ...meta);
  },
  warn(message?: any, ...meta: any[]) {
    warnLogger.warn(message, ...meta);
  },
  error(message?: any, ...meta: any[]) {
    errorLogger.error(message, ...meta);
  },
};

debugLogger.add(consoleTransport);
verboseLogger.add(consoleTransport);
infoLogger.add(consoleTransport);
warnLogger.add(consoleTransport);
errorLogger.add(consoleTransport);

if (logToFile) {
  debugLogger.add(new winston.transports.File({ filename: './logs/debug.log', level: 'debug' }));
  verboseLogger.add(new winston.transports.File({ filename: './logs/verbose.log', level: 'verbose' }));
  infoLogger.add(new winston.transports.File({ filename: './logs/info.log', level: 'info' }));
  warnLogger.add(new winston.transports.File({ filename: './logs/warn.log', level: 'warn' }));
  errorLogger.add(new winston.transports.File({ filename: './logs/error.log', level: 'error' }));
}

function formatFunction(info: TransformableInfo) {
  const formatting = getFormattingFromLevel(info.level);

  return `${formatting.color(`[${getTimestamp(info.timestamp)} ${formatting.short}]`)} ${info.message}`;
}

function getFormattingFromLevel(level: string) {
  switch (level) {
    case 'debug':
      return { short: 'DEBG', color: Chalk.gray, out: console.debug };
    case 'verbose':
      return { short: 'VERB', color: Chalk.cyanBright, out: console.debug };
    case 'info':
      return { short: 'INFO', color: Chalk.greenBright, out: console.info };
    case 'warn':
      return { short: 'WARN', color: Chalk.yellowBright, out: console.warn };
    case 'error':
      return { short: 'ERRR', color: Chalk.redBright, out: console.info };
  }

  return { short: '????', color: Chalk.blackBright, out: console.error };
}

function getTimestamp(timestamp: string) {
  return timestamp.replace(isoRegex, '$1/$2/$3 $4:$5:$6');
}

logger.debug('asd');
logger.verbose('asd');
logger.info('asd');
logger.warn('asd');
logger.error('asd');
console.log(logLevel);
