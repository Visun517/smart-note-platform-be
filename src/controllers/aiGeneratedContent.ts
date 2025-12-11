import { AuthRequest } from "../middleware/authMiddleware";
import { Response } from "express";
import { Note } from "../models/note.modle";
import { Summary } from "../models/summery.modle";
import { Explanation } from "../models/explanation.modle";
import { Quiz } from "../models/quizQuestion.modle";
import { Flashcard } from "../models/flashCard.modle";

export const getAiGeneratedContent = async (req: AuthRequest, res: Response) => {
  try {
    const noteId = req.params.id;

    const summary = await Summary.findOne({noteId : noteId});
    const explanation = await Explanation.findOne({noteId : noteId});
    const quiz = await Quiz.findOne({noteId : noteId});
    const flashcard = await Flashcard.find({noteId : noteId});

    res.status(200).json({
      message: "Ai generated content fetched Successfully...!",
      summary,
      explanation,
      quiz,
      flashcard,
    });

  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Can't get ai generated content!" });
  }
}