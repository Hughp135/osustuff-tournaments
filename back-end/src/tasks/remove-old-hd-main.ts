import { Achievement } from '../models/Achievement.model';
import { User } from '../models/User.model';
import mongoose from 'mongoose';
import config from 'config';

// Legacy: remove old achievement ('HD Main')
async function run() {
  await mongoose.connect(
    'mongodb://127.0.0.1:' + config.get('DB_PORT') + '/osu-br',
    {
      useNewUrlParser: true,
    },
  );
  console.log('a');
  const oldAchievement = await Achievement.findOne({ title: 'HD Main' });
  if (!oldAchievement) {
    console.log('HD Main achievement not found in DB');
    return;
  }
  const users = await User.find({});
  console.log('users count', users.length);
  let countDeleted = 0;
  let countUsersChecked = 0;
  for (const user of users) {
    if (
      user.achievements.some(
        a => a.achievementId.toHexString() === oldAchievement._id.toString(),
      )
    ) {
      user.achievements = user.achievements.filter(
        a => a.achievementId.toString() !== oldAchievement._id.toString(),
      );
      countDeleted++;
      await user.save();
    }
    countUsersChecked++;
  }

  await Achievement.deleteOne({ _id: oldAchievement._id });
  console.log(
    'Users chcked',
    countUsersChecked,
    'deleted achievements from users:',
    countDeleted,
  );
  await mongoose.disconnect();
}

run().catch(e => console.log(e));
