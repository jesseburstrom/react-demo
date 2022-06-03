"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.routes = void 0;
const logInRoute_js_1 = require("./logInRoute.js");
const logRoute_js_1 = require("./logRoute.js");
const getLogRoute_js_1 = require("./getLogRoute.js");
const signUpRoute_js_1 = require("./signUpRoute.js");
const getTopScores_js_1 = require("./getTopScores.js");
const updateHighscore_js_1 = require("./updateHighscore.js");
const routes = () => {
    return [
        logRoute_js_1.logRoute,
        getLogRoute_js_1.getLogRoute,
        logInRoute_js_1.logInRoute,
        signUpRoute_js_1.signUpRoute,
        getTopScores_js_1.getTopScores,
        updateHighscore_js_1.updateHighscore,
    ];
};
exports.routes = routes;
