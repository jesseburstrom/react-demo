import express from 'express';
import { routes } from './routes';
import { initializeDbConnection, getDbConnection } from './db';
import path from "path";
import { v4 as uuidv4 } from 'uuid';
const db = require("./pdb");

const PORT = process.env.PORT || 8000;

const app = express();

const isOnline = true;

if (isOnline) {
  app.use(express.static(path.join(__dirname, "/build")));
  app.use(express.static(path.join(__dirname, "/web")));  
} else {
  app.use(express.static("C:/Users/J/Desktop/react/proj/build"));
  app.use(express.static("C:/Users/J/StudioProjects/flutter_frontend/build/web"));  
}

app.use(express.json());

// Add all the routes to our Express server
// exported from routes/index.js
routes.forEach((route) => {
  app[route.method](route.path, route.handler);
});
////////////////////////////////// YATZY //////////////////////////////////
const server = require("http").createServer(app);
server.set('transports', ['websocket']);
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: '*'
  }
})
//const io = require("socket.io")(server);

var games = [];
var gameId = 0;
var clients = [];

io.on("connection", (socket) => {
  console.log("client connect...", socket.id);
  

  socket.on("sendToClients", (data) => {
    console.log(data);
    for (var i = 0; i < data["playerIds"].length; i++) {
      if (data["playerIds"][i] != socket.id) {
        console.log(data["playerIds"][i]);
        io.to(data["playerIds"][i]).emit("onClientMsg", data);
      }
    }
  });

  socket.on("connectReact", (data) => {
    console.log(data);
    console.log("connectReact");
    // Save client and corresponding ip address
    clients.push({idReact: socket.id, idFlutter: "", ip: socket.conn.remoteAddress, settings: data});
    console.log(clients[0])
    console.log("IP: ", socket.conn.remoteAddress);
    io.to(socket.id).emit("startFlutter", "");
    //io.emit("startFlutter", "");
  });

  socket.on("sendToServer", (data) => {
    console.log(data);
    switch (data["action"]) {

      case "saveSettings": {
        clients = clients.map(client => {
          if (client.idFlutter ===  socket.id) {
            
            io.to(client.idReact).emit("saveSettings", data);
          } 
          return client;     
        });
        break;
      }
      case "getId": {
        console.log(clients[0].ip);
        // Assume very unlikely two clients on same ip connect at same time. Have flag to only connect one flutter client to one react, probably in right order...
        // Problem is at flutter it is very bad having html import and communication therefore want to not do that. Local storage react works nice since on same ip
        // can connect different computers, if force login which is possible need different login each computer for settings save which is refreshed each web session.
        // it is 100% and best but the redux local storage is still nice as option...
        var isSet = false;
        clients = clients.map(client => {
          // temporarily until real ip address take first not set client and connect
          // think it is common having code for local dev and online run
          if (client.ip === socket.conn.remoteAddress && client.idFlutter === "" && !isSet) {
          //if (client.idFlutter === "" && !isSet) {
            data["settings"] = client.settings;
            isSet = true;
            //return client;
            return {...client, idFlutter: socket.id}
          } else {
            return client; 
          }
        });
       
        console.log(clients[0]);
    
        console.log("IP: ", socket.conn.remoteAddress);
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
        games = games.filter(game => game["gameId"] !== data["gameId"]);
        console.log("removed game");
        io.emit("onServerMsg", { action: "onRequestGames", Games: games });
        break;
      }

      case "requestJoinGame": {
        console.log("Try Join Game: ");
        console.log(data);
        //Find game from gameId and see if still availible and user not already connected
        for (var i = 0; i < games.length; i++) {
          if (data["gameId"] === games[i]["gameId"]) {
            if(games[i]["connected"] < games[i]["nrPlayers"] &&
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
                io.emit("onServerMsg", { action: "onRequestGames", Games: games });
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

  function removePlayer(exclude = -1) {

    // remove player from ongoing games loop backwards not to break indexing
    // if only one player or game started issue game abort
    var j = games.length;
    while(j--) {
      
      if (j !== exclude && games[j]["playerIds"].indexOf(socket.id) !== -1) {
        console.log("loop:"+j.toString());
        
        games[j]["connected"]--;
        if (games[j]["connected"] === 0) {
          // only one connected remove game
          // for (var k = 0; k < games[j]["playerIds"].length; k++) {    
          //   if (games[j]["playerIds"][k] !== socket.id && games[j]["playerIds"][k] !== "") {
          //     io.to(games[j]["playerIds"][k]).emit("onServerMsg", {
          //       action: "onGameAborted",
          //       game: games[j],
          //     });
          //     console.log("Sent abort message!");
          //   }                  
          // }
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
          console.log("removed player from game:")
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

// var server_port = process.env.PORT || 3001;
// server.listen(server_port, function (err) {
//   if (err) throw err;
//   console.log("Listening on port %d", server_port);
// });

app.post("/login", async (req, res, next) => {
  var userName = req.body.email;
  
  var password = req.body.password;
  try {
    let results = await db.getLogin([userName]);
    console.log(results);
    if (results.length != 0) {
      console.log("user exists");
      if (password == results[0]["password"]) {
        // user found and password match
        var payload = {
          username: userName,
        };
        console.log("Success");
        res.sendStatus(200);
      } else {
        // Wrong password
        res.sendStatus(500);
      }
    } else {
      // no such user
      res.sendStatus(500);
    }
  } catch (e) {
    // database error
    console.log(e);
    res.sendStatus(500);
  }
  return;
});

app.post("/signup", async (req, res, next) => {
  var userName = req.body.email;
  
  var password = req.body.password;
  try {
    let results = await db.getLogin([userName]);
    console.log(results);
    if (results.length == 0) {
      console.log("Username not taken");
      try {
        console.log(password);
        results = await db.setLogin([userName, password]);
        res.sendStatus(200);
        //res.send("success")
      } catch (e) {
        // cannot create user
        console.log("error");
        res.status(500);
        res.send("error");
      }
    } else {
      console.log("Username taken");
      res.status(409);
      res.send("User already exists");
    }
  } catch (e) {
    // database error
    console.log(e);
    res.sendStatus(500);
  }
  return;
});

app.get("/GetTopScores", async (req, res, next) => {
  console.log(req.query.count);
  console.log(req.body);
  try {
    var results = [];
    switch (req.query.type) {
      case "Ordinary": {
        console.log("getting ordinary");
        results = await db.getTopScoresOrdinary(parseInt(req.query.count));
        break;
      }

      case "Mini": {
        results = await db.getTopScoresMini(parseInt(req.query.count));
        break;
      }

      case "Maxi": {
        results = await db.getTopScoresMaxi(parseInt(req.query.count));
        break;
      }
   }
    
    console.log(results);
    res.status(200);
    res.json(results);
    console.log("got highscores");
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

app.post("/UpdateHighscore", async (req, res, next) => {

  try {
    if (!Number.isInteger(req.body.count)) {
      res.sendStatus(500);
      return;
    }
    
    var count = req.body.count.toString();
    var results;
    switch (req.body.type) {
      case "Ordinary": {
        results = results = await db.updateHighScoresOrdinary(req.body.count, [
          req.body.name,
          parseInt(req.body.score),
        ]);
        break;
      }

      case "Mini": {
        results = results = await db.updateHighScoresMini(req.body.count, [
          req.body.name,
          parseInt(req.body.score),
        ]);
        break;
      }

      case "Maxi": {
        results = results = await db.updateHighScoresMaxi(req.body.count, [
          req.body.name,
          parseInt(req.body.score),
        ]);
        break;
      }
   }
   
    console.log(results[1]);
    res.status(200);
    res.json(results[1]);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});


////////////////////////////////// BLOG //////////////////////////////////
app.get('/api/articles/:name', async (req, res) => {
    const db = getDbConnection('my-blog');
    
    const articleName = req.params.name;
    await db.collection('articles').update({
        name: articleName 
        }, 
        {
        $setOnInsert: {name: articleName , upvotes: 0, comments: []}
        },
        {upsert: true})
    const articleInfo = await db.collection('articles').findOne({ name: articleName })
    res.status(200).json(articleInfo);  
})

app.post('/api/articles/:name/upvote', async (req, res) => {
    const db = getDbConnection('my-blog');

    const articleName = req.params.name;

    const articleInfo = await db.collection('articles').findOne({ name: articleName });
    await db.collection('articles').updateOne({ name: articleName }, {
        '$set': {
            upvotes: articleInfo.upvotes + 1,
        },
    });
    const updatedArticleInfo = await db.collection('articles').findOne({ name: articleName });

    res.status(200).json(updatedArticleInfo);
});

app.post('/api/articles/:name/add-comment', async (req, res) => {
    const { username, text } = req.body;
    const articleName = req.params.name;

    const db = getDbConnection('my-blog');

    const articleInfo = await db.collection('articles').findOne({ name: articleName });
    await db.collection('articles').updateOne({ name: articleName }, {
        '$set': {
            comments: articleInfo.comments.concat({ username, text }),
        },
    });
    const updatedArticleInfo = await db.collection('articles').findOne({ name: articleName });

    res.status(200).json(updatedArticleInfo);
  
});

/////////////////////////////////////////////////////////////////////////////

////////////////////////////////// TODOLIST //////////////////////////////////
var fakeTodos = [{
    id: 'ae06181d-92c2-4fed-a29d-fb53a6301eb9',
    text: 'Learn about React Ecosystems',
    isCompleted: false,
    createdAt: new Date(),
}, {
    id: 'cda9165d-c263-4ef6-af12-3f1271af5fb4',
    text: 'Get together with friends',
    isCompleted: false,
    createdAt: new Date(Date.now() - 86400000 * 7),
}, {
    id: '2e538cc5-b734-4771-a109-dfcd204bb38b',
    text: 'Buy groceries',
    isCompleted: true,
    createdAt: new Date(Date.now() - 86400000 * 14),
}];

// The route for getting a list of all todos
app.get('/todos', (req, res) => {
    res.status(200).json(fakeTodos);
});

// The route for getting a list of all todos, but with a delay
// (to display the loading component better)
app.get('/todos-delay', (req, res) => {
    setTimeout(() => res.status(200).json(fakeTodos), 2000);
});

// The route for creating new todo-list items
app.post('/todos', (req, res) => {
    const { text } = req.body;
    if (text) {
        const insertedTodo = {
            id: uuidv4(),
            createdAt: Date.now(),
            isCompleted: false,
            text,
        }
        fakeTodos.push(insertedTodo);
        res.status(200).json(insertedTodo);
    } else {
        res.status(400).json({ message: 'Request body should have a text property' });
    }
});

app.post('/todos/:id/completed', (req, res) => {
    const { id } = req.params;
    const matchingTodo = fakeTodos.find(todo => todo.id === id);
    const updatedTodo = {
        ...matchingTodo,
        isCompleted: true,
    }
    if (updatedTodo) {
        fakeTodos = fakeTodos.map(todo =>
            todo.id === id
                ? updatedTodo
                : todo);
        res.status(200).json(updatedTodo);
    } else {
        res.status(400).json({ message: 'There is no todo with that id' });
    }
})

// The route for deleting a todo-list item
app.delete('/todos/:id', (req, res) => {
    const { id } = req.params;
    const removedTodo = fakeTodos.find(todo => todo.id === id);
    fakeTodos = fakeTodos.filter(todo => todo.id !== id);
    res.status(200).json(removedTodo);
});

/////////////////////////////////////////////////////////////////////////////


app.get("/flutter", (req, res) => {
  //console.log(req.query.reactId);
  if (isOnline) {
    res.sendFile("/web/index.html", { root: __dirname });
  } else {
    res.sendFile("C:/Users/J/StudioProjects/flutter_frontend/build/web/index.html");
  }
});

app.get("*", (req, res) => {
  if (isOnline) {
    res.sendFile(path.join(__dirname + "/build/index.html"));
  } else {
    res.sendFile("C:/Users/J/Desktop/react/proj/build/index.html");
  }
 });

 
initializeDbConnection()
    .then(() => {
        server.listen(PORT, () => {
            console.log(`Server is listening on port ${PORT}`);
        });
    });

