import { logInRoute } from "./logInRoute";
import { logRoute } from "./logRoute";
import { getLogRoute } from "./getLogRoute";
import { signUpRoute } from "./signUpRoute";
import { getTopScores } from "./getTopScores";
import { updateHighscore } from "./updateHighscore";

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
