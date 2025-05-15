// app/api/mercure/proxy/route.ts
export const runtime = "edge"; // optional for prod, remove for local if streaming issues

import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const topic = searchParams.get("topic")!;
  const token = searchParams.get("authorization")!;

  const hub = new URL(process.env.NEXT_PUBLIC_MERCURE_HUB_URL!);
  hub.pathname = "/.well-known/mercure";
  hub.searchParams.append("topic", topic);

  const mercureRes = await fetch(hub.toString(), {
    headers: {
      Accept: "text/event-stream",
      Authorization: `Bearer ${token}`, // ← pass it here
    },
  });

  if (!mercureRes.ok) {
    return new Response(`Mercure hub error ${mercureRes.status}`, {
      status: mercureRes.status,
    });
  }

  return new Response(mercureRes.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
