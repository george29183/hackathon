import { NextResponse } from "next/server";
import { docClient } from "@/lib/dynamodb";
import { ScanCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import bcryptjs from "bcryptjs";

export async function POST(request) {
  try {
    const { token, newPassword } = await request.json();

    // 1. Helper to scan for the reset token
    const findUserByToken = async (tableName) => {
      const scanCommand = new ScanCommand({
        TableName: tableName,
        FilterExpression: "forgotPasswordToken = :token AND forgotPasswordTokenExpiry > :currentTime",
        ExpressionAttributeValues: {
          ":token": token,
          ":currentTime": Date.now(),
        },
      });
      const response = await docClient.send(scanCommand);
      return response.Items && response.Items.length > 0 ? response.Items[0] : null;
    };

    // 2. Check Users table first, then Lecturers
    let user = await findUserByToken("Users");
    let userTable = "Users";

    if (!user) {
      user = await findUserByToken("Lecturers");
      userTable = "Lecturers";
    }

    if (!user) {
      return NextResponse.json({ error: "Invalid or expired reset token." }, { status: 400 });
    }

    // 3. Hash the new password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(newPassword, salt);

    // 4. Update password and remove the reset tokens
    await docClient.send(new UpdateCommand({
      TableName: userTable,
      Key: { email: user.email },
      UpdateExpression: "SET password = :pwd REMOVE forgotPasswordToken, forgotPasswordTokenExpiry",
      ExpressionAttributeValues: {
        ":pwd": hashedPassword,
      },
    }));

    return NextResponse.json({ success: true, message: "Password updated successfully!" });

  } catch (error) {
    console.error("Reset Password Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}