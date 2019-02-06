import { IGame } from 'src/models/Game.model';
import { Round } from 'src/models/Round.model';
import { Score, IScore } from 'src/models/Score.model';
import { ObjectId } from 'bson';
import { getOrCreateAchievement } from '../get-or-create-achievement';
import { User } from 'src/models/User.model';

export async function achievementVersatile(game: IGame) {
  const achievement = await getOrCreateAchievement(
    'Versatile',
    'Pass 4 rounds of a game using different mods',
    'yellow sliders horizontal',
  );

  const rounds = await Round.find({ gameId: game._id }).select({ _id: 1 });
  const scores = await Score.find({ roundId: rounds.map(r => r._id), passedRound: true }).sort({
    roundId: 1,
    score: -1,
    date: 1,
  });
  const scoresPerUser = scores.reduce(
    // reduce to 1 score per person per round
    (acc, curr) => {
      let usr = acc.find(s => s.userId === curr.userId.toHexString());
      if (!usr) {
        usr = { userId: curr.userId.toHexString(), scores: [], uniqueMods: [] };
        acc.push(usr);
      }
      if (!usr.scores.some(s => s.roundId.toString() === curr.roundId.toString())) {
        usr.scores.push(curr);
        usr.uniqueMods = usr.uniqueMods.filter(m => m !== curr.mods).concat(curr.mods);
      }

      return acc;
    },
    <Array<{ userId: string; scores: IScore[]; uniqueMods: number[] }>> [],
  );

  const userScores = scoresPerUser.filter(u => u.uniqueMods.length >= 3);
  const users = await User.find({ _id: userScores.map(u => u.userId) });

  await Promise.all(
    users.map(async user => {
      if (!user.achievements.some(a => a.achievementId.toString() === achievement._id.toString())) {
        user.achievements.push({ achievementId: achievement._id, progress: 1 });
        await user.save();
      }
    }),
  );
}
