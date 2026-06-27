import { NextResponse } from "next/server";
import { docClient } from "@/lib/dynamodb";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import OpenAI from "openai";
import { extractText, getDocumentProxy } from "unpdf";
import { randomUUID } from "crypto";
import jwt from "jsonwebtoken";

export const runtime = "nodejs";

const openai = new OpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("pdf");
    const difficulty = formData.get("difficulty");
    const title = formData.get("title");
    const numQuestions = formData.get("numQuestions") || "5";
    const customPrompt = formData.get("customPrompt") || ""; // NEW
    
    const token = request.cookies.get("lecturer_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    const lecturerEmail = decoded.email;

    let contextText = "";

    // 1. If PDF exists, extract text
    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const pdfDocument = await getDocumentProxy(new Uint8Array(buffer));
      const { text: pdfText } = await extractText(pdfDocument, { mergePages: true });
      contextText = pdfText.substring(0, 30000);
    } else {
      // 2. If no PDF, use the custom prompt as the context
      contextText = customPrompt || "Generate a general knowledge quiz.";
    }

    const prompt = `
      You are an expert professor. Based on the following context, create a ${difficulty} difficulty quiz with exactly ${numQuestions} questions.
      
      CRITICAL INSTRUCTION FOR correctAnswer: You must provide the EXACT TEXT of the correct option. Do NOT use "A", "B", "C", or "D".

      Return ONLY a valid JSON object with this exact format:
      {
        "questions": [
          {
            "questionText": "What is the standard state of a substance?",
            "options": ["A pure gas at 1 atm", "A pure solid/liquid at 1 atm and 25°C", "Any state at any condition", "A substance in a solution"],
            "correctAnswer": "A pure solid/liquid at 1 atm and 25°C",
            "explanation": "The standard state is defined as the most stable form of a substance at 1 atmosphere of pressure and usually 25°C (298 K).",
            "topic": "Thermodynamics"
          }
        ]
      }
      
      Context:
      ${contextText}
    `;

    const response = await openai.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const text = response.choices[0].message.content;
    const aiResult = JSON.parse(text);

    const newQuiz = {
      quizId: `quiz-${randomUUID().split("-")[0]}`,
      lecturerEmail: lecturerEmail,
      title: title || "AI Generated Quiz",
      category: "AI Generated",
      difficulty: difficulty,
      questions: aiResult.questions,
      timeLimit: parseInt(formData.get("timeLimit") || "5", 10),
      quizCode: `${(title || "QUIZ").substring(0, 4).toUpperCase().replace(/\s/g, '')}-${randomUUID().split("-")[0].toUpperCase()}`,
      createdAt: new Date().toISOString(),
    };

    await docClient.send(new PutCommand({ TableName: "Quizzes", Item: newQuiz }));

    return NextResponse.json({ success: true, message: "AI Quiz generated!", quiz: newQuiz });

  } catch (error) {
    console.error("AI Quiz Generation Error:", error);
    return NextResponse.json({ error: "Failed to generate AI quiz" }, { status: 500 });
  }
}