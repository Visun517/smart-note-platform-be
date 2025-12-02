import { Router } from "express";
import { forgotPassword, googleLogin, logout, me, refresh, resetPassword, userLogin, userRegister } from "../controllers/authController";
import { authenticate } from "../middleware/authMiddleware";
import { verifyRefreshToken } from "../middleware/refreshTokenMiddleware";

const authRouter = Router();

authRouter.post(
  "/register",
  userRegister);

authRouter.post(
  "/login",
  userLogin);

authRouter.post(
  '/forgot-password',
  forgotPassword);

authRouter.post(
  '/reset-password/:token',
  resetPassword
)

authRouter.get(
  "/me",
  authenticate,
  me);

authRouter.post(
  '/refresh',
  verifyRefreshToken,
  refresh);

authRouter.post(
  '/logout',
  authenticate,
  logout);

authRouter.post(
  '/google/login',
  googleLogin
)



export default authRouter;
