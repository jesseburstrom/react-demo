//import jwt from "jsonwebtoken";
import { getDbConnection } from "../db";

export const updateHighscore = {
  path: "/UpdateHighscore",
  method: "post",
  handler: async (req, res) => {
        
        console.log(req.query.count);

        const db = getDbConnection("top-scores");

        var results = [];
        try {
            // if (!Number.isInteger(req.body.count)) {
            //     res.sendStatus(500);
            //     return;
            // }

            switch (req.body.type) {

                case "Ordinary": {
                
                    console.log("getting ordinary game topscores");
                    await db
                    .collection("ordinary")
                    .insertOne(
                        {name: req.body.name, score: req.body.score}
                    );
                    results = await db
                    .collection("ordinary")
                    .find({},{_id:0})
                    .sort({"score":-1}).toArray();
                    break;
                }
        
                case "Mini": {
                    await db
                    .collection("mini")
                    .insertOne(
                        {name: req.body.name, score: req.body.score}
                    );
                    results = await db
                    .collection("mini")
                    .find({},{_id:0})
                    .sort({"score":-1}).toArray();
                break;
                }
        
                case "Maxi": {
                    await db
                    .collection("maxi")
                    .insertOne(
                        {name: req.body.name, score: req.body.score}
                    );
                    results = await db
                    .collection("maxi")
                    .find({},{_id:0})
                    .sort({"score":-1}).toArray();
                break;
                }
            }
        
            console.log("result ", results);
            res.status(200).json(results);    
        } catch (e) {
            console.log(e);
            res.sendStatus(500);  
        }      
    }
}
