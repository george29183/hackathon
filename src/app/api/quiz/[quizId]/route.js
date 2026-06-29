import { NextResponse } from "next/server";
import { docClient } from "@/lib/dynamodb";
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import jwt from "jsonwebtoken";

export async function GET(request, { params }) {
  try {
    const { quizId } = await params;

    const command = new GetCommand({
      TableName: "Quizzes",
      Key: { quizId },
    });

    const response = await docClient.send(command);

    if (!response.Item) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    const quiz = response.Item;

    // SECURITY: Check if the requester is a LECTURER
    const lecturerToken = request.cookies.get("lecturer_token")?.value;
    let isLecturer = false;
    if (lecturerToken) {
      try {
        jwt.verify(lecturerToken, process.env.TOKEN_SECRET);
        isLecturer = true;
      } catch {}
    }

    // If they ARE a lecturer, return the full quiz (with answers)
    if (isLecturer) {
      return NextResponse.json({ quiz: quiz, success: true }, { status: 200 });
    }

    // EVERYONE ELSE (including students with valid tokens, and unauthenticated users)
    // gets the stripped version WITHOUT correctAnswer or explanation
    const safeQuiz = {
      ...quiz,
      questions: quiz.questions.map(q => {
        const { correctAnswer, explanation, ...safeQuestion } = q;
        return safeQuestion;
      })
    };
    return NextResponse.json({ quiz: safeQuiz, success: true }, { status: 200 });

  } catch (error) {
    console.error("Error fetching quiz:", error);
    return NextResponse.json({ error: "Failed to fetch quiz" }, { status: 500 });
  }
}