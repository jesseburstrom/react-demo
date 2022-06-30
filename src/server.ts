import express from "express";
import { routes } from "./routes/index";
import { initializeDbConnection } from "./db";
import * as path from "path";
import { v4 as uuidv4 } from "uuid";
import cors from "cors";
import WebSocket from "ws";
import { Server } from "socket.io";
import { createServer } from "http";

const PORT: number = 8000;

const app = express();

// Important client has local ip (like 192.168.0.168) not 127.0.0.1 or localhost in browser to work on local developement across different computers
// Local client connect should look like : http://192.168.0.168:8080 , or your local network ip instead of 192.168.0.168
// Also with port number this should not be there ssl online since all is taken care of with nginx or similar routing port 80 to prefeerably 8080
// for Https, socket.io and WebSocket. Requirement of Google Platform app engine flex only one port and is possible! but also convinient!
app.use(cors());

const httpServer = createServer(app);

// All 4 systems NodeJS, Flutter, Unity and React has this flag to differ from local developement and online publish
// One improvement could be global system flag all systems look at so avoid funny errors missing to reset flag... :)
// Got idea from meetup to signal in running code visually if offline/online good idea!
let isOnline: boolean = true;

const localFlutterDir: string = "C:/Users/J/StudioProjects/flutter_system";
const localReactDir: string = "C:/Users/J/Desktop/proj";

if (isOnline) {
  app.use(express.static(path.join(__dirname, "/build")));
  app.use(express.static(path.join(__dirname, "/web")));
  app.use(express.static(path.join(__dirname, "/web/UnityLibrary")));
} else {
  app.use(express.static(localReactDir + "/build"));
  app.use(express.static(localFlutterDir + "/build/web"));
  app.use(express.static(localFlutterDir + "/build/web/UnityLibrary"));
  app.use(express.static(localFlutterDir + "/build/web/UnityLibrary/Build"));
}

app.use(express.json());

// Add all the routes to our Express server
// exported from routes/index.js
routes().forEach((route) => {
  app[route.method](route.path, route.handler);
});
////////////////////////////////// YATZY //////////////////////////////////

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  transports: ["websocket"],
});

// Websocket server (ws) cannot work over lan unless https fix for lack of CORS
// Why I choose to script development and work strictly 'online' on a diffeent developement page with full https
// Only way to debug and test on mobile seems without hazzle but also if debug environment same as publish also good!
const wss = new WebSocket.Server({ port: 8001 }, () => {
  console.log("server started");
});

interface ClientsUnity {
  ws: any;
  unityId: string;
}
var CLIENTS: ClientsUnity[] = [];

wss.on("connection", (ws, req) => {
  console.log("Client connected Websocket");
  var unityId = uuidv4();
  console.log("unityId : " + unityId);
  CLIENTS.push({ ws: ws, unityId: unityId });
  // Send uuid to Unity to send on to Flutter to communicate between!
  ws.send(JSON.stringify({ actionUnity: "unityIdentifier", unityId: unityId }));

  ws.on("message", (data) => {
    console.log("data recieved " + data);
  });
});

var games: any[] = [];
var gameId: number = 0;
var clients: any[] = [];

var presentations: any[] = [];
var presentationId: number = 0;

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
    } else {
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
      case "startPresentation": {
        data["action"] = "onPresentationStart";
        data["presentationId"] = presentationId++;

        //presentations.push(data);
        presentations = [data];
        io.to(socket.id).emit("onServerMsg", data);
        io.emit("onServerMsg", {
          action: "onRequestPresentation",
          Presentations: presentations,
        });
        return;

        break;
      }

      case "requestJoinPresentation": {
        console.log("Try Join Presentation: ");
        presentations.map((presentation) => {
          if (presentation.presentationId === data["presentationId"]) {
            return {
              ...presentation,
              playerIds: presentation.playerIds.push(socket.id),
              userNames: presentation.userNames.push(data.userName),
              connected: presentation.connected++,
            };
          } else {
            return presentation;
          }
        });
        io.emit("onServerMsg", {
          action: "onRequestPresentation",
          Presentations: presentations,
        });
        break;
      }

      case "updatePresentation": {
        presentations.map((presentation) => {
          if (presentation.presentationId === data["presentationId"]) {
            return {
              ...presentation,
              slideIndex: data["slideIndex"],
            };
          } else {
            return presentation;
          }
        });
        io.emit("onServerMsg", {
          action: "onRequestPresentation",
          Presentations: presentations,
        });
        break;
      }

      case "flutterToUnity": {
        // Get Unity ws 'client' and pass on data
        CLIENTS.map((client) => {
          if (data["unityId"] === client.unityId) {
            console.log(
              "Found client send to unity: " +
                data["actionUnity"] +
                " " +
                client.unityId
            );

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
        var serverId = uuidv4();
        if (isOnline) {
          var isSet: boolean = false;
          clients = clients.map((client) => {
            if (
              client.ip === socket.handshake.headers["x-real-ip"] &&
              client.idFlutter === "" &&
              !isSet
            ) {
              data["settings"] = client.settings;
              isSet = true;
              console.log("flutter paired with react");
              io.to(client.idReact).emit("setServerId", { serverId: serverId });
              io.to(socket.id).emit("onServerMsg", {
                action: "setServerId",
                serverId: serverId,
              });
              return { ...client, idFlutter: socket.id, serverId: serverId };
            } else {
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
        } else {
          var isSet: boolean = false;
          clients = clients.map((client) => {
            if (client.idFlutter === "" && !isSet) {
              data["settings"] = client.settings;
              isSet = true;
              return { ...client, idFlutter: socket.id };
            } else {
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
        if (presentations.length > 0) {
          io.emit("onServerMsg", {
            action: "onRequestPresentation",
            Presentations: presentations,
          });
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
            if (
              games[i]["connected"] < games[i]["nrPlayers"] &&
              games[i]["playerIds"].indexOf(socket.id) === -1
            ) {
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
          if (
            data["gameType"] === games[i]["gameType"] &&
            data["nrPlayers"] === games[i]["nrPlayers"] &&
            games[i]["connected"] < games[i]["nrPlayers"]
          ) {
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
        } else {
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

  function removePlayer(exclude: number = -1): void {
    // remove player from ongoing games loop backwards not to break indexing
    // if only one player or game started issue game abort
    var j: number = games.length;
    while (j--) {
      if (j !== exclude && games[j]["playerIds"].indexOf(socket.id) !== -1) {
        games[j]["connected"]--;
        if (games[j]["connected"] === 0) {
          games.splice(j, 1);
        } else if (games[j]["gameStarted"]) {
          // Set player as inactive by clearing the userId
          games[j]["playerIds"][games[j]["playerIds"].indexOf(socket.id)] = "";
        } else {
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
  } else {
    res.sendFile(localFlutterDir + "/build/web/index.html");
  }
});

app.get("/unity", (req, res) => {
  if (isOnline) {
    res.sendFile("/web/UnityLibrary/index.html", { root: __dirname });
  } else {
    res.sendFile(localFlutterDir + "/build/web/UnityLibrary/index.html");
  }
});

app.get("*", (req, res) => {
  if (isOnline) {
    res.sendFile(path.join(__dirname + "/build/index.html"));
  } else {
    res.sendFile(localReactDir + "/build/index.html");
  }
});

initializeDbConnection().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`Server is Listening on port ${PORT}`);
    isOnline ? console.log("IS ONLINE") : console.log("OFFLINE");
  });
});
