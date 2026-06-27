import nodemailer from "nodemailer";
import { docClient } from "@/lib/dynamodb";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import bcryptjs from "bcryptjs";

export const sendEmail = async ({ email, emailType, userId }) => {
  try {
    // 1. Create a hashed token
    const hashedToken = await bcryptjs.hash(userId.toString(), 10);
    console.log(hashedToken);

    // 2. DynamoDB update configurations based on emailType
    // We define the table name and the attributes to update
    let tableName = "";
    let updateExpression = "";
    
    switch (emailType) {
      case "VERIFY":
        tableName = "Users";
        updateExpression = "set verifyToken = :token, verifyTokenExpiry = :expiry";
        break;
      case "VERIFY_LECTURER":
        tableName = "Lecturers"; // Make sure you create a 'Lecturers' table in DynamoDB!
        updateExpression = "set verifyToken = :token, verifyTokenExpiry = :expiry";
        break;
      case "RESET":
        tableName = "Users";
        updateExpression = "set forgotPasswordToken = :token, forgotPasswordTokenExpiry = :expiry";
        break;
      case "RESET_LECTURER":
        tableName = "Lecturers"; // Make sure you create a 'Lecturers' table in DynamoDB!
        updateExpression = "set forgotPasswordToken = :token, forgotPasswordTokenExpiry = :expiry";
        break;
      default:
        break;
    }

    // 3. Execute the DynamoDB Update
    if (tableName !== "") {
      const updateCommand = new UpdateCommand({
        TableName: tableName,
        Key: { email: userId }, // Assuming 'email' is the Partition Key for both tables
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: {
          ":token": hashedToken,
          ":expiry": Date.now() + 3600000, // 1 hour from now
        },
      });
      await docClient.send(updateCommand);
    }

    // 4. Nodemailer transporter
    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // 5. Determine Email Subject and Title
    const isVerify = emailType.includes("VERIFY");
    const subject = isVerify ? "Verify Your Email Address" : "Reset Your Password";
    const titleText = isVerify ? "Verify Your Email" : "Reset Your Password";
    const bodyText = isVerify 
      ? "Thank you for signing up! Please click the button below to verify your email address and activate your account."
      : "It looks like you forgot your password. Click the button below to securely reset it.";
    const buttonText = isVerify ? "Verify Email" : "Reset Password";

    // NEW: Determine the correct URL based on email type and role
    const isLecturer = emailType.includes("LECTURER");
    const basePath = isVerify ? "verify-email" : "reset-password";
    const rolePath = isLecturer ? "lecturer/" : "";
    
    const verifyUrl = `${process.env.DOMAIN}/${rolePath}${basePath}?token=${hashedToken}`;

    // 6. Enhanced Aesthetic HTML Template
    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #f4f7f6; font-family: Arial, Helvetica, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f7f6; padding: 40px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                
                <!-- Header -->
                <tr>
                  <td align="center" style="background-color: #2563EB; padding: 30px 0;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">Quiz App</h1>
                  </td>
                </tr>
                
                <!-- Body -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="color: #333333; text-align: center; margin-top: 0; margin-bottom: 20px;">${titleText}</h2>
                    <p style="color: #666666; line-height: 1.6; text-align: center; font-size: 16px;">
                      ${bodyText}
                    </p>
                    
                    <!-- Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 30px 0;">
                          <a href="${verifyUrl}" 
                             style="background-color: #2563EB; color: #ffffff; text-decoration: none; padding: 15px 35px; border-radius: 5px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 2px 5px rgba(37, 99, 235, 0.3);">
                             ${buttonText}
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Fallback Link -->
                    <p style="color: #999999; font-size: 13px; text-align: center; margin-top: 20px;">
                      If the button doesn't work, copy and paste this link into your browser:<br>
                      <a href="${verifyUrl}" style="color: #2563EB; word-break: break-all; text-decoration: none;">
                        ${verifyUrl}
                      </a>
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f9f9f9; padding: 20px 30px; text-align: center; border-top: 1px solid #eeeeee;">
                    <p style="color: #888888; font-size: 12px; margin: 0;">
                      &copy; ${new Date().getFullYear()} Quiz App. All rights reserved.<br>
                      If you did not request this email, please ignore it.
                    </p>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.SMTP_EMAIL,
      to: email,
      subject: subject,
      html: htmlTemplate,
    };

    console.log("Sending email to:", email);
    return await transport.sendMail(mailOptions);
  } catch (error) {
    console.error("Error in sendEmail:", error);
    throw new Error(error.message);
  }
};