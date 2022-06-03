"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.routes = void 0;
const logInRoute_1 = require("./logInRoute");
const logRoute_1 = require("./logRoute");
const getLogRoute_1 = require("./getLogRoute");
const signUpRoute_1 = require("./signUpRoute");
const getTopScores_1 = require("./getTopScores");
const updateHighscore_1 = require("./updateHighscore");
const routes = () => {
    return [
        logRoute_1.logRoute,
        getLogRoute_1.getLogRoute,
        logInRoute_1.logInRoute,
        signUpRoute_1.signUpRoute,
        getTopScores_1.getTopScores,
        updateHighscore_1.updateHighscore,
    ];
};
exports.routes = routes;
