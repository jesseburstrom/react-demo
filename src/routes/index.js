import { logInRoute } from './logInRoute';
import { logRoute } from "./logRoute";
import { getLogRoute } from "./getLogRoute";
import { signUpRoute } from "./signUpRoute";
import { testRoute } from "./testRoute";
import { updateUserInfoRoute } from "./updateUserInfoRoute";
import { getTopScores } from './getTopScores';
import { updateHighscore } from './updateHighscore';

export const routes = [
  logRoute,
  getLogRoute,
  logInRoute,
  signUpRoute,
  testRoute,
  updateUserInfoRoute,
  getTopScores,
  updateHighscore,
];
