import { Request, Response } from "express";
import { User } from "../models/user.modle";
import bcrypt from "bcryptjs";
import { signAccessToken, signRefreshToken } from "../utils/token";
import { AuthRequest } from "../middleware/authMiddleware";
import jwt from "jsonwebtoken";
import crypto from 'crypto';
import  sendMail  from "../utils/sendMail";
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID); 
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

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = new Date(Date.now() + 3600000); // 1 hour

    await user.save();

    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

    const message = `
      <h1>You have requested a password reset</h1>
      <p>Please go to this link to reset your password:</p>
      <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
    `;

         await sendMail({
        to: user.email,
        subject: "Password Reset Request - SmartNotes AI",
        text: message,
      });

      res.status(200).json({ success: true, data: "Email Sent" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Forgot password failed..!' });
    }
  }

  export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: 'Token and password are required' });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword; 

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({ success: true, data: "Password Updated Success" });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Reset password failed' });
  }
};

export const googleLogin = async (req: Request, res: Response) => {
  try {
    const { token } = req.body; 

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(400).json({ message: "Invalid Google Token" });
    }

    const { email, name, sub, picture } = payload; 

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        username: name,
        email: email,
        password: sub + crypto.randomUUID(), 
      });
    }

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      success: true,
      message: "Google Login successful",
      data: {
        email: user.email,
        id: user._id,
        accessToken, 
      },
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Google Login Failed" });
  }
};