import { Cache } from 'memory-cache';

export const cache = new Cache();
const caching: { [key: string]: Promise<any> } = {};

export async function getDataOrCache(key: string, expires: number, func: () => Promise<any>) {
  const cached = cache.get(key);

  if (cached) {
    return cached; // Return cached data
  }

  if (caching[key]) {
    return await caching[key]; // Return the awaited promise
  }

  caching[key] = func(); // Save promise to state to avoid race conditions

  try {
    const data = await caching[key]; // Store the finished promise in cache
    cache.put(key, data, expires);
    delete caching[key];

    return data;
  } catch (e) {
    delete caching[key];
    throw e;
  }
}
