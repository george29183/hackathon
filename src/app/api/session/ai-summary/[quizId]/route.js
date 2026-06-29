import { NextResponse } from "next/server";
import { docClient } from "@/lib/dynamodb";
import { ScanCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import OpenAI from "openai";
import jwt from "jsonwebtoken";
export const runtime = "nodejs";

const openai = new OpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY,
});

export async function GET(request, { params }) {
  try {

    const token = request.cookies.get("lecturer_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);

    const { quizId } = await params;

    const quizRes = await docClient.send(new GetCommand({ TableName: "Quizzes", Key: { quizId } }));
    const quiz = quizRes.Item;

     if (quiz.lecturerEmail !== decoded.email) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    const sessionsRes = await docClient.send(new ScanCommand({
      TableName: "QuizSessions",
      FilterExpression: "quizId = :quizId",
      ExpressionAttributeValues: { ":quizId": quizId }
    }));
    const sessions = sessionsRes.Items || [];

    if (sessions.length === 0) {
      return NextResponse.json({ success: true, summary: "<p>No student data available yet to generate a summary.</p>" });
    }

    // Calculate Advanced Stats
    let totalScore = 0;
    let totalIntegrityFlags = 0;
    const questionMisses = Array(quiz.questions.length).fill(0);
    const questionTimes = Array(quiz.questions.length).fill(0);
    const questionChanges = Array(quiz.questions.length).fill(0);

    sessions.forEach(s => {
      totalScore += s.score || 0;
      if (s.gradedAnswers) {
        s.gradedAnswers.forEach((ans, i) => {
          if (!ans.isCorrect) questionMisses[i]++;
          questionTimes[i] += ans.timeSpent || 0;
          if (ans.isChanged) questionChanges[i]++;
          if (ans.answeredPresence && ans.answeredPresence !== "active") {
            totalIntegrityFlags++;
          }
        });
      }
    });

    const avgScore = (totalScore / sessions.length).toFixed(1);
    const hardestQuestionIndex = questionMisses.indexOf(Math.max(...questionMisses));
    const hardestQuestionText = quiz.questions[hardestQuestionIndex]?.questionText || "N/A";
    
    const mostChangedIndex = questionChanges.indexOf(Math.max(...questionChanges));
    const mostChangedText = quiz.questions[mostChangedIndex]?.questionText || "N/A";

    const prompt = `
      You are an expert academic advisor analyzing quiz data. Provide a brief, highly insightful summary in 3-4 HTML bullet points (<ul><li>) for the professor.
      
      Data:
      - Number of students: ${sessions.length}
      - Average score: ${avgScore} out of ${quiz.questions.length}
      - Hardest question (most incorrect): "${hardestQuestionText}" (${Math.max(...questionMisses)} students missed it).
      - Most hesitated question (most answer changes): "${mostChangedText}" (${Math.max(...questionChanges)} students changed their answer).
      - Academic integrity flags (tab switches, window blurs, copy/paste attempts): ${totalIntegrityFlags} total flags detected.

      Write a concise, encouraging, and actionable summary. Format as HTML <ul><li> tags only.
    `;

    const response = await openai.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
    });

    const summary = response.choices[0].message.content;

    return NextResponse.json({ success: true, summary });

  } catch (error) {
    console.error("AI Summary Error:", error);
    return NextResponse.json({ error: "Failed to generate summary" }, { status: 500 });
  }
}