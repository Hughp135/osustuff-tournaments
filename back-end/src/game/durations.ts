import config from 'config';

export const COUNTDOWN_START = <number> config.get('COUNTDOWN_START');
export const DURATION_ROUND_ADDITIONAL = 60;
export const DURATION_ROUND_ENDED = 60;
