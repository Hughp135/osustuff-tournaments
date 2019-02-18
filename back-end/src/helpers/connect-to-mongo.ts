import mongoose from 'mongoose';
import config from 'config';

export async function connectToMongo() {
  const baseUrl = process.env.CI_RUNNER ? 'mongodb://mongo' : 'mongodb://127.0.0.1';
  const dbName = process.env.NODE_ENV === 'test' ? 'osu-br-test' : 'osu-br';

  await mongoose.connect(
    `${baseUrl}:${config.get('DB_PORT')}/${dbName}`,
    {
      useNewUrlParser: true,
    },
  );
}

export async function disconnectFromMongo() {
  await mongoose.disconnect();
}
