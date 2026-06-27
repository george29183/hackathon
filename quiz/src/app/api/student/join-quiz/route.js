import { NextResponse } from "next/server";
import { docClient } from "@/lib/dynamodb";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";

export async function POST(request) {
  try {
    const { code } = await request.json();
    const formattedCode = code.trim().toUpperCase(); // Clean up student input

    // 1. Scan for the quiz with this specific secret code
    const command = new ScanCommand({
      TableName: "Quizzes",
      FilterExpression: "quizCode = :code",
      ExpressionAttributeValues: {
        ":code": formattedCode,
      },
    });

    const response = await docClient.send(command);

    // 2. If no quiz found with that code
    if (!response.Items || response.Items.length === 0) {
      return NextResponse.json(
        { error: "Invalid Class Code. Please check with your lecturer." },
        { status: 404 }
      );
    }

    const quiz = response.Items[0];

    // 3. ANTI-CHEAT: Remove correct answers before sending to student!
    if (quiz.questions) {
      quiz.questions = quiz.questions.map((q) => {
        const { correctAnswer, ...safeQuestion } = q;
        return safeQuestion;
      });
    }

    return NextResponse.json(
      { quiz: quiz, success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("Join Quiz Error:", error);
    return NextResponse.json({ error: "Failed to join quiz" }, { status: 500 });
  }
}