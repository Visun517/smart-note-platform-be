import { Router } from "express";
import { logout, me, refresh, userLogin, userRegister } from "../controllers/authController";
import { authenticate } from "../middleware/authMiddleware";
import { verifyRefreshToken } from "../middleware/refreshTokenMiddleware";

const authRouter = Router();

authRouter.post(
  "/register",
  userRegister);

authRouter.post(
  "/login",
  userLogin);

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
