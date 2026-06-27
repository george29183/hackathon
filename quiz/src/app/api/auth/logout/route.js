import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = NextResponse.json({
      message: "Logged out successfully",
      success: true,
    });

    // Clear both cookies by setting their value to empty and expiring them immediately
    response.cookies.set("student_token", "", {
      httpOnly: true,
      expires: new Date(0),
    });
    
    response.cookies.set("lecturer_token", "", {
      httpOnly: true,
      expires: new Date(0),
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}