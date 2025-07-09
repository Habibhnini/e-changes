"use client";

import { Suspense } from "react";
import { useSubscriptionStatus } from "../hooks/useSubscription";
import WalletPage from "./WalletPage";
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
      <WalletPage />
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
