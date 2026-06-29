import { NextResponse } from "next/server";
import { docClient } from "@/lib/dynamodb";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import jwt from "jsonwebtoken";

export async function POST(request) {
  try {
    const { quizId, isActive } = await request.json();
    
    // Verify lecturer
    const token = request.cookies.get("lecturer_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
     const decoded = jwt.verify(token, process.env.TOKEN_SECRET);


      // NEW: Verify ownership
    const quizRes = await docClient.send(new GetCommand({ TableName: "Quizzes", Key: { quizId } }));
    if (!quizRes.Item || quizRes.Item.lecturerEmail !== decoded.email) {
      return NextResponse.json({ error: "Forbidden: you do not own this quiz" }, { status: 403 });
    }

    
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