import { AuthRequest } from "../middleware/authMiddleware";
import { raw, Response } from "express";
import axios from "axios";
import { Note } from "../models/note.modle";
import { Quiz } from "../models/quizQuestion.modle";
import { Flashcard } from "../models/flashCard.modle";
import { chunkText } from "../utils/chunkText";
import { Summary } from "../models/summery.modle";
import { Explanation } from "../models/explanation.modle";


export const getSummary = async (req: AuthRequest, res: Response) => {
  try {
    const maxToken = req.query.maxToken ? parseInt(req.query.maxToken as string, 10) : undefined;
    const noteId = req.params.id;

    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({ message: "Note not found!" });
    }

    const text = note.html || note.json || "";
    const chunks = chunkText(text, 2000);

    // Logic to get the summary of the note using AI service

    let finalSummary = "";

    for (const chunk of chunks) {
      const aiResponse = await axios.post(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
        {
          contents: [{ parts: [{ text: `Summarize:\n${chunk}` }] }]
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-goog-api-key": process.env.GEMINI_API_KEY,
          }
        }
      );

      const part = aiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      finalSummary += part + "\n";
    }

    // Optional: Summaries compress into one final summary
    const finalResponse = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        contents: [{ parts: [{ text: `Combine & simplify:\n${finalSummary}` }] }]
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": process.env.GEMINI_API_KEY,
        }
      }
    );

    const result =
      finalResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      finalSummary;

    const summary = await Summary.create({
      noteId: note._id,
      userId: req.user.sub,
      summaryText: result
    });

    res.status(200).json({ summary: result });

  } catch (error) {
    res.status(500).json({ message: "Ai summerization is Failed...!" });
  }
};

export const getExplanation = async (req: AuthRequest, res: Response) => {

  try {
    const maxToken = req.query.maxToken ? parseInt(req.query.maxToken as string, 10) : undefined;
    const noteId = req.params.id;

    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({ message: "Note not found!" });
    }

    const text = note.html || note.json || "";
    const chunks = chunkText(text, 2000);

    // Logic to get the summary of the note using AI service

    let finalExplanation = "";

    for (const chunk of chunks) {
      const aiResponse = await axios.post(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
        {
          contents: [{ parts: [{ text: `Explain this note:\n${chunk}` }] }]
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-goog-api-key": process.env.GEMINI_API_KEY,
          }
        }
      );

      const part = aiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      finalExplanation += part + "\n";
    }

    // Optional: Summaries compress into one final summary
    const finalResponse = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        contents: [{ parts: [{ text: `Combine & simplify:\n${finalExplanation}` }] }]
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": process.env.GEMINI_API_KEY,
        }
      }
    );

    const result =
      finalResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      finalExplanation;

    const quiz = await Explanation.create({
      noteId: note._id,
      userId: req.user.sub,
      explanation: result
    });

    res.status(200).json({ summary: result });

  } catch (error) {
    res.status(500).json({ message: "Ai Explanation is Failed...!" });
  }
};


export const getQuizQuestions = async (req: AuthRequest, res: Response) => {
  try {
    const maxToken = req.query.maxToken
      ? parseInt(req.query.maxToken as string, 10)
      : 500;

    const noteId = req.params.id;
    const note = await Note.findById(noteId);

    if (!note) {
      return res.status(404).json({ message: "Note not found!" });
    }

    const text = note.html;
    const chunks = chunkText(text, 2000);

    const prompt = `
      Return ONLY valid JSON array.
      NO extra text.
      NO explanation.
      NO comments.
      NO code block.

      Format:
      [
        {
          "question": "string",
          "options": ["A","B","C","D"],
          "correctAnswer": "A"
        }
      ]

      Note Content:
      ${chunks}
    `;

    const aiResponse = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        contents: [{ parts: [{ text: prompt }] }],
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": process.env.GEMINI_API_KEY
        }
      }
    );

    let rawText = aiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      return res.status(500).json({ message: "Empty AI Response" });
    }

    // -------- SANITIZE --------
    rawText = rawText.replace(/```json|```/g, "").trim();

    const match = rawText.match(/\[([\s\S]*?)\]/);
    if (!match) {
      return res.status(500).json({ message: "AI did not return valid JSON array" });
    }

    let jsonString = match[0];
    jsonString = jsonString
      .replace(/\n/g, "")
      .replace(/,\s*]/g, "]")
      .replace(/,\s*}/g, "}");

    // -------- PARSE JSON --------
    let quizData;
    try {
      quizData = JSON.parse(jsonString);
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: "JSON parsing failed" });
    }

    // -------- SAVE QUIZ ----------
    await Quiz.create({
      userId: req.user.sub,
      noteId,
      questions: quizData
    });

    res.status(200).json({ questions: quizData });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "AI Quiz generation failed!" });
  }
};


function validateQuizQuestion(q: any) {
  if (!q.question || typeof q.question !== "string" || q.question.trim() === "") {
    return false;
  }

  if (!Array.isArray(q.options) || q.options.length !== 4) {
    return false;
  }

  for (const option of q.options) {
    if (!option || typeof option !== "string" || option.trim() === "") {
      return false;
    }
  }

  if (!q.correctAnswer || !q.options.includes(q.correctAnswer)) {
    return false;
  }

  return true;
}


export const getFlashcards = async (req: AuthRequest, res: Response) => {
  try {
    const maxToken = req.query.maxToken
      ? parseInt(req.query.maxToken as string, 10)
      : 400;

    const noteId = req.params.id;

    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({ message: "Note not found!" });
    }

    const text = note.html;
    const chunks = chunkText(text, 2000);

    // ---------------- AI PROMPT ----------------
    const prompt = `
      Create 6 flashcards based on this study note.
      Return ONLY a JSON array. No explanation, no extra text.

      Each flashcard must follow exactly this structure:

      {
        "front": "Term or question",
        "back": "Short explanation or answer"
      }

      Note Content:
      ${chunks}
    `;

    // ---------------- AI REQUEST ----------------
    const aiResponse = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: maxToken }
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": process.env.GEMINI_API_KEY
        }
      }
    );

    let rawText = aiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) return res.status(500).json({ message: "AI returned no data" });

    // ---------------- CLEAN JSON ----------------
    rawText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();

    let flashcardsJson;

    try {
      flashcardsJson = JSON.parse(rawText);
    } catch (err) {
      console.log(rawText);
      return res.status(500).json({ message: "Failed to parse AI flashcards JSON" });
    }

    // ---------------- SAVE EACH FLASHCARD ----------------
    const savedFlashcards = [];

    for (const card of flashcardsJson) {
      const saved = await Flashcard.create({
        noteId: note._id,
        userId: req.user.sub,
        front: card.front,
        back: card.back
      });

      savedFlashcards.push(saved);
    }

    res.status(200).json({
      message: "Flashcards generated successfully!",
      flashcards: savedFlashcards
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "AI flashcard generation failed!" });
  }
};
