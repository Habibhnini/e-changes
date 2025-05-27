"use client";

import { Suspense } from "react";
import TransactionPage from "./TransactionPage";
import { useSubscriptionStatus } from "../hooks/useSubscription";
import SubscriptionRequired from "../components/SubscriptionRequired";

export default function Page() {
  const { isActive, loading } = useSubscriptionStatus();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!isActive) {
    return <SubscriptionRequired />;
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <TransactionPage />
    </Suspense>
  );
}

function LoadingFallback() {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500" />
    </div>
  );
}
