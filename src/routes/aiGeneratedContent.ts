import { Router } from "express";
import { getAiGeneratedContent } from "../controllers/aiGeneratedContent";
import { authenticate } from "../middleware/authMiddleware";

const aiGeneratedContentRouter = Router();

aiGeneratedContentRouter.get(
  '/:id',
  authenticate,
  getAiGeneratedContent
);

export default aiGeneratedContentRouter;