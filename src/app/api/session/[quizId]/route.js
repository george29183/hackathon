import { NextResponse } from "next/server";
import { docClient } from "@/lib/dynamodb";
import { ScanCommand, GetCommand } from "@aws-sdk/lib-dynamodb";

export async function GET(request, { params }) {
  try {
    const { quizId } = await params;

    // 1. Fetch the original Quiz to get the questions and total count
    const quizRes = await docClient.send(new GetCommand({ 
      TableName: "Quizzes", 
      Key: { quizId } 
    }));
    const quiz = quizRes.Item;

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // 2. Fetch all Student Sessions for this Quiz
    const sessionsRes = await docClient.send(new ScanCommand({
      TableName: "QuizSessions",
      FilterExpression: "quizId = :quizId",
      ExpressionAttributeValues: { ":quizId": quizId }
    }));

      // NEW: Calculate Integrity Risk Score for each session
    const enrichedSessions = sessionsRes.Items.map(s => {
      // If the quiz isn't graded yet, risk is 0
      if (!s.gradedAnswers) return { ...s, integrityRisk: 0 };
      
      // 1. Count proctoring flags (tab switch, window blur, copy/paste, etc.)
      const flags = s.gradedAnswers.filter(a => a.answeredPresence && a.answeredPresence !== "active").length;
      
      // 2. Count suspiciously fast correct answers (< 3 seconds)
      const fastCorrect = s.gradedAnswers.filter(a => a.isCorrect && a.timeSpent < 3).length;
      
      // 3. Count answer changes (hesitation)
      const changes = s.gradedAnswers.filter(a => a.isChanged).length;
      
      // Weighted Algorithm (Max 100)
      // 15 pts per flag (Strong indicator of cheating)
      // 10 pts per fast correct (Might have leaked answers)
      // 5 pts per change (Hesitation, not necessarily cheating)
      const risk = Math.min(flags * 15 + fastCorrect * 10 + changes * 5, 100);
      
      return { ...s, integrityRisk: risk };
    });

    return NextResponse.json({
      success: true,
      quiz: quiz,
      sessions: enrichedSessions || []
    });
  } catch (error) {
    console.error("Analytics Fetch Error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}