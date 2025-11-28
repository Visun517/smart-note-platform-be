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
    console.log(error)
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

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // example 7 days
    });


    res.status(200).json({
      message: "Login successful", data: {
        email: exsitingUser.email,
        id: exsitingUser._id,
        //tokens
        accessToken
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
    const token = req.cookies?.refreshToken;
    if (!token) return res.status(401).json({ message: 'No refresh token' });

    const payload: any = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!);

    const user = await User.findById(req.user.sub);
    if (!user) return res.status(401).json({ message: 'User not found' });

    const newAccessToken = signAccessToken(user);
    res.status(200).json({ accessToken: newAccessToken });
  } catch (err) {
    console.log(err);
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  });
  return res.status(200).json({ message: 'Logged out' });
};
