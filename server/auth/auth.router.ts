import express from "express";
import { generateJwtToken } from "../middleware/auth";

const router = express.Router();

router.post("/", (req, res) => {
  const token = generateJwtToken();
  return res.json({ token });
});

export { router as authRouter };
