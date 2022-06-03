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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const index_1 = require("./routes/index");
const db_1 = require("./db");
const path = __importStar(require("path"));
const uuid_1 = require("uuid");
const cors_1 = __importDefault(require("cors"));
const ws_1 = __importDefault(require("ws"));
const socket_io_1 = require("socket.io");
const http_1 = require("http");
const PORT = process.env.PORT || 8000;
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
const httpServer = (0, http_1.createServer)(app);
const isOnline = false;
const localFlutterDir = "C:/Users/J/StudioProjects/flutter_system";
const localReactDir = "C:/Users/J/Desktop/proj";
if (isOnline) {
    app.use(express_1.default.static(path.join(__dirname, "/build")));
    app.use(express_1.default.static(path.join(__dirname, "/web")));
    app.use(express_1.default.static(path.join(__dirname, "/web/UnityLibrary")));
}
else {
    app.use(express_1.default.static(localReactDir + "/build"));
    app.use(express_1.default.static(localFlutterDir + "/build/web"));
    app.use(express_1.default.static(localFlutterDir + "/build/web/UnityLibrary"));
    app.use(express_1.default.static(localFlutterDir + "/build/web/UnityLibrary/Build"));
}
app.use(express_1.default.json());
// Add all the routes to our Express server
// exported from routes/index.js
(0, index_1.routes)().forEach((route) => {
    app[route.method](route.path, route.handler);
});
////////////////////////////////// YATZY //////////////////////////////////
//const server = http.createServer(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
    transports: ["websocket"],
});
const wss = new ws_1.default.Server({ port: 8001 }, () => {
    console.log("server started");
});
var CLIENTS = [];
wss.on("connection", (ws, req) => {
    console.log("Client connected Websocket");
    var unityId = (0, uuid_1.v4)();
    console.log("unityId : " + unityId);
    CLIENTS.push({ ws: ws, unityId: unityId });
    // Send uuid to Unity to send on to Flutter to communicate between!
    ws.send(JSON.stringify({ actionUnity: "unityIdentifier", unityId: unityId }));
    ws.on("message", (data) => {
        console.log("data recieved " + data);
        CLIENTS.map((client) => {
            if (client === ws) {
                console.log("FOUND CLIENT!!!");
            }
            return client;
        });
    });
});
var games = [];
var gameId = 0;
var clients = [];
io.on("connect", (socket) => {
    console.log("client connect...", socket.id);
    socket.on("sendToClients", (data) => {
        for (var i = 0; i < data["playerIds"].length; i++) {
            if (data["playerIds"][i] != socket.id && data["playerIds"][i] != "") {
                io.to(data["playerIds"][i]).emit("onClientMsg", data);
            }
        }
    });
    socket.on("connectReact", (data) => {
        console.log("connectReact");
        // Save client and corresponding ip address, set timer to mark activity, after some limit remove to prevent abandoned or hung connections
        if (isOnline) {
            console.log("IP: ", socket.handshake.headers["x-real-ip"]);
            clients.push({
                timer: Date.now(),
                idReact: socket.id,
                idFlutter: "",
                idUnity: -1,
                ip: socket.handshake.headers["x-real-ip"],
                settings: data,
                serverId: "",
            });
        }
        else {
            clients.push({
                timer: Date.now(),
                idReact: socket.id,
                idFlutter: "",
                idUnity: -1,
                ip: socket.conn.remoteAddress,
                settings: data,
                serverId: "",
            });
        }
        io.to(socket.id).emit("startFlutter", "");
    });
    socket.on("sendToServer", (data) => {
        switch (data["action"]) {
            case "flutterToUnity": {
                // Get Unity ws 'client' and pass on data
                CLIENTS.map((client) => {
                    if (data["unityId"] === client.unityId) {
                        console.log("Found client send to unity: " +
                            data["actionUnity"] +
                            " " +
                            client.unityId +
                            " " +
                            data["location"]);
                        client.ws.send(JSON.stringify(data));
                    }
                    return client;
                });
                break;
            }
            case "saveSettings": {
                clients = clients.map((client) => {
                    if (client.idFlutter === socket.id) {
                        console.log("saveSettings nodejs");
                        io.to(client.idReact).emit("saveSettings", data);
                    }
                    return client;
                });
                break;
            }
            // Marks the connection of the Flutter part of the client, if no react create standalone connection
            case "getId": {
                console.log("getId");
                // By checking ip address and using latest React connection to pair Flutter the probability is good it is right connection.
                // Only if two clients connect at exact same time and the first have longer time starting Flutter could there be a mixup.
                // At this pairing we send each client an uuid to identify after disconnect/reconnect events.
                var serverId = (0, uuid_1.v4)();
                if (isOnline) {
                    var isSet = false;
                    clients = clients.map((client) => {
                        if (client.ip === socket.handshake.headers["x-real-ip"] &&
                            client.idFlutter === "" &&
                            !isSet) {
                            data["settings"] = client.settings;
                            isSet = true;
                            console.log("flutter paired with react");
                            io.to(client.idReact).emit("setServerId", { serverId: serverId });
                            io.to(socket.id).emit("onServerMsg", {
                                action: "setServerId",
                                serverId: serverId,
                            });
                            return Object.assign(Object.assign({}, client), { idFlutter: socket.id, serverId: serverId });
                        }
                        else {
                            return client;
                        }
                    });
                    // No react match create standalone
                    if (!isSet) {
                        clients.push({
                            timer: Date.now(),
                            idReact: "",
                            idFlutter: socket.id,
                            idUnity: -1,
                            ip: socket.handshake.headers["x-real-ip"],
                            settings: [],
                        });
                    }
                }
                else {
                    var isSet = false;
                    clients = clients.map((client) => {
                        if (client.idFlutter === "" && !isSet) {
                            data["settings"] = client.settings;
                            isSet = true;
                            return Object.assign(Object.assign({}, client), { idFlutter: socket.id });
                        }
                        else {
                            return client;
                        }
                    });
                    if (!isSet) {
                        clients.push({
                            timer: Date.now(),
                            idReact: "",
                            idFlutter: socket.id,
                            idUnity: -1,
                            ip: socket.conn.remoteAddress,
                            settings: [],
                        });
                    }
                }
                data["id"] = socket.id;
                data["action"] = "onGetId";
                io.to(socket.id).emit("onServerMsg", data);
                if (games.length > 0) {
                    console.log("sending init games data");
                    io.emit("onServerMsg", { action: "onRequestGames", Games: games });
                }
                break;
            }
            case "removeGame": {
                games = games.filter((game) => game["gameId"] !== data["gameId"]);
                console.log("removed game");
                io.emit("onServerMsg", { action: "onRequestGames", Games: games });
                break;
            }
            case "requestJoinGame": {
                console.log("Try Join Game: ");
                //Find game from gameId and see if still availible and user not already connected
                for (var i = 0; i < games.length; i++) {
                    if (data["gameId"] === games[i]["gameId"]) {
                        if (games[i]["connected"] < games[i]["nrPlayers"] &&
                            games[i]["playerIds"].indexOf(socket.id) === -1) {
                            // Connect player to game
                            games[i]["playerIds"][games[i]["connected"]] = socket.id;
                            games[i]["userNames"][games[i]["connected"]] = data["userName"];
                            games[i]["connected"]++;
                            var game = games[i];
                            removePlayer(i);
                            //  issue new game possibly
                            if (game["nrPlayers"] === game["connected"]) {
                                // Send start game to players
                                game["action"] = "onGameStart";
                                game["gameStarted"] = true;
                                for (var i = 0; i < game["playerIds"].length; i++) {
                                    io.to(game["playerIds"][i]).emit("onServerMsg", game);
                                }
                            }
                            io.emit("onServerMsg", {
                                action: "onRequestGames",
                                Games: games,
                            });
                        }
                        break;
                    }
                }
                break;
            }
            case "requestGame": {
                if (data["nrPlayers"] === 1) {
                    // Sologame send start and save game
                    data["action"] = "onGameStart";
                    data["gameId"] = gameId++;
                    data["playerIds"][0] = socket.id;
                    data["userNames"][0] = data["userName"];
                    data["connected"] = 1;
                    data["gameStarted"] = true;
                    removePlayer();
                    games.push(data);
                    io.to(socket.id).emit("onServerMsg", data);
                    io.emit("onServerMsg", { action: "onRequestGames", Games: games });
                    return;
                }
                var foundGame = -1;
                for (var i = 0; i < games.length; i++) {
                    if (data["gameType"] === games[i]["gameType"] &&
                        data["nrPlayers"] === games[i]["nrPlayers"] &&
                        games[i]["connected"] < games[i]["nrPlayers"]) {
                        foundGame = i;
                        break;
                    }
                }
                if (foundGame === -1) {
                    data["playerIds"][0] = socket.id;
                    data["connected"] = 1;
                    data["gameId"] = gameId++;
                    data["userNames"][0] = data["userName"];
                    removePlayer();
                    games.push(data);
                }
                else {
                    // If id already present do nothing
                    if (games[i]["playerIds"].indexOf(data["playerIds"]) !== -1) {
                        return;
                    }
                    games[i]["playerIds"][games[i]["connected"]] = socket.id;
                    games[i]["userNames"][games[i]["connected"]] = data["userName"];
                    games[i]["connected"]++;
                    removePlayer(i);
                    if (games[i]["nrPlayers"] === games[i]["connected"]) {
                        var game = games[i];
                        // Send start game to players
                        game["action"] = "onGameStart";
                        game["gameStarted"] = true;
                        for (var i = 0; i < game["playerIds"].length; i++) {
                            io.to(game["playerIds"][i]).emit("onServerMsg", game);
                        }
                    }
                }
                io.emit("onServerMsg", { action: "onRequestGames", Games: games });
                break;
            }
        }
    });
    function removePlayer(exclude = -1) {
        // remove player from ongoing games loop backwards not to break indexing
        // if only one player or game started issue game abort
        var j = games.length;
        while (j--) {
            if (j !== exclude && games[j]["playerIds"].indexOf(socket.id) !== -1) {
                console.log("loop:" + j.toString());
                games[j]["connected"]--;
                if (games[j]["connected"] === 0) {
                    games.splice(j, 1);
                }
                else if (games[j]["gameStarted"]) {
                    // Set player as inactive by clearing the userId
                    games[j]["playerIds"][games[j]["playerIds"].indexOf(socket.id)] = "";
                }
                else {
                    var index = games[j]["playerIds"].indexOf(socket.id);
                    games[j]["playerIds"].splice(index, 1);
                    games[j]["playerIds"].splice(games[j]["playerIds"].length, 0, "");
                    games[j]["userNames"].splice(index, 1);
                    games[j]["userNames"].splice(games[j]["playerIds"].length, 0, "");
                    console.log("removed player from game:");
                }
            }
        }
    }
    socket.on("disconnect", () => {
        removePlayer();
        io.emit("onServerMsg", { action: "onRequestGames", Games: games });
        console.log("client disconnect...", socket.id);
    });
});
app.get("/flutter", (req, res) => {
    if (isOnline) {
        res.sendFile("/web/index.html", { root: __dirname });
    }
    else {
        res.sendFile(localFlutterDir + "/build/web/index.html");
    }
});
app.get("/unity", (req, res) => {
    if (isOnline) {
        res.sendFile("/web/UnityLibrary/index.html", { root: __dirname });
    }
    else {
        res.sendFile(localFlutterDir + "/build/web/UnityLibrary/index.html");
    }
});
app.get("*", (req, res) => {
    if (isOnline) {
        res.sendFile(path.join(__dirname + "/build/index.html"));
    }
    else {
        res.sendFile(localReactDir + "/build/index.html");
    }
});
(0, db_1.initializeDbConnection)().then(() => {
    httpServer.listen(PORT, () => {
        console.log(`Server is listening on port ${PORT}`);
    });
});
