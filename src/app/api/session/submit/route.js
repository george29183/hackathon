import { NextResponse } from "next/server";
import { docClient } from "@/lib/dynamodb";
import { GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import jwt from "jsonwebtoken";

export async function POST(request) {
  try {
    // 1. Get questionData from frontend (FIXED!)
    const { quizId, questionData } = await request.json();
    
    const token = request.cookies.get("student_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    const studentEmail = decoded.email;

    // 2. Fetch the original quiz to check answers
    const quizRes = await docClient.send(new GetCommand({ TableName: "Quizzes", Key: { quizId } }));
    const quiz = quizRes.Item;

      // NEW: Prevent crash if quiz was deleted by lecturer
    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found." }, { status: 404 });
    }
    
    // 3. Grade the quiz
    let score = 0;
    const gradedAnswers = quiz.questions.map((q, index) => {
      const formatString = (str) => String(str || "").trim().toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");
      
      let correctAnsText = q.correctAnswer;
      if (["a", "b", "c", "d"].includes(formatString(q.correctAnswer))) {
        const letterIndex = q.correctAnswer.toUpperCase().charCodeAt(0) - 65;
        if (q.options && q.options[letterIndex]) correctAnsText = q.options[letterIndex];
      }
      
      const qData = questionData[index] || { selectedAnswer: null, isChanged: false, timeSpent: [] };
      const studentAns = formatString(qData.selectedAnswer);
      const correctAns = formatString(correctAnsText);
      
      const isCorrect = studentAns === correctAns;
      if (isCorrect) score++;
      
      // Calculate total time spent across all visits
      const totalTime = qData.timeSpent.reduce((acc, time) => acc + time, 0);
      
      return {
        questionIndex: index,
        selectedAnswer: qData.selectedAnswer || "No Answer",
        correctAnswer: correctAnsText,
        isCorrect: isCorrect,
        isChanged: qData.isChanged || false,
        timeSpent: totalTime,
        timePerVisit: qData.timeSpent,
        answeredPresence: qData.answeredPresence || "active",
      };
    });

    // 4. Generate the exact same sessionId we used when we started!
    const sessionId = `${quizId}-${studentEmail}`;

    // 5. UPDATE the existing session in DynamoDB
    await docClient.send(new UpdateCommand({
      TableName: "QuizSessions",
      Key: { sessionId: sessionId },
      UpdateExpression: "set #status = :s, score = :sc, totalQuestions = :tq, gradedAnswers = :ga, completedAt = :ca, quizTitle = :qt",
      ExpressionAttributeNames: {
        "#status": "status"
      },
      ExpressionAttributeValues: {
        ":s": "completed",
        ":sc": score,
        ":tq": quiz.questions.length,
        ":ga": gradedAnswers,
        ":ca": new Date().toISOString(),
        ":qt": quiz.title
      },
    }));

    return NextResponse.json({
      success: true,
      message: "Quiz submitted successfully!",
      result: { score, totalQuestions: quiz.questions.length, gradedAnswers }
    });

  } catch (error) {
    console.error("Submit Error:", error);
    return NextResponse.json({ error: "Failed to submit quiz" }, { status: 500 });
  }
}