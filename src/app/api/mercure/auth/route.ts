// app/api/mercure/auth/route.ts
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET() {
  try {
    // Create a JWT token with proper subscriber rights
    const token = jwt.sign(
      {
        mercure: {
          subscribe: ["chat/test"],
        },
      },
      process.env.MERCURE_JWT_SECRET || "",
      { expiresIn: "1h" }
    );

    // Return the token to the client
    return NextResponse.json({ token });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
