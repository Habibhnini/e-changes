import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET() {
  try {
    // Create a JWT token with publisher rights
    const token = jwt.sign(
      {
        mercure: {
          publish: ["chat/test"], // Publisher rights for chat/test topic
        },
      },
      process.env.MERCURE_JWT_SECRET || "",
      { expiresIn: "1h" }
    );

    // Create the data to publish
    const data = {
      message: "Test message from Next.js",
      timestamp: new Date().toISOString(),
    };

    // The URL to publish to
    const url = "http://172.29.103.184:3001/.well-known/mercure";

    // Make the POST request to publish
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        topic: "chat/test",
        data: JSON.stringify(data),
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        {
          success: false,
          message: "Failed to publish",
          code: response.status,
          error,
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Message published successfully",
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}
