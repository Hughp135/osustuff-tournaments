import chalk from 'chalk';
import fs from 'fs';
import config from 'config';

const debugStream = fs.createWriteStream('./logs/debug.log');
const verboseStream = fs.createWriteStream('./logs/verbose.log');
const infoStream = fs.createWriteStream('./logs/info.log');
const warnStream = fs.createWriteStream('./logs/warn.log');
const errorStream = fs.createWriteStream('./logs/error.log');

let logDebug = false;
let logVerbose = false;
let logInfo = false;
let logWarn = false;
let logError = false;

const logLevel = config.get('LOG_LEVEL');

if (logLevel === 'debug') {
  logDebug = true;
  logVerbose = true;
  logInfo = true;
  logWarn = true;
  logError = true;
} else if (logLevel === 'verbose') {
  logVerbose = true;
  logInfo = true;
  logWarn = true;
  logError = true;
} else if (logLevel === 'info') {
  logInfo = true;
  logWarn = true;
  logError = true;
} else if (logLevel === 'warn') {
  logWarn = true;
  logError = true;
} else if (logLevel === 'error') {
  logError = true;
} else {
  throw new TypeError('LOG_LEVEL must be one of ["debug", "verbose", "info", "warn", "error"].');
}

export const logger = {
  debug: (output: any, ...params: any[]) => {
    const timestamp = `[${getTimestamp()} DEBG]`;

    console.log(`${chalk.whiteBright(timestamp)} ${output} ${params.join(' ')}`);
    debugStream.write(`${timestamp} ${output} ${params.map(x => JSON.stringify(x)).join(' ')}`);
  },
  verbose: (output: any, ...params: any[]) => {
    const timestamp = `[${getTimestamp()} VERB]`;

    console.log(`${chalk.cyanBright(timestamp)} ${output} ${params.join(' ')}`);
    verboseStream.write(`${timestamp} ${output} ${params.map(x => JSON.stringify(x)).join(' ')}`);
  },
  info: (output: any, ...params: any[]) => {
    const timestamp = `[${getTimestamp()} INFO]`;

    console.log(`${chalk.greenBright(timestamp)} ${output} ${params.join(' ')}`);
    infoStream.write(`${timestamp} ${output} ${params.map(x => JSON.stringify(x)).join(' ')}`);
  },
  warn: (output: any, ...params: any[]) => {
    const timestamp = `[${getTimestamp()} WARN]`;

    console.log(`${chalk.yellowBright(timestamp)} ${output} ${params.join(' ')}`);
    warnStream.write(`${timestamp} ${output} ${params.map(x => JSON.stringify(x)).join(' ')}`);
  },
  error: (output: any, ...params: any[]) => {
    const timestamp = `[${getTimestamp()} ERRR]`;

    console.log(`${chalk.redBright(timestamp)} ${output} ${params.join(' ')}`);
    errorStream.write(`${timestamp} ${output} ${params.map(x => JSON.stringify(x)).join(' ')}`);
  },
};

function getTimestamp() {
  const dateTime = new Date();

  const date = dateTime.toLocaleDateString('en', {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
  });

  const time = dateTime.toLocaleTimeString('en', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return `${date} ${time}`;
}
