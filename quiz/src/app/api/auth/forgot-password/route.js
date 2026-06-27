import { NextResponse } from "next/server";
import { docClient } from "@/lib/dynamodb";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { sendEmail } from "@/helpers/nodemailer";

export async function POST(request) {
  try {
    const { email } = await request.json();

    // Check if email exists in Users or Lecturers
    const userRes = await docClient.send(new ScanCommand({ TableName: "Users", FilterExpression: "email = :e", ExpressionAttributeValues: { ":e": email } }));
    const lecturerRes = await docClient.send(new ScanCommand({ TableName: "Lecturers", FilterExpression: "email = :e", ExpressionAttributeValues: { ":e": email } }));

    if (userRes.Items.length > 0) {
      await sendEmail({ email, emailType: "RESET", userId: email });
    } else if (lecturerRes.Items.length > 0) {
      await sendEmail({ email, emailType: "RESET_LECTURER", userId: email });
    } else {
      // For security, don't tell them the email doesn't exist.
      return NextResponse.json({ success: true, message: "If the email exists, a reset link has been sent." });
    }

    return NextResponse.json({ success: true, message: "If the email exists, a reset link has been sent." });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}