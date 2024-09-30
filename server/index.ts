import express from "express";
import cors from "cors";

const app = express();

app.use(cors());

const PORT = 8080;

app.get("/api/users", (req, res) => {
  return res.json([]);
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
