"use client";

import { Suspense } from "react";
import ChatClient from "./ChatClient";
import { useSubscriptionStatus } from "../hooks/useSubscription";
import SubscriptionRequired from "../components/SubscriptionRequired";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ChatPage() {
  const { isActive, loading } = useSubscriptionStatus();
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth");
    }
  }, []);
  if (loading) {
    return <ChatLoadingFallback />;
  }

  if (!isActive) {
    return <SubscriptionRequired />;
  }

  return (
    <Suspense fallback={<ChatLoadingFallback />}>
      <ChatClient />
    </Suspense>
  );
}

function ChatLoadingFallback() {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#38AC8E]"></div>
    </div>
  );
}
