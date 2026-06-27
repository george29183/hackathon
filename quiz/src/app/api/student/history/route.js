import { NextResponse } from "next/server";
import { docClient } from "@/lib/dynamodb";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import jwt from "jsonwebtoken";

export async function GET(request) {
  try {
    const token = request.cookies.get("student_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    const studentEmail = decoded.email;

    const command = new ScanCommand({
      TableName: "QuizSessions",
      FilterExpression: "studentEmail = :email AND #status = :completed",
      ExpressionAttributeNames: { "#status": "status" },
      ExpressionAttributeValues: { ":email": studentEmail, ":completed": "completed" },
    });

    const response = await docClient.send(command);
    return NextResponse.json({ success: true, history: response.Items || [] });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}