import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware";
import { getUserProfile, updateUser } from "../controllers/UserController";

const userRouter = Router();

userRouter.get(
  "/getProfile",
  authenticate,
  getUserProfile
)

userRouter.put(
  "/updateUser",
  authenticate,
  updateUser
)

export default userRouter;