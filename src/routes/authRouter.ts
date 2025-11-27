import { Router } from "express";
import { me, refresh, userLogin, userRegister } from "../controllers/authController";
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

authRouter.get(
  '/refresh',
  verifyRefreshToken,
  refresh);

export default authRouter;
