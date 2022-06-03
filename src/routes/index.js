import { logInRoute } from "./logInRoute.js";
import { logRoute } from "./logRoute.js";
import { getLogRoute } from "./getLogRoute.js";
import { signUpRoute } from "./signUpRoute.js";
import { getTopScores } from "./getTopScores.js";
import { updateHighscore } from "./updateHighscore.js";

export const routes = () => {
  return [
    logRoute,
    getLogRoute,
    logInRoute,
    signUpRoute,
    getTopScores,
    updateHighscore,
  ];
};
