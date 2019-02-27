import chalk, { Chalk } from 'chalk';
import fs from 'fs';
import config from 'config';

const logLevel = config.get('LOG_LEVEL');
const logToFile = config.get('LOG_TO_FILE');

const levelStream: { [level: string]: fs.WriteStream; } = {};

if (logToFile) {
  levelStream.debug = fs.createWriteStream('./logs/debug.log');
  levelStream.verbose = fs.createWriteStream('./logs/verbose.log');
  levelStream.info = fs.createWriteStream('./logs/info.log');
  levelStream.warn = fs.createWriteStream('./logs/warn.log');
  levelStream.error = fs.createWriteStream('./logs/error.log');
}

export const logger = {
  log(
    level: number,
    name: string,
    short: string,
    input: any,
    params: any[],
    color?: Chalk,
    output?: (m: any, ...o: any[]) => void) {

    const timestamp = `[${getTimestamp()} ${short}]`;

    if (logLevel <= level && output && color) {
      output(`${color(timestamp)} ${input}`, ...params);
    }

    if (logToFile && levelStream[name]) {
      levelStream[name].write(`${timestamp} ${input} ${params.join(' ')}\n`);
    }
  },

  debug(input: any, ...params: any[]) {
    this.log(5, 'debug', 'DEBG', input, params, chalk.whiteBright, console.debug);
  },
  verbose(input: any, ...params: any[]) {
    this.log(4, 'verbose', 'VERB', input, params, chalk.cyanBright, console.debug);
  },
  info(input: any, ...params: any[]) {
    this.log(3, 'info', 'INFO', input, params, chalk.greenBright, console.info);
  },
  warn(input: any, ...params: any[]) {
    this.log(2, 'warn', 'WARN', input, params, chalk.yellowBright, console.warn);
  },
  error(input: any, ...params: any[]) {
    this.log(1, 'error', 'ERRR', input, params, chalk.redBright, console.error);
  },
};

const isoRegex = /(?:\d*?)(\d{2})\-(\d{2})\-(\d{2})T(\d{2}):(\d{2}):(\d{2}).+/g;
function getTimestamp() {
  const now = new Date();
  const dateTime = new Date(now.getTime() - 60000 * now.getTimezoneOffset()).toISOString();

  return dateTime.replace(isoRegex, '$1/$2/$3 $4:$5:$6');
}
