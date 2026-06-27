import { NextResponse } from "next/server";
import { docClient } from "@/lib/dynamodb";
import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import bcryptjs from "bcryptjs";
import { sendEmail } from "@/helpers/nodemailer"; // Make sure this path matches your project!

export async function POST(request) {
  try {
    // 1. Get credentials
    const reqBody = await request.json();
    const {
      username,
      password,
      email,
    } = reqBody;
    console.log(reqBody);

    // 2. Check if user already exists
    // Because 'email' is our Partition Key, we use GetCommand to check if they exist
    const getCommand = new GetCommand({
      TableName: "Users",
      Key: { email: email },
    });
    const existingUser = await docClient.send(getCommand);

    if (existingUser.Item) {
      return NextResponse.json(
        { message: "Email already exists", success: false },
        { status: 400 }
      );
    }

    // 3. Hash the password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);
    console.log(hashedPassword);

    // 4. Create the user object
    // DynamoDB's DocumentClient handles nested objects (like 'location') automatically!
    const newUser = {
      email, // Partition Key must be here
      username,
      password: hashedPassword,
      isVerified: false, // Good practice to add this for email verification
      dateCreated: new Date().toISOString(), // Using ISO string is best practice for dates in DynamoDB
    };

    console.log(newUser);

    // 5. Save user to DynamoDB
    const putCommand = new PutCommand({
      TableName: "Users",
      Item: newUser,
    });

    await docClient.send(putCommand);
    console.log("user saved");

    // 6. Send Verification Email
    // Note: In MongoDB you used savedUser._id. In DynamoDB, we use the email as the ID.
    await sendEmail({ email, emailType: "VERIFY", userId: email });
    console.log("email sent");

    return NextResponse.json({
      message: "Student created successfully",
      success: true,
      savedUser: newUser,
    });
  } catch (error) {
    console.error("Signup Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}