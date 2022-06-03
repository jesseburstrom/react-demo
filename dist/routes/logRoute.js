"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.logRoute = void 0;
const jwt = __importStar(require("jsonwebtoken"));
const db_1 = require("../db");
exports.logRoute = {
    path: "/api/log/:userId",
    method: "post",
    handler: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { authorization } = req.headers;
        const { userId } = req.params;
        const activity = req.body;
        console.log("in logRoute", activity, userId);
        if (!authorization) {
            console.log("No auth");
            return res.status(401).json({ message: "No authorization header sent" });
        }
        const token = authorization.split(" ")[1];
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => __awaiter(void 0, void 0, void 0, function* () {
            console.log("token ver");
            if (err)
                return res.status(401).json({ message: "Unable to verify token" });
            console.log("token verified");
            const { id } = decoded;
            if (id !== userId) {
                console.log("id mismatch");
                return res
                    .status(403)
                    .json({ message: "Not allowed to update that user's data" });
            }
            const db = (0, db_1.getDbConnection)("react-auth-db");
            const result = yield db
                .collection("logs")
                .findOneAndUpdate({ insertedId: userId }, { $push: { log: activity } }, { upsert: true, returnOriginal: false });
            console.log("result ", result);
            res.status(200).json(result.value);
        }));
    }),
};
