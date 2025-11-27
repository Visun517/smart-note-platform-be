import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { deleteSubject, getSubjects, getSubjectsById, saveSubject, updateSubject } from '../controllers/subjectController';

const subjectRouter = Router();

subjectRouter.post(
  '/create',
  authenticate,
  saveSubject
);

subjectRouter.get(
  '/all',
  authenticate,
  getSubjects
);

subjectRouter.get(
  '/:id',
  authenticate,
  getSubjectsById
);

subjectRouter.put(
  '/update/:id',
  authenticate,
  updateSubject
)

subjectRouter.delete(
  '/delete/:id',
  authenticate,
  deleteSubject
)

export default subjectRouter;