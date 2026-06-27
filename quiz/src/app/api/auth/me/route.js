import { NextResponse } from "next/server";
import { docClient } from "@/lib/dynamodb";
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import jwt from "jsonwebtoken";

export async function GET(request) {
  try {
    // 1. Try student token first
    let token = request.cookies.get("student_token")?.value;
    let role = "student";
    let tableName = "Users";

    // 2. If no student token, check lecturer token
    if (!token) {
      token = request.cookies.get("lecturer_token")?.value;
      role = "lecturer";
      tableName = "Lecturers";
    }

    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 3. Decode token to get email
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    const email = decoded.email;

    // 4. Fetch user from DynamoDB
    const res = await docClient.send(new GetCommand({ TableName: tableName, Key: { email } }));
    const user = res.Item;

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // 5. Remove password before sending to frontend!
    const { password, ...safeUser } = user;
    safeUser.role = role;

    return NextResponse.json({ success: true, user: safeUser });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}