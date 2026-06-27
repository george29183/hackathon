import { NextResponse } from "next/server";
import { docClient } from "@/lib/dynamodb";
import { PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto"; 
import jwt from "jsonwebtoken";


export async function POST(request) {
  try {
    // 1. Get the dynamic quiz data from the frontend
    const reqBody = await request.json();
    console.log("Data received from frontend:", reqBody);

    // 2. Get Lecturer Email from token
    const token = request.cookies.get("lecturer_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    const lecturerEmail = decoded.email;

    // 3. Prepare the item with generated fields
    const newQuiz = {
      quizId: `quiz-${randomUUID().split("-")[0]}`, // REQUIRED: Generate Partition Key
      lecturerEmail: lecturerEmail, // REQUIRED: So it shows on the dashboard
      title: reqBody.title || "Untitled Quiz",
      difficulty: reqBody.difficulty || "medium",
      category: reqBody.category || "General",
      questions: reqBody.questions,
      timeLimit: parseInt(reqBody.timeLimit || "5", 10),
      // Generate secret code for students to join
      quizCode: `${reqBody.title.substring(0, 4).toUpperCase().replace(/\s/g, '')}-${randomUUID().split("-")[0].toUpperCase()}`,
      createdAt: new Date().toISOString(),
    };

    // 4. Save to DynamoDB
    const command = new PutCommand({
      TableName: "Quizzes",
      Item: newQuiz,
    });

    await docClient.send(command);

    // 5. Return success response
    return NextResponse.json(
      { 
        message: "Quiz created successfully!", 
        success: true, 
        quiz: newQuiz 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error saving quiz:", error);
    return NextResponse.json(
      { error: "Failed to save quiz", details: error.message },
      { status: 500 }
    );
  }
}

// UPDATED GET: Fetch quizzes ONLY for the logged-in lecturer
export async function GET(request) {
  try {
    // 1. Get the token from the cookies
    const token = request.cookies.get("lecturer_token")?.value;
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Decode the token to get the lecturer's email
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    const lecturerEmail = decoded.email;

    // 3. Scan the table but FILTER by lecturerEmail
    const command = new ScanCommand({
      TableName: "Quizzes",
      FilterExpression: "lecturerEmail = :email",
      ExpressionAttributeValues: {
        ":email": lecturerEmail,
      },
    });

    const response = await docClient.send(command);

    return NextResponse.json(
      { quizzes: response.Items, success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    return NextResponse.json(
      { error: "Failed to fetch quizzes" },
      { status: 500 }
    );
  }
}