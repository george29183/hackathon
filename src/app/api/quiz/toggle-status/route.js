import { NextResponse } from "next/server";
import { docClient } from "@/lib/dynamodb";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import jwt from "jsonwebtoken";

export async function POST(request) {
  try {
    const { quizId, isActive } = await request.json();
    
    // Verify lecturer
    const token = request.cookies.get("lecturer_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await docClient.send(new UpdateCommand({
      TableName: "Quizzes",
      Key: { quizId },
      UpdateExpression: "set isActive = :val",
      ExpressionAttributeValues: {
        ":val": isActive
      }
    }));

    return NextResponse.json({ success: true, message: `Quiz ${isActive ? 'activated' : 'deactivated'}` });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}