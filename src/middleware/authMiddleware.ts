import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { User } from "../models/user.modle";
import { signAccessToken } from "../utils/token";
dotenv.config();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET as string;

export interface AuthRequest extends Request {
  user?: any; // you can define a more specific type based on your payload
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Authorization header missing" });
  }

  // barer 
  const token = authHeader.split(' ')[1]; // ['barer' , 'token']
  try {
    const payload = jwt.verify(token, ACCESS_TOKEN_SECRET)
    req.user = payload; // add user info to request object
    next();
  } catch (error) {
    console.log(error)
    res.status(401).json({ message: 'Invalid or expired token' })
  }
}


