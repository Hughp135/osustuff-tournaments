const modEnums = {
  4194304: 'CN',
  2097152: 'RD',
  1048576: 'FI',
  16384: 'PF',
  8192: 'AP',
  4096: 'SO',
  2048: 'AU',
  1024: 'FL',
  512: 'NC', // Only set along with DoubleTime. i.e: NC only gives 576
  256: 'HT',
  128: 'RX',
  64: 'DT',
  32: 'SD',
  16: 'HR',
  8: 'HD',
  4: 'TD',
  2: 'EZ',
  1: 'NF',
};

export function getAppliedMods(value): string[] {
  const num = parseInt(value, 10);
  if (value === 0) {
    return [];
  }

  const reduced = Object.keys(modEnums)
    .sort((key1, key2) => parseInt(key2, 10) - parseInt(key1, 10))
    .reduce(
      (acc, key) => {
        const val = modEnums[key];
        const keyParsed = parseInt(key, 10);

        if (acc.modsEnum >= keyParsed) {
          acc.modsEnum = acc.modsEnum - keyParsed;
          acc.modsArray.push(val);
        }

        // Check if NC and DT exist, if so leave only NC
        if (
          acc.modsArray.indexOf(modEnums[512]) !== -1 &&
          acc.modsArray.indexOf(modEnums[64]) !== -1
        ) {
          const dtIndex = acc.modsArray.indexOf(modEnums[64]);
          acc.modsArray.splice(dtIndex, 1);
        }

        // Check if PF and SD exist, if so leave only PF
        if (
          acc.modsArray.indexOf(modEnums[16384]) !== -1 &&
          acc.modsArray.indexOf(modEnums[32]) !== -1
        ) {
          const sdIndex = acc.modsArray.indexOf(modEnums[32]);
          acc.modsArray.splice(sdIndex, 1);
        }

        return acc;
      },
      { modsEnum: num, modsArray: [] },
    );

  return reduced.modsArray;
}
