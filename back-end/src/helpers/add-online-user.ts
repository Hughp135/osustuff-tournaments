import { Schema } from 'mongoose';
import { cache } from '../services/cache';

// Update online players
setInterval(() => {
  const onlinePlayers: string[] = <string[]>cache.get('online-players') || [];
  for (const userId of onlinePlayers) {
    const isActive = cache.get(`user-active-${userId}`);
    if (!isActive) {
      const onlinePlayersUpdated = onlinePlayers.filter(id => id !== id);
      cache.put('online-players', onlinePlayersUpdated);
    }
  }
}, 10000);

export function addOnlineUser({ _id }: { _id: Schema.Types.ObjectId | string}) {
  const onlinePlayers: string[] = <string[]>cache.get('online-players');

  if (!onlinePlayers.includes(_id.toString())) {
    onlinePlayers.push(_id.toString());
    cache.put('online-players', onlinePlayers);
  }
}
