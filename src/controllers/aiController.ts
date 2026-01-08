import { AuthRequest } from "../middleware/authMiddleware";
import {Response } from "express";
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
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
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
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
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
    console.log(error)
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
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
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
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
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

    res.status(200).json({ explanation: result });

  } catch (error) {
    res.status(500).json({ message: "Ai Explanation is Failed...!" });
  }
};
export const getQuizQuestions = async (req: AuthRequest, res: Response) => {
  try {
    const maxToken = req.query.maxToken
      ? parseInt(req.query.maxToken as string, 10)
      : 2000; 

    const noteId = req.params.id;
    const note = await Note.findById(noteId);

    if (!note) {
      return res.status(404).json({ message: "Note not found!" });
    }

    const cleanText = stripHtml(note.html);
    const textToSend = cleanText.substring(0, 15000); 

    const prompt = `
      Create a quiz with 5 multiple-choice questions based on this note.
      Return a JSON array. Each object must strictly follow this schema:
      
      {
        "question": "The question text",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswer": "The correct option string (e.g. Option A)"
      }

      Note Content:
      ${textToSend}
    `;

    const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

    const aiResponse = await axios.post(
      API_URL,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { 
            maxOutputTokens: maxToken,
            temperature: 0.7, 
        }
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY 
        }
      }
    );

    let rawText = aiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      return res.status(500).json({ message: "Empty AI Response" });
    }

    const cleanJsonText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

    let quizData;
    try {
      quizData = JSON.parse(cleanJsonText)
    } catch (err) {
      console.log("JSON Parse Error:", err);
      return res.status(500).json({ message: "JSON parsing failed", raw: rawText });
    }

    const newQuiz = await Quiz.create({
      userId: req.user.sub,
      noteId,
      questions: quizData
    });

    const quizes = await Quiz.find({ noteId: note._id, userId: req.user.sub });

    res.status(200).json({ 
        message: "Quiz generated successfully", 
        questions: quizes, 
    });

  } catch (error: any) {
    console.log(error.response?.data || error.message);
    res.status(500).json({ message: "AI Quiz generation failed!" });
  }
};
const stripHtml = (html: string) => {
  if (!html) return "";
  return html.replace(/<[^>]*>?/gm, "").replace(/&nbsp;/g, " ");
};
export const getFlashcards = async (req: AuthRequest, res: Response) => {
  try {
    const maxToken = 1500;
    const noteId = req.params.id;
    console.log(process.env.GEMINI_API_KEY)

    // 1. Validation
    const note = await Note.findById(noteId);
    if (!note) return res.status(404).json({ message: "Note not found!" });

    // 2. Clean Text
    const cleanText = stripHtml(note.html);
    const textToSend = cleanText.substring(0, 15000);

    
    const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
    
    const prompt = `
      You are a strict API that outputs ONLY JSON.
      Create 6 flashcards based on this study note.
      
      Output Format: A raw JSON array. 
      DO NOT use markdown code blocks (no \`\`\`json).
      
      Structure:
      [
        { "front": "Question", "back": "Answer" }
      ]

      Note Content:
      ${textToSend}
    `;

    // 4. Send Request via Axios
    const aiResponse = await axios.post(
      API_URL,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { 
            maxOutputTokens: maxToken,
            temperature: 0.7 
        }
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY 
        }
      }
    );

    // 5. Extract Response
    let rawText = aiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) return res.status(500).json({ message: "AI returned no data" });

    // 6. Clean JSON (Regex Match)
    const jsonMatch = rawText.match(/\[[\s\S]*\]/);

    if (!jsonMatch) {
      return res.status(500).json({ message: "AI did not return a valid JSON array" });
    }

    // 7. Parse & Save
    let flashcardsJson;
    try {
      flashcardsJson = JSON.parse(jsonMatch[0]);
    } catch (err) {
      console.log("JSON Parse Error:", err);
      return res.status(500).json({ message: "Failed to parse AI response" });
    }

    // Save to DB
    const flashcardsData = flashcardsJson.map((card: any) => ({
        noteId: note._id,
        userId: req.user.sub,
        front: card.front,
        back: card.back
    }));

    const savedFlashcards = await Flashcard.insertMany(flashcardsData);

    res.status(200).json({
      message: "Flashcards generated successfully!",
      flashcards: savedFlashcards
    });

  } catch (error: any) {
    // Error Handling
    if (error.response) {
        console.error("AI API Error:", error.response.data);
        if (error.response.status === 429) {
            return res.status(429).json({ message: "Rate limit exceeded. Try again later." });
        }
        if (error.response.status === 404) {
            return res.status(404).json({ message: "Model not found. Check URL." });
        }
    }
    console.error("Server Error:", error.message);
    res.status(500).json({ message: "AI flashcard generation failed!" });
  }
};