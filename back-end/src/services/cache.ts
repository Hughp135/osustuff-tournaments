import { Cache } from 'memory-cache';

export const cache = new Cache();
const caching: { [key: string]: Promise<any> } = {};

export async function getDataOrCache(key: string, expires: number, func: () => Promise<any>) {
  const cached = cache.get(key);

  if (cached) {
    return cached;
  }

  const promiseInProgress = caching[key];

  if (promiseInProgress) {
    return await promiseInProgress;
  }

  const promise = func();
  caching[key] = promise;

  try {
    const data = await promise;
    cache.put(key, data, expires);
    delete caching[key];

    return data;
  } catch (e) {
    delete caching[key];
    throw e;
  }
}
