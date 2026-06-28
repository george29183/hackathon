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

    const quizRes = await docClient.send(new GetCommand({ TableName: "Quizzes", Key: { quizId } }));
    const quiz = quizRes.Item;

     if (!quiz) return NextResponse.json({ error: "Quiz not found" }, { status: 404 });

    // NEW: Block if deactivated (unless it's the judge testing)
    if (!quiz.isActive && studentEmail !== "student.judge@pace.com") {
      return NextResponse.json({ error: "This quiz has been deactivated by the lecturer." }, { status: 403 });
    }

    // 1. Check if they already have a session
    const sessionId = `${quizId}-${studentEmail}`;
    const existingSessionRes = await docClient.send(new GetCommand({ TableName: "QuizSessions", Key: { sessionId } }));
    
    if (existingSessionRes.Item) {
      // 2. If it's completed, block them (unless they are the judge)
      if (existingSessionRes.Item.status === "completed" && studentEmail !== "student.judge@pace.com") {
        return NextResponse.json({ error: "You have already completed this quiz." }, { status: 403 });
      }
      // If they are the judge, or if they are in-progress, just return the existing session ID so they can continue
      return NextResponse.json({ success: true, sessionId: existingSessionRes.Item.sessionId });
    }

    // 3. Create new session
    const newSession = {
      sessionId: sessionId,
      quizId: quizId,
      quizTitle: quiz.title,
      lecturerEmail: quiz.lecturerEmail,
      studentEmail: studentEmail,
      status: "in_progress",
      currentQuestion: 0,
      questionData: [],
      startedAt: new Date().toISOString()
    };

     try {
      await docClient.send(new PutCommand({
        TableName: "QuizSessions",
        Item: newSession,
        // NEW: Prevents double-click race conditions!
        ConditionExpression: "attribute_not_exists(sessionId)" 
      }));

      return NextResponse.json({ success: true, sessionId: newSession.sessionId });

    } catch (err) {
      // If it already exists (race condition), just return the existing one
      if (err.name === 'ConditionalCheckFailedException') {
        return NextResponse.json({ success: true, sessionId: sessionId });
      }
      throw err;
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}