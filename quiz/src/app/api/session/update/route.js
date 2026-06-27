import { NextResponse } from "next/server";
import { docClient } from "@/lib/dynamodb";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";

export async function POST(request) {
  try {
    const { sessionId, currentQuestion, questionData, presence } = await request.json();

    await docClient.send(new UpdateCommand({
      TableName: "QuizSessions",
      Key: { sessionId: sessionId },
      UpdateExpression: "set currentQuestion = :cq, questionData = :qd, #p = :pres, lastSeen = :ls",
      ExpressionAttributeNames: { "#p": "presence" },
      ExpressionAttributeValues: {
        ":cq": currentQuestion,
        ":qd": questionData,
        ":pres": presence || "active",
        ":ls": new Date().toISOString()
      },
    }));

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}