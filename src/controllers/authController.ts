import { Request, Response } from "express";
import { User } from "../models/user.modle";
import bcrypt from "bcryptjs";
import { signAccessToken, signRefreshToken } from "../utils/token";
import { AuthRequest } from "../middleware/authMiddleware";
import jwt from "jsonwebtoken";

const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET as string;

export const userRegister = async (req: Request, res: Response) => {

  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required...!" });
    }

    const exsitingUser = await User.findOne({ email });
    if (exsitingUser) {
      return res.status(400).json({ message: "User already exists...!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword
    });

    await newUser.save();
    res.status(201).json({ message: "User Registered Successfully...!", data: newUser._id });

  } catch (error) {
    res.status(500).json({ message: "User Registration Failed...!" });
  }
}

export const userLogin = async (req: Request, res: Response) => {

  try {
    const { email, password } = req.body;

    const exsitingUser = await User.findOne({ email });
    if (!exsitingUser) {
      return res.status(401).json({ message: "Invalid creadentials...!" });
    }

    const vlaid = await bcrypt.compare(password, exsitingUser.password);
  
    if (!vlaid) {
      return res.status(401).json({ message: "Invalid creadentials...!" });
    }

    const accessToken = signAccessToken(exsitingUser);
    const refreshToken = signRefreshToken(exsitingUser);


    res.status(200).json({
      message: "Login successful", data: {
        email: exsitingUser.email,
        id: exsitingUser._id,
        //tokens
        accessToken,
        refreshToken
      }
    });

  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "User login Failed...!" });
  }
}

export const me = async (req: AuthRequest, res: Response) => {
  const userId = req.user.sub;
  const email = req.user.email;
  res.status(200).json({
    message: "ok",
    data: {
      userId,
      email,
    },
  });

}

export const refresh = async (req: AuthRequest, res: Response) => {
  try {
    const refreshToken = req.headers.refreshtoken as string;
    if (!refreshToken) {
      return res.status(401).json({ message: "Not found refresh token" });
    }
    const payload = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
    const user = await User.findById(payload.sub);
    if (!user) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }
    const accessToken = signAccessToken(user);
    res.status(200).json({ accessToken });
  } catch (err) {
    res.status(403).json({ message: "Invalid or expire token" });
  }
};