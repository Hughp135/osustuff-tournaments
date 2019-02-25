export function randomFromArray(array: any[]) {
  const index = Math.floor(Math.random() * array.length);
  return array[index];
}
