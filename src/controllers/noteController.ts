import { AuthRequest } from "../middleware/authMiddleware";
import { Response } from "express";
import { Note } from "../models/note.modle";
import path from "path";
import fs from "fs-extra";
import puppeteer from "puppeteer";
import cloudinary from "../config/cloudinary";
import { Subject } from "../models/subject.modle";

export const createNote = async (req: AuthRequest, res: Response) => {
  try {
    const { title, html, json, subjectId, userId } = req.body;
    const images: string[] = req.body?.images || [];
    const pdfUrl: string | undefined = req.body?.pdfUrl;

    if (!title || !html || !json || !subjectId || !userId) {
      return res.status(400).json({ message: "Note not have a content...!" });
    }

    const note = await Note.create({
      title,
      html,
      json,
      images,
      pdfUrl,
      subjectId,
      userId,
    });

    res
      .status(201)
      .json({ message: "Note Created Successfully...!", data: note });
  } catch (error) {
    res.status(500).json({ message: "Note Creation Failed...!" });
  }
};

export const getAllNotes = async (req: AuthRequest, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const userId = req.user.sub;

    const totalNotesCount = await Note.countDocuments({ userId });

    const notes = await Note.find({ userId })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    console.log(notes);

    const totalPages = Math.ceil(totalNotesCount / limit);

    res.status(200).json({
      currentPage: page,
      totalPages,
      totalNotesCount,
      notes,
    });
  } catch (error) {
    res.status(500).json({ message: "Note fetched Failed...!" });
  }
};

export const getNoteById = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.sub;
    const noteId = req.params.id;

    const note = await Note.findOne({ userId: userId, _id: noteId });

    res.status(200).json({
      message: "Note fetched Successfully...!",
      note,
    });
  } catch (error) {
    res.status(500).json({ message: "One Note fetched Failed...!" });
  }
};

export const updateNoteById = async (req: AuthRequest, res: Response) => {
  try {
    const noteId = req.params.id;
    const { title, html, json, subjectId, userId } = req.body;
    const images: string[] = req.body?.images || [];
    const pdfUrl: string | undefined = req.body?.pdfUrl;

    if (!title || !html || !json || !subjectId || !userId) {
      return res.status(400).json({ message: "Note not have a content...!" });
    }

    const updatedNote = await Note.findByIdAndUpdate(
      noteId,
      {
        title,
        html,
        json,
        images,
        pdfUrl,
        subjectId,
        userId,
      },
      { new: true } // update una note eka return karanna
    );
    res
      .status(201)
      .json({ message: "Note updated Successfully...!", data: updatedNote });
  } catch (error) {
    res.status(500).json({ message: "Note update Failed...!" });
  }
};

export const deleteNoteById = async (req: AuthRequest, res: Response) => {
  try {
    const noteId = req.params.id;

    const deletedNote = await Note.findByIdAndDelete(noteId);

    res
      .status(200)
      .json({ message: "Note deleted Successfully...!", data: deletedNote });
  } catch (error) {
    res.status(500).json({ message: "Note delete Failed...!" });
  }
};

export const pdfGeneration = async (req: AuthRequest, res: Response) => {
  try {
    const noteId = req.params.id;

    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({ message: "Note not found...!" });
    }

    const htmlContent = note.html || "<p>(Empty Note)</p>";

    const tempPath = path.join("temp", `${noteId}.pdf`);
    fs.ensureDirSync("temp");

    const browser = await puppeteer.launch({
      headless: true,
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0", timeout: 60000 });

    await page.pdf({
      path: tempPath,
      format: "A4",
      printBackground: true,
    });

    await browser.close();

    const uploadResult = await cloudinary.uploader.upload(tempPath, {
      resource_type: "raw",
      folder: "notes_pdfs",
      public_id: noteId,
    });

    return res.status(200).json({
      message: "PDF generated successfully!",
      pdfUrl: uploadResult.secure_url,
    });

  } catch (error) {
    res.status(500).json({ message: "PDF generation Failed...!" });
  }
};

export const noteBySubjectId = async (req: AuthRequest, res: Response) => {
  try {
    const subId = req.params.id;

    const subject = await Subject.findById(subId);
    if (!subject) {
      return res.status(404).json({ message: "Subject not found...!" });
    }

    const notes = await Note.find({ subjectId: subId });

    res.status(200).json({
      message: "Notes fetched Successfully...!",
      notes,
    });

  } catch (error) {
    res.status(500).json({ message: "Note fetched Failed...!" });
  }
}

export const noteSearchByTitle = async (req: AuthRequest, res: Response) => {
  try {
    const titleQuery = req.query.q as string;
    const userId = req.user.sub;

    console.log(titleQuery)
    if (!titleQuery) {
      return res.status(400).json({ message: "Title query parameter is required." });
    }

    const notes = await Note.find({
      userId,
      $or: [
        { title: { $regex: titleQuery, $options: "i" } },
        { html: { $regex: titleQuery, $options: "i" } },
      ],
    });

    res.status(200).json({
      message: "Search results",
      results: notes,
    });

  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Note fetched Failed...!" });
  }
}
