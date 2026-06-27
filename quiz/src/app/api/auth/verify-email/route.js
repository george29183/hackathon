import { NextResponse } from "next/server";
import { docClient } from "@/lib/dynamodb";
import { ScanCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

export async function POST(request) {
  try {
    // 1. Get token from frontend
    const reqBody = await request.json();
    const { token } = reqBody;
    console.log("Token received:", token);

    // 2. Helper function to scan a table for the token
    const findUserByToken = async (tableName) => {
      const scanCommand = new ScanCommand({
        TableName: tableName,
        FilterExpression: "verifyToken = :token AND verifyTokenExpiry > :currentTime",
        ExpressionAttributeValues: {
          ":token": token,
          ":currentTime": Date.now(),
        },
      });
      const response = await docClient.send(scanCommand);
      // Return the first item found, or null if none
      return response.Items && response.Items.length > 0 ? response.Items[0] : null;
    };

    // 3. Check Users table first, then Lecturers table
    let user = await findUserByToken("Users");
    let userTable = "Users";

    if (!user) {
      // If not found in Users, check Lecturers
      user = await findUserByToken("Lecturers");
      userTable = "Lecturers";
    }

    console.log("User found:", user);

    // 4. If no user found in either table
    if (!user) {
      return NextResponse.json(
        { message: "Invalid token or token expired", success: false },
        { status: 400 }
      );
    }

        // 5. Update the user to verified
    const updateCommand = new UpdateCommand({
      TableName: userTable,
      Key: { email: user.email },
      UpdateExpression: "SET isVerified = :true REMOVE verifyToken, verifyTokenExpiry", // <--- FIXED HERE
      ExpressionAttributeValues: {
        ":true": true,
      },
    });

    await docClient.send(updateCommand);
    console.log("User verified successfully!");

    return NextResponse.json({
      message: "Email verified successfully",
      success: true,
      data: { isAdmin: user.isAdmin || false }, // Safely check isAdmin
    });
  } catch (error) {
    console.error("Verification Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}