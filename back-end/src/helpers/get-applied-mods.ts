const modEnums: { [key: string]: string } = {
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

export function getAppliedMods(value: number): string[] {
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

        return acc;
      },
      { modsEnum: value, modsArray: <any> [] },
    );

  return reduced.modsArray;
}
