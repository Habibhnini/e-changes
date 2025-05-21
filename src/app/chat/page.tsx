"use client";

import { Suspense } from "react";
import ChatClient from "./ChatClient";
import { useSubscriptionStatus } from "../hooks/useSubscription";

export default function ChatPage() {
  const { isActive, loading } = useSubscriptionStatus();

  if (loading) {
    return <ChatLoadingFallback />;
  }

  if (!isActive) {
    return (
      <div className="text-center mt-10 text-red-500">
        Accès réservé aux abonnés actifs
      </div>
    );
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
