import { NextResponse } from "next/server";
import { docClient } from "@/lib/dynamodb";
import { GetCommand } from "@aws-sdk/lib-dynamodb";

// Notice we now await the params object!
export async function GET(request, { params }) {
  try {
    // 1. Unwrap the promise to get the quizId
    const { quizId } = await params;

    // 2. Fetch the quiz from DynamoDB using the Partition Key
    const command = new GetCommand({
      TableName: "Quizzes",
      Key: {
        quizId: quizId,
      },
    });

    const response = await docClient.send(command);

    // 3. If the quiz doesn't exist in the database
    if (!response.Item) {
      return NextResponse.json(
        { error: "Quiz not found" },
        { status: 404 }
      );
    }

    // 4. Return the quiz data to the frontend
    return NextResponse.json(
      { quiz: response.Item, success: true },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error fetching quiz:", error);
    return NextResponse.json(
      { error: "Failed to fetch quiz", details: error.message },
      { status: 500 }
    );
  }
}