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

    return NextResponse.json({
      success: true,
      quiz: quiz,
      sessions: sessionsRes.Items || []
    });

  } catch (error) {
    console.error("Analytics Fetch Error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}