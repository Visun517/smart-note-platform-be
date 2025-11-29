import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import authRouter from "./routes/authRouter";
import cloudinaryRouter from "./routes/cloudinaryRoutes";
import noteRouter from "./routes/noteRoutes";
import subjectRouter from "./routes/subjectsRoutes";
import aiRouter from "./routes/aiRouter";
import quizeAttemptRouter from "./routes/quizeAttemptRouter";
import userRouter from "./routes/userControllerRoutes";
import cookieParser from 'cookie-parser';

dotenv.config();

const SERVER_PORT = process.env.SERVER_PORT || 5000;
const MONGO_URI = process.env.MONGO_URI as string;

const app = express();

app.use(express.json());
app.use(cookieParser())

app.use(cors({
  origin: 'http://localhost:5174',
  credentials: true
}));

//auth router
app.use('/api/v1/auth', authRouter);

//cloudinary router
app.use('/api/v1/cloudinary', cloudinaryRouter);

//note router
app.use('/api/v1/note', noteRouter);

// subject router
app.use('/api/v1/subject', subjectRouter);

// AI router
app.use('/api/v1/ai', aiRouter);

// Quiz Attempt router
app.use('/api/v1/quiz', quizeAttemptRouter);

// User Router
app.use('/api/v1/user', userRouter);

mongoose.connect(MONGO_URI).then(() => {
  console.log('Database is connected..!')

}).catch((error: any) => {
  console.log('Fail to connect Database..!', error)
  process.exit(1)
})

app.listen(SERVER_PORT, () => {
  console.log(`Server is running on port ${SERVER_PORT}`);
});


