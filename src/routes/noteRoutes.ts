import { Router  } from "express";
import { authenticate } from "../middleware/authMiddleware";
import { createNote, deleteNoteById, getAllNotes, getNoteById, noteBySubjectId, pdfGeneration, updateNoteById } from "../controllers/noteController";

const noteRouter = Router();

noteRouter.post(
  '/create',
  authenticate,
  createNote
)

noteRouter.get(
  '/all',
  authenticate,
  getAllNotes
);

noteRouter.put(
  '/update/:id',
  authenticate,
  updateNoteById
)

noteRouter.delete(
  '/delete/:id',
  authenticate,
  deleteNoteById
)

noteRouter.get(
  '/pdf/:id',
  authenticate,
  pdfGeneration
)

noteRouter.get(
  '/note/subject/:id',
  authenticate,
  noteBySubjectId
)

noteRouter.get(
  '/user/:id',
  authenticate,
  getNoteById
);


export default noteRouter;

