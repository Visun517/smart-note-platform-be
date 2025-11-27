import { Router } from "express";
import { imageUpload, pdfUpload, profileUpload } from "../controllers/cloudinaryController";
import { authenticate } from "../middleware/authMiddleware";
import { uploadMulter } from "../middleware/multerMiddleware";

const cloudinaryRouter = Router();

cloudinaryRouter.post(
    '/image',
    authenticate,
    uploadMulter.single("file"),
    imageUpload
)

cloudinaryRouter.post(
    '/pdf',
    authenticate,
    uploadMulter.single("file"),
    pdfUpload
)

cloudinaryRouter.post(
    '/profile',
    authenticate,
    uploadMulter.single("file"),
    profileUpload
)

export default cloudinaryRouter;
