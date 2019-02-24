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
    const text = getOutput(output, params);

    if (logDebug) {
      console.log(`${chalk.whiteBright(timestamp)} ${text}`);
    }
    debugStream.write(`${timestamp} ${text}\n`);
  },
  verbose: (output: any, ...params: any[]) => {
    const timestamp = `[${getTimestamp()} VERB]`;
    const text = getOutput(output, params);

    if (logVerbose) {
      console.log(`${chalk.cyanBright(timestamp)} ${text}`);
    }
    verboseStream.write(`${timestamp} ${text}\n`);
  },
  info: (output: any, ...params: any[]) => {
    const timestamp = `[${getTimestamp()} INFO]`;
    const text = getOutput(output, params);

    if (logInfo) {
      console.log(`${chalk.greenBright(timestamp)} ${text}`);
    }
    infoStream.write(`${timestamp} ${text}\n`);
  },
  warn: (output: any, ...params: any[]) => {
    const timestamp = `[${getTimestamp()} WARN]`;
    const text = getOutput(output, params);

    if (logWarn) {
      console.log(`${chalk.yellowBright(timestamp)} ${text}`);
    }
    warnStream.write(`${timestamp} ${text}\n`);
  },
  error: (output: any, ...params: any[]) => {
    const timestamp = `[${getTimestamp()} ERRR]`;
    const text = getOutput(output, params);

    if (logError) {
      console.log(`${chalk.redBright(timestamp)} ${text}`);
    }
    errorStream.write(`${timestamp} ${text}\n`);
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

function getOutput(output: any, ...params: any[]): string {
  if (params.length === 0) {
    return output;
  }

  return `${output} ${params.map(x => JSON.stringify(x)).join(' ')}`;
}