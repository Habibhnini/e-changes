"use client";

import { Suspense } from "react";
import TransactionPage from "./TransactionPage";
import { useSubscriptionStatus } from "../hooks/useSubscription";
import SubscriptionRequired from "../components/SubscriptionRequired";
import { useAuth } from "../contexts/AuthContext";

export default function Page() {
  const { isActive, loading } = useSubscriptionStatus();
  const { isAuthenticated } = useAuth();

  // If user is not authenticated, AuthContext will handle redirect
  if (!isAuthenticated) {
    return <LoadingFallback />;
  }

  if (loading) {
    return <LoadingFallback />;
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
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
    </div>
  );
}
