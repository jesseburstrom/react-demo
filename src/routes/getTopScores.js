//import jwt from "jsonwebtoken";
import { getDbConnection } from "../db";

export const getTopScores = {
  path: "/GetTopScores",
  method: "get",
  handler: async (req, res) => {
        
    
        console.log(req.query.count);

        const db = getDbConnection("top-scores");

        var results;
        try {
            switch (req.query.type) {

                case "Ordinary": {
                
                    console.log("getting ordinary game topscores");
                    results = await db
                    .collection("ordinary")
                    .find({},{_id:0}).sort({"score":-1}).toArray();
                    break;
                }
        
                case "Mini": {
                    results = await db
                    .collection("mini")
                    .find({},{_id:0}).sort({"score":-1}).toArray();
                break;
                }
        
                case "Maxi": {
                    results = await db
                    .collection("maxi")
                    .find({},{_id:0}).sort({"score":-1}).toArray();
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
