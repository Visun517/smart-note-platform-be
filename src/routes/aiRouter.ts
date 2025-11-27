import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { getExplanation, getFlashcards, getQuizQuestions, getSummary } from '../controllers/aiController';

const aiRouter = Router();

aiRouter.get(
  '/summary/:id',
  authenticate ,
  getSummary
);

aiRouter.get(
  '/explanation/:id',
  authenticate ,
  getExplanation
);

aiRouter.get(
  '/quiz/:id',
  authenticate ,
  getQuizQuestions
);

aiRouter.get(
  '/flashcards/:id',
  authenticate ,
  getFlashcards
)

export default aiRouter;