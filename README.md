# 🚀 SmartNotes API - AI-Powered Study Backend

The server-side application for **SmartNotes**, an AI-powered study platform that enables students to manage notes and automatically generate summaries, quizzes, flashcards, and explanations using **Google Gemini AI**.

This backend handles authentication, authorization, note management, AI processing, file uploads, and PDF generation.

![NodeJS](https://img.shields.io/badge/Node.js-20.x-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Express](https://img.shields.io/badge/Express-4.x-gray)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)

---

## 🌟 Key Features

### 🔐 Authentication & Security

* JWT-based Authentication (Access & Refresh Tokens)
* Google OAuth token verification
* Password reset workflow with email support (Nodemailer)

### 📝 Note Management

* Full CRUD operations for notes
* Stores rich HTML and JSON content (Tiptap-compatible)
* Subject / Folder-based organization
* Advanced searching using Regex and MongoDB indexing
* Trash bin with soft delete, restore, and permanent delete

### 🤖 AI Integration (Google Gemini 1.5 Flash)

* Automatic note summarization
* MCQ quiz generation with structured JSON output
* AI-generated flashcards (Q&A pairs)
* In-depth explanations for complex topics

### 📂 File & Media Handling

* Image uploads using Cloudinary (profile pictures)
* PDF generation from notes using Puppeteer
* Cloud-based storage for images and PDFs

---

## 🛠️ Tech Stack

| Category     | Technology              |
| ------------ | ----------------------- |
| Runtime      | Node.js                 |
| Framework    | Express.js              |
| Language     | TypeScript              |
| Database     | MongoDB (Mongoose ODM)  |
| AI Model     | Google Gemini 1.5 Flash |
| File Storage | Cloudinary              |
| Email        | Nodemailer              |
| PDF Engine   | Puppeteer               |
| Validation   | Joi / Mongoose          |

---

## 🚀 Getting Started

### Prerequisites

* Node.js (v16 or higher)
* MongoDB Atlas or Local MongoDB
* Cloudinary account
* Google AI Studio (Gemini) API key

---

### 1. Clone the Repository

```bash
git clone https://github.com/Visun517/smart-note-platform.git
cd smart-note-platform/back-end
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file in the root of the backend directory and configure the following:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb+srv://your_mongo_connection_string

# JWT Authentication
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_EXPIRE=1d

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Service (Nodemailer)
EMAIL_SERVICE=gmail
EMAIL_USERNAME=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

---

### 4. Run the Server

**Development Mode (Nodemon)**

```bash
npm run dev
```

**Production Mode**

```bash
npm run build
npm start
```

---

## 📡 API Endpoints

### 🔐 Authentication

| Method | Endpoint                           | Description               |
| ------ | ---------------------------------- | ------------------------- |
| POST   | /api/v1/auth/signup                | Register a new user       |
| POST   | /api/v1/auth/login                 | Login and return tokens   |
| POST   | /api/v1/auth/google                | Google OAuth login        |
| POST   | /api/v1/auth/forgot-password       | Send password reset email |
| PUT    | /api/v1/auth/reset-password/:token | Reset password            |

### 👤 User & Profile

| Method | Endpoint                    | Description              |
| ------ | --------------------------- | ------------------------ |
| GET    | /api/v1/user/profile        | Get current user profile |
| PUT    | /api/v1/user/profile        | Update user details      |
| POST   | /api/v1/user/profile/upload | Upload profile picture   |

### 📝 Notes

| Method | Endpoint                     | Description          |
| ------ | ---------------------------- | -------------------- |
| GET    | /api/v1/notes                | Get all active notes |
| GET    | /api/v1/notes/search?q=query | Search notes         |
| POST   | /api/v1/notes                | Create a new note    |
| PUT    | /api/v1/notes/:id            | Update a note        |
| DELETE | /api/v1/notes/:id            | Move note to trash   |

### 🗑️ Trash Bin

| Method | Endpoint                  | Description        |
| ------ | ------------------------- | ------------------ |
| GET    | /api/v1/notes/trash       | Get trashed notes  |
| PUT    | /api/v1/notes/:id/restore | Restore a note     |
| DELETE | /api/v1/notes/:id         | Delete permanently |

### 🤖 AI Services

| Method | Endpoint                  | Description          |
| ------ | ------------------------- | -------------------- |
| POST   | /api/v1/ai/summary        | Generate summary     |
| POST   | /api/v1/ai/explanation    | Generate explanation |
| POST   | /api/v1/ai/quiz/:id       | Generate quiz        |
| POST   | /api/v1/ai/flashcards/:id | Generate flashcards  |
| GET    | /api/v1/ai/content/:id    | Get saved AI content |

---

## 📂 Project Structure

```bash
src/
├── config/         # Database & Cloudinary config
├── controllers/    # Request handling logic
├── middleware/     # Authentication & error handling
├── models/         # Mongoose schemas
├── routes/         # API routes
├── services/       # Business logic layer
├── utils/          # Helpers (email, PDF, etc.)
└── index.ts        # Application entry point
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -m "Add new feature"`
4. Push to branch: `git push origin feature/new-feature`
5. Open a Pull Request

---

## 🌍 Live Deployment

The backend is deployed on **Koyeb** and uses **MongoDB Atlas**.

- **🚀 Live API Base URL:** [https://zippy-skunk-visun-72ceb542.koyeb.app](https://app.koyeb.com/services/71e74d35-0e3e-4e7d-b4ca-0d41887117ed?deploymentId=2ca64c7f-beb7-4572-a08f-81439d569208)
- **🍃 MongoDB Dashboard:** [Atlas Cluster Overview](https://cloud.mongodb.com/v2/6957c9aa4017603e5cf962f1#/overview?automateSecurity=true)

---

Developed by **Visun Perbodha** 🚀
