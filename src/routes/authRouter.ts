import { Router } from "express";
import { forgotPassword, logout, me, refresh, resetPassword, userLogin, userRegister } from "../controllers/authController";
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

authRouter.get(
  '/logout',
  authenticate,
  logout);



export default authRouter;
