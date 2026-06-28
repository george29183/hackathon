import { NextResponse } from "next/server";
import { docClient } from "@/lib/dynamodb";
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import jwt from "jsonwebtoken";

export async function GET(request) {
  try {
    let token = request.cookies.get("student_token")?.value;
    let role = "student";
    let tableName = "Users";

    if (!token) {
      token = request.cookies.get("lecturer_token")?.value;
      role = "lecturer";
      tableName = "Lecturers";
    }

    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    } catch (err) {
      // NEW: Catch expired or invalid tokens specifically
      return NextResponse.json({ error: "Invalid or expired session" }, { status: 401 });
    }

    const email = decoded.email;
    const res = await docClient.send(new GetCommand({ TableName: tableName, Key: { email } }));
    const user = res.Item;

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { password, ...safeUser } = user;
    safeUser.role = role;

    return NextResponse.json({ success: true, user: safeUser });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}