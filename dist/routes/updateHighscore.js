"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateHighscore = void 0;
//import jwt from "jsonwebtoken";
const db_1 = require("../db");
exports.updateHighscore = {
    path: "/UpdateHighscore",
    method: "post",
    handler: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const db = (0, db_1.getDbConnection)("top-scores");
        var results = [];
        try {
            switch (req.body.type) {
                case "Ordinary": {
                    console.log("getting ordinary game topscores");
                    yield db
                        .collection("ordinary")
                        .insertOne({ name: req.body.name, score: req.body.score });
                    results = yield db
                        .collection("ordinary")
                        .find({}, { _id: 0 })
                        .sort({ score: -1 })
                        .toArray();
                    break;
                }
                case "Mini": {
                    yield db
                        .collection("mini")
                        .insertOne({ name: req.body.name, score: req.body.score });
                    results = yield db
                        .collection("mini")
                        .find({}, { _id: 0 })
                        .sort({ score: -1 })
                        .toArray();
                    break;
                }
                case "Maxi": {
                    yield db
                        .collection("maxi")
                        .insertOne({ name: req.body.name, score: req.body.score });
                    results = yield db
                        .collection("maxi")
                        .find({}, { _id: 0 })
                        .sort({ score: -1 })
                        .toArray();
                    break;
                }
            }
            res.status(200).json(results);
        }
        catch (e) {
            console.log(e);
            res.sendStatus(500);
        }
    }),
};
