import { NextResponse } from "next/server";
import { docClient } from "@/lib/dynamodb";
import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import bcryptjs from "bcryptjs";
import { sendEmail } from "@/helpers/nodemailer";

export async function POST(request) {
  try {
    const reqBody = await request.json();
    const { username, password, email } = reqBody;

    // 1. Check if lecturer already exists
    const getCommand = new GetCommand({
      TableName: "Lecturers",
      Key: { email: email },
    });
    const existingUser = await docClient.send(getCommand);

    if (existingUser.Item) {
      return NextResponse.json({ error: "Lecturer email already exists" }, { status: 400 });
    }

    // 2. Hash password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    // 3. Create Lecturer object
    const newLecturer = {
      email,
      username,
      password: hashedPassword,
      role: "lecturer", // Good practice to define roles
      isVerified: false,
      dateCreated: new Date().toISOString(),
    };

    // 4. Save to Lecturers table
    await docClient.send(new PutCommand({ TableName: "Lecturers", Item: newLecturer }));
    
    // 5. Send verification email
    await sendEmail({ email, emailType: "VERIFY_LECTURER", userId: email });

    return NextResponse.json({
      message: "Lecturer created successfully",
      success: true,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}