import jwt from "jsonwebtoken";
import { getDbConnection } from "../db";

export const logRoute = {
  path: "/api/log/:userId",
  method: "post",
  handler: async (req, res) => {
    const { authorization } = req.headers;
    const { userId } = req.params;
    const { activity } = req.body;

    console.log("in logRoute");
    if (!authorization) {
      return res.status(401).json({ message: "No authorization header sent" });
    }

    const token = authorization.split(" ")[1];

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err)
        return res.status(401).json({ message: "Unable to verify token" });

      const { id } = decoded;

      if (id !== userId)
        return res
          .status(403)
          .json({ message: "Not allowed to update that user's data" });

      const db = getDbConnection("react-auth-db");

      const result = await db
        .collection("logs")
        .findOneAndUpdate(
          { insertedId: userId },
          { $push: { log: activity } },
          { returnOriginal: false }
        );
      console.log(result);
      res.status(200).json(result.value);
    });
  },
};
