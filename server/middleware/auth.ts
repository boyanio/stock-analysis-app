import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import {
  STATUS_FORBIDDEN,
  STATUS_UNAUTHORIZED,
} from "../util/http-status-codes.util";

const tokenSecret = crypto.randomBytes(64).toString("hex");

export function generateJwtToken() {
  return jwt.sign({ user: "Web User" }, tokenSecret, { expiresIn: "1d" });
}

export function requireJwtToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers["authorization"] || "";
  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.sendStatus(STATUS_UNAUTHORIZED);
  }

  jwt.verify(token, tokenSecret, (err) => {
    if (err) {
      console.log(err);
      return res.sendStatus(STATUS_FORBIDDEN);
    }

    next();
  });
}
