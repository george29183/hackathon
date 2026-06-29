Here is the exact text for your `README.md` file. Just copy everything inside the box below, paste it into your `README.md` file, and save it.

```markdown
# Pace — AI Quiz Analytics Platform

> Every second tells a story.

Pace is an AI-powered quiz platform that helps teachers turn PDFs into quizzes, track academic integrity in real-time, and visualize student struggles through a live heatmap with an Integrity Risk Score.

## ✨ Features

- **AI Quiz Generation** — Upload a PDF, and Groq AI instantly generates a difficulty-graded quiz with questions, options, correct answers, and explanations.
- **Manual Quiz Creator** — Build quizzes from scratch with MCQ and True/False support.
- **Real-Time Proctoring** — Tracks tab switches, window blurs, copy/paste attempts, and fullscreen exits. Calculates a weighted Integrity Risk Score (0–100%) per student.
- **Live Analytics Heatmap** — Color-coded grid showing time spent, correctness, hesitation, and answer changes per question per student. Updates every 5 seconds.
- **AI Professor's Report** — Groq AI analyzes class performance and writes a summary highlighting the hardest question, most-hesitated question, and integrity flags.
- **CSV Export** — Download full analytics (answers, times, changes, presence flags) for offline review.
- **Email Verification** — Nodemailer sends branded HTML verification emails with secure hashed tokens.
- **Forgot/Reset Password** — Full flow with 1-hour expiry tokens.
- **Quiz Lifecycle Control** — Lecturers can activate/deactivate quizzes. Deactivated quizzes block new starts but preserve past scores.
- **Dark Mode** — Full OKLCH color system with seamless light/dark switching.
- **Custom Landing Page** — Four auto-playing DOM animations demonstrating the entire product flow.

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, Tailwind CSS v4 |
| Backend | Next.js Route Handlers (Node.js runtime) |
| Database | AWS DynamoDB (AWS SDK v3) |
| AI | Groq API (`llama-3.1-8b-instant`) via `openai` SDK |
| Auth | JWT (`httpOnly` cookies), Bcryptjs |
| Email | Nodemailer (Gmail SMTP) |
| Charts | Recharts |
| Deployment | Vercel |

## 🗄 DynamoDB Table Schemas

### `Users` (Partition Key: `email`)
```
email: String (PK)
username: String
password: String (Bcryptjs hash)
isVerified: Boolean
verifyToken: String
verifyTokenExpiry: Number
forgotPasswordToken: String
forgotPasswordTokenExpiry: Number
dateCreated: String (ISO)
```

### `Lecturers` (Partition Key: `email`)
```
email: String (PK)
username: String
password: String (Bcryptjs hash)
role: String ("lecturer")
isVerified: Boolean
verifyToken: String
verifyTokenExpiry: Number
forgotPasswordToken: String
forgotPasswordTokenExpiry: Number
dateCreated: String (ISO)
```

### `Quizzes` (Partition Key: `quizId`)
```
quizId: String (PK)
lecturerEmail: String
title: String
category: String
difficulty: String ("easy" | "medium" | "hard")
timeLimit: Number (minutes)
isActive: Boolean
quizCode: String (e.g., "CHEM-AB12CD34")
questions: List<Map> {
  questionText: String
  options: List<String>
  correctAnswer: String
  explanation: String
  topic: String
}
createdAt: String (ISO)
```

### `QuizSessions` (Partition Key: `sessionId`)
```
sessionId: String (PK, format: "{quizId}-{studentEmail}")
quizId: String
quizTitle: String
lecturerEmail: String
studentEmail: String
status: String ("in_progress" | "completed")
currentQuestion: Number
questionData: List<Map> {
  selectedAnswer: String | null
  isChanged: Boolean
  timeSpent: List<Number>
  visits: Number
  answeredPresence: String
}
gradedAnswers: List<Map> {
  questionIndex: Number
  selectedAnswer: String
  correctAnswer: String
  isCorrect: Boolean
  isChanged: Boolean
  timeSpent: Number
  timePerVisit: List<Number>
  answeredPresence: String
}
score: Number
totalQuestions: Number
presence: String ("active" | "tab_switched" | "window_blur" | "disconnected" | "not_fullscreen" | "copy_paste_attempt")
lastSeen: String (ISO)
startedAt: String (ISO)
completedAt: String (ISO)
```

#### Recommended GSIs (for production scale)
| Table | GSI | Partition Key | Sort Key | Use Case |
|---|---|---|---|---|
| Quizzes | `lecturerEmail-createdAt-index` | `lecturerEmail` | `createdAt` | Lecturer dashboard |
| Quizzes | `quizCode-index` | `quizCode` | — | Student join lookup |
| QuizSessions | `quizId-status-index` | `quizId` | `status` | Lecturer monitor page |
| QuizSessions | `studentEmail-status-index` | `studentEmail` | `status` | Student history |
| Users | `verifyToken-index` | `verifyToken` | — | Email verification |
| Users | `forgotPasswordToken-index` | `forgotPasswordToken` | — | Password reset |



## 🚀 Local Development

```bash
# 1. Install dependencies
npm install

# 2. Create .env.local with the variables above

# 3. Create DynamoDB tables in AWS Console:
#    - Users (PK: email)
#    - Lecturers (PK: email)
#    - Quizzes (PK: quizId)
#    - QuizSessions (PK: sessionId)

# 4. Run the dev server
npm run dev

# 5. Open http://localhost:3000
```

## 🔑 Demo Accounts

For hackathon judges, pre-created accounts are available:

| Role | Email | Password |
|---|---|---|
| Student | `student.judge@pace.com` | `password123` |
| Lecturer | `lecturer.judge@pace.com` | `password123` |

These accounts bypass email verification and can retake quizzes for testing.

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Vercel (Next.js)                  │
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌───────────────────┐  │
│  │ Frontend  │  │ API      │  │ Middleware        │  │
│  │ (React 19)│←→│ Routes   │←→│ (Auth Guard)      │  │
│  │ Tailwind  │  │ (Node.js)│  │                   │  │
│  │ v4        │  │          │  │                   │  │
│  └──────────┘  └────┬─────┘  └───────────────────┘  │
│                     │                                │
│         ┌───────────┼───────────┐                   │
│         ▼           ▼           ▼                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │ DynamoDB │ │ Groq AI  │ │ Nodemailer│            │
│  │ (4 tables│ │ (Llama   │ │ (Gmail   │            │
│  │  + GSIs) │ │  3.1)    │ │  SMTP)   │            │
│  └──────────┘ └──────────┘ └──────────┘            │
└─────────────────────────────────────────────────────┘
```

## 📦 Deployment

1. Push to GitHub
2. Import to Vercel
3. Add all environment variables in Vercel Project Settings
4. Set `DOMAIN` to your Vercel URL (e.g., `https://pace.vercel.app`)
5. Deploy

## 🎯 Hackathon Submission

- **Hackathon:** Vercel v0 x AWS Databases Hackathon
- **Track:** Open Innovation
- **Database:** AWS DynamoDB
- **Frontend:** Vercel (Next.js 16)
- **AI:** Groq (Llama 3.1)

---

Built for the Vercel v0 x AWS Databases Hackathon.
```