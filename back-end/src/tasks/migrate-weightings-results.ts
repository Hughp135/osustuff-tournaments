import { User } from '../models/User.model';
import config from 'config';
import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb://127.0.0.1:' + config.get('DB_PORT') + '/osu-br', {
    useNewUrlParser: true,
  });
  // Reset all user results
  let count = 0;
  let updated = 0;
  await User.find()
    .cursor()
    .eachAsync(async user => {
      let changed = false;
      if (user.results.length) {
        user.results = [];
        changed = true;
      }
      if (!user.rating.weighted) {
        user.rating.weighted = user.rating.mu - 3 * user.rating.sigma;
        changed = true;
      }

      count++;
      if (changed) {
        updated++;
        await user.save();
      }
    });

  console.log(`Updated ${updated} out of ${count} total users`);
  await mongoose.disconnect();
}

run().catch(e => console.log(e));
