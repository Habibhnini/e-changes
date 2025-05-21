"use client";

import { Suspense } from "react";
import { useSubscriptionStatus } from "../hooks/useSubscription";
import WalletPage from "./WalletPage";

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
    return (
      <div className="text-center mt-20 text-red-500">
        Accès réservé aux abonnés actifs.
      </div>
    );
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
