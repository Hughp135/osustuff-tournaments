import { IGame } from '../../models/Game.model';
import { IScore } from '../../models/Score.model';
import { getOrCreateAchievement } from '../get-or-create-achievement';
import { IUser } from '../../models/User.model';
import { IUserAchieved } from '../update-player-achievements';
import { getAppliedMods } from '../../helpers/get-applied-mods';

export async function modScores(
  allUsers: IUser[],
  passedScores: IScore[],
  game: IGame,
): Promise<IUserAchieved[]> {
  const versatile = await getOrCreateAchievement(
    'Versatile',
    'Pass four rounds with different mods in one match',
    'yellow sliders horizontal',
  );
  const vanilla = await getOrCreateAchievement(
    'Vanilla',
    'Win a match without using any mods',
    'grey circle outline',
  );
  const ninja = await getOrCreateAchievement(
    'Ninja',
    'Win a match using only Hidden',
    'grey user',
  );
  const hardAsRock = await getOrCreateAchievement(
    'Hard as Rock',
    'Win a match using only Hard Rock',
    'orange hand rock',
  );
  const speedDemon = await getOrCreateAchievement(
    'Speed Demon',
    'Win a match using only Double Time',
    'orange fighter jet',
  );
  const speedy = await getOrCreateAchievement(
    'Speedy',
    'Pass three rounds in one game with Double Time',
    'blue forward',
  );
  const dtGod = await getOrCreateAchievement(
    'DT God',
    'Pass five rounds in one game with Double Time',
    'red forward',
  );
  const confidence = await getOrCreateAchievement(
    'Confidence',
    'Pass five rounds using Sudden Death',
    'pink heartbeat',
  );
  const impeccable = await getOrCreateAchievement(
    'Impeccable',
    'Pass five rounds using Perfect',
    'pink thumbs up',
  );

  const achieved: IUserAchieved[] = [];

  const userMods: Array<{ userId: string; uniqueMods: number[] }> = [];
  for (const score of passedScores) {
    // Find a user we're already keeping track of.
    let modUser = userMods.find(x => x.userId === score.userId.toHexString());

    if (!modUser) {
      modUser = {
        userId: score.userId.toHexString(),
        uniqueMods: <number[]>[],
      };
      userMods.push(modUser);
    }

    // Add to unique mods if not already added.
    if (!modUser.uniqueMods.includes(score.mods)) {
      modUser.uniqueMods.push(score.mods);
    }
  }

  for (const userScore of userMods) {
    const user = allUsers.find(u => userScore.userId === u._id.toString());
    if (!user) {
      continue;
    }

    if (userScore.uniqueMods.length >= 4) {
      achieved.push({ user, achievement: versatile });
    }

    if (game.winningUser && user._id.toString() === game.winningUser.userId.toString()) {
      // If the user won the match...
      if (userScore.uniqueMods.length === 1) {
        // If the user only used one unique mod combination...
        if (userScore.uniqueMods[0] === 0) { // nomod
          achieved.push({ user, achievement: vanilla });
        } else if (userScore.uniqueMods[0] === 8) { // HD
          achieved.push({ user, achievement: ninja });
        } else if (userScore.uniqueMods[0] === 16) { // HR
          achieved.push({ user, achievement: hardAsRock });
        } else if (userScore.uniqueMods[0] === 64 || userScore.uniqueMods[0] === 576) { // DT / NC
          achieved.push({ user, achievement: speedDemon });
        }
      } else if (userScore.uniqueMods.length === 2) {
        // In case someone decides to use both DT and NC (weirdo).
        if (userScore.uniqueMods.includes(64) && userScore.uniqueMods.includes(576)) {
          achieved.push({ user, achievement: speedDemon });
        }
      }
    }
  }

  for (const user of allUsers) {
    const userScores = passedScores.filter(score => score.userId.toHexString() === user._id.toString());

    const dtScores = userScores.filter(score => getAppliedMods(score.mods).includes('DT'));
    if (dtScores.length >= 5) {
      achieved.push({ user, achievement: dtGod });
    }
    if (dtScores.length >= 3) {
      achieved.push({ user, achievement: speedy });
    }

    const pfScores = userScores.filter(score => getAppliedMods(score.mods).includes('PF'));
    if (pfScores.length >= 5) {
      // Don't give Impeccable if the user has fewer than five PF scores.
      achieved.push({ user, achievement: impeccable });
    } else {
      // Don't give Confidence if the user has fewer than five SD-only scores.
      const sdScores = userScores.filter(score =>
        getAppliedMods(score.mods).includes('SD') &&
        !getAppliedMods(score.mods).includes('PF'));
      if (sdScores.length >= 5) {
        achieved.push({ user, achievement: confidence });
      }
    }
  }

  return achieved;
}
