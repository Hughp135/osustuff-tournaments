import { getUser, getUserRecent } from './osu-api';
import chai from 'chai';

const { expect } = chai;

describe.skip('osu-api', () => {
  it('gets user', async () => {
    const result = await getUser('Mongoose-');
    expect(result).to.exist; // tslint:disable-line:no-unused-expression
  });
  it('gets user recent scores', async () => {
    const result = await getUserRecent('Mongoose-');
    expect(result).to.exist; // tslint:disable-line:no-unused-expression
  });
});
