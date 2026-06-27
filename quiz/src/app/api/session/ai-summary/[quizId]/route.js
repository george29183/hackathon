import { NextResponse } from "next/server";
import { docClient } from "@/lib/dynamodb";
import { ScanCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import OpenAI from "openai";

export const runtime = "nodejs";

const openai = new OpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY,
});

export async function GET(request, { params }) {
  try {
    const { quizId } = await params;

    // 1. Fetch Quiz and Sessions
    const quizRes = await docClient.send(new GetCommand({ TableName: "Quizzes", Key: { quizId } }));
    const quiz = quizRes.Item;
    const sessionsRes = await docClient.send(new ScanCommand({
      TableName: "QuizSessions",
      FilterExpression: "quizId = :quizId",
      ExpressionAttributeValues: { ":quizId": quizId }
    }));
    const sessions = sessionsRes.Items || [];

    if (sessions.length === 0) {
      return NextResponse.json({ success: true, summary: "No student data available yet to generate a summary." });
    }

    // 2. Calculate Stats for AI
    let totalScore = 0;
    const questionMisses = Array(quiz.questions.length).fill(0);
    const questionTimes = Array(quiz.questions.length).fill(0);

    sessions.forEach(s => {
      totalScore += s.score || 0;
      if (s.gradedAnswers) {
        s.gradedAnswers.forEach((ans, i) => {
          if (!ans.isCorrect) questionMisses[i]++;
          questionTimes[i] += ans.timeSpent || 0;
        });
      }
    });

    const avgScore = (totalScore / sessions.length).toFixed(1);
    const hardestQuestionIndex = questionMisses.indexOf(Math.max(...questionMisses));
    const hardestQuestionText = quiz.questions[hardestQuestionIndex]?.questionText || "N/A";

    // 3. Prompt Groq
    const prompt = `
      You are an expert academic advisor. Analyze the following quiz data and write a brief, 3-bullet-point summary for the professor.
      Data: 
      - Number of students: ${sessions.length}
      - Average score: ${avgScore} out of ${quiz.questions.length}
      - The question most students got wrong was: "${hardestQuestionText}" (${Math.max(...questionMisses)} students missed it).
      
      Write a concise, encouraging, and insightful summary. Format as HTML <ul><li> tags.
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