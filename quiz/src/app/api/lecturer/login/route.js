import { NextResponse } from "next/server";
import { docClient } from "@/lib/dynamodb";
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(request) {
  try {
    const reqBody = await request.json();
    const { email, password } = reqBody;

    // 1. Check if lecturer exists in the Lecturers table
    const response = await docClient.send(new GetCommand({
      TableName: "Lecturers",
      Key: { email: email },
    }));

    if (!response.Item) {
      return NextResponse.json({ error: "Lecturer not found" }, { status: 400 });
    }

    const lecturer = response.Item;

    // 2. Check password
    const validPassword = await bcryptjs.compare(password, lecturer.password);
    if (!validPassword) {
      return NextResponse.json({ error: "Invalid password" }, { status: 400 });
    }

    // 3. Create Token Data
    const tokenData = {
      id: lecturer.email,
      username: lecturer.username,
      email: lecturer.email,
      role: "lecturer"
    };

    // 4. Create JWT
    const token = jwt.sign(tokenData, process.env.TOKEN_SECRET, { expiresIn: "30d" });

    // 5. Set cookie as 'lecturer_token' (This is what our middleware and dashboard look for!)
    const res = NextResponse.json({ message: "Login successful", success: true });
    res.cookies.set("lecturer_token", token, { httpOnly: true });

    return res;
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}