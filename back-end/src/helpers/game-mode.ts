export type modeName = 'standard' | 'taiko' | 'ctb' | 'mania';

export const gameModeNames: {[key: string]: modeName} = {
  0: 'standard',
  1: 'taiko',
  2: 'ctb',
  3: 'mania',
};

export const getModeName = (mode: string): modeName  => {
  if (gameModeNames[mode]) {
    return gameModeNames[mode];
  }

  return 'standard';
};
