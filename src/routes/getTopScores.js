//import jwt from "jsonwebtoken";
import { getDbConnection } from "../db";

export const getTopScores = {
  path: "/GetTopScores",
  method: "get",
  handler: async (req, res) => {
        
        console.log(req.query.count);

        const db = getDbConnection("top-scores");

        var results = [];
        try {
            switch (req.query.type) {

                case "Ordinary": {
                
                    console.log("getting ordinary game topscores");
                    results = await db
                    .collection("ordinary")
                    .find({},{_id:0})
                    .sort({"score":-1});
                    break;
                }
        
                case "Mini": {
                
                break;
                }
        
                case "Maxi": {
                
                break;
                }
            }
        
            console.log("result ", results);
            res.status(200).json(results.value);    
        } catch (e) {
            console.log(e);
            res.sendStatus(500);  
        }      
    }
}
