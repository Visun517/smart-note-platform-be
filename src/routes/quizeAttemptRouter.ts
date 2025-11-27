import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { getQuizAttempt } from '../controllers/quizAttemptController';

const quizeAttemptRouter = Router();

quizeAttemptRouter.post(
  '/attempt/:quizeId',
  authenticate,
  getQuizAttempt
)

export default quizeAttemptRouter;