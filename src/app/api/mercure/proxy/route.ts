// app/api/mercure/proxy/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Extract the query parameters
  const url = new URL(request.url);
  const topic = url.searchParams.get("topic");
  const authorization = url.searchParams.get("authorization");

  console.log(`MERCURE PROXY: Called with topic: ${topic}`);

  // Create the target URL
  const targetUrl = new URL(
    "/.well-known/mercure",
    process.env.NEXT_PUBLIC_MERCURE_HUB_URL || "http://localhost:3001"
  );

  // Add topic parameter
  if (topic) {
    targetUrl.searchParams.append("topic", topic);
  }

  // Add authorization if provided
  if (authorization) {
    targetUrl.searchParams.append("authorization", authorization);
  }

  console.log(`MERCURE PROXY: Connecting to hub: ${targetUrl.toString()}`);

  try {
    // Make the fetch request to Mercure
    const response = await fetch(targetUrl.toString(), {
      headers: {
        Accept: "text/event-stream",
      },
      duplex: "half", // Required for streaming responses
    });

    if (!response.ok) {
      console.error(
        `MERCURE PROXY: Error from Mercure hub: ${response.status} ${response.statusText}`
      );
      return NextResponse.json(
        { error: `Mercure hub returned ${response.status}` },
        { status: response.status }
      );
    }

    console.log(
      `MERCURE PROXY: Connection successful, status: ${response.status}`
    );

    // Create a new response with the appropriate headers for SSE
    const newResponse = new NextResponse(response.body, {
      status: response.status,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });

    return newResponse;
  } catch (error) {
    console.error("MERCURE PROXY: Error connecting to Mercure hub:", error);
    return NextResponse.json(
      { error: "Failed to connect to Mercure hub" },
      { status: 500 }
    );
  }
}
