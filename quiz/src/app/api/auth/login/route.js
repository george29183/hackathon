import { NextResponse } from "next/server";
import { docClient } from "@/lib/dynamodb";
import { GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(request) {
  try {
    // 1. Get student login data
    const reqBody = await request.json();
    const { email, password } = reqBody;
    console.log(reqBody);

    // 2. Check if student exists in DynamoDB
    // Since 'email' is our Partition Key, we use GetCommand to fetch the student directly
    const getCommand = new GetCommand({
      TableName: "Users",
      Key: {
        email: email,
      },
    });

    const response = await docClient.send(getCommand);

    // If no item is returned, the user doesn't exist
    if (!response.Item) {
      return NextResponse.json(
        { error: "User with this email not found" },
        { status: 400 }
      );
    }

    const user = response.Item;

    // 3. Compare password
    const validPassword = await bcryptjs.compare(password, user.password);
    if (!validPassword) {
      return NextResponse.json({ error: "Password incorrect" }, { status: 400 });
    }

    // 4. Create token data
    const tokenData = {
      id: user.email, // Using email as the ID since it's our primary key
      username: user.username,
      email: user.email,
    };

    // 5. Create token
    const token = jwt.sign(tokenData, process.env.TOKEN_SECRET, {
      expiresIn: "30d",
    });

    // 6. Save the token to DynamoDB (Replacing user.access_token = token; await user.save())
    const updateCommand = new UpdateCommand({
      TableName: "Users",
      Key: { email: email },
      UpdateExpression: "set access_token = :token",
      ExpressionAttributeValues: {
        ":token": token,
      },
    });

    await docClient.send(updateCommand);

    // 7. Set cookies and return response
    const res = NextResponse.json({
      message: "Login successful",
      success: true,
    });

    res.cookies.set("student_token", token, {
      httpOnly: true,
      // secure: true, // Uncomment this when you deploy to HTTPS (like Vercel)
    });

    return res;
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}