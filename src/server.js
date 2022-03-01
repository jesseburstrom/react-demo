import express from 'express';
import { routes } from './routes';
import { initializeDbConnection } from './db';
import path from "path";

const PORT = process.env.PORT || 8080;

const app = express();

app.use(express.static(path.join(__dirname, "/build")));
app.use(express.json());

// Add all the routes to our Express server
// exported from routes/index.js
routes.forEach((route) => {
  app[route.method](route.path, route.handler);
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname + "/build/index.html"));
});

initializeDbConnection()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is listening on port ${PORT}`);
        });
    });