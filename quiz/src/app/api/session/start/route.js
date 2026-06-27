import { NextResponse } from "next/server";
import { docClient } from "@/lib/dynamodb";
import { PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";

export async function POST(request) {
  try {
    const { quizId } = await request.json();
    const token = request.cookies.get("student_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    const studentEmail = decoded.email;

    // Get quiz to find lecturer's email
    const quizRes = await docClient.send(new GetCommand({ TableName: "Quizzes", Key: { quizId } }));
    const quiz = quizRes.Item;

    const newSession = {
      sessionId: `${quizId}-${studentEmail}`, // Unique session ID
      quizId: quizId,
      lecturerEmail: quiz.lecturerEmail,
      studentEmail: studentEmail,
      status: "in_progress",
      currentQuestion: 0,
      answers: [],
      timePerQuestion: [],
      score: 0,
      startedAt: new Date().toISOString()
    };

    await docClient.send(new PutCommand({ TableName: "QuizSessions", Item: newSession }));

    return NextResponse.json({ success: true, sessionId: newSession.sessionId });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}