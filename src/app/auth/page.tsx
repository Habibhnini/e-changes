import { Suspense } from "react";
import AuthClient from "./AuthClient";

export default function AuthPage() {
  return (
    <Suspense fallback={<AuthLoadingFallback />}>
      <AuthClient />
    </Suspense>
  );
}

function AuthLoadingFallback() {
  return (
    <div
      className="min-h-[92.9vh] flex items-center justify-center bg-teal-500 px-4 sm:px-6 lg:px-8"
      style={{
        backgroundImage: "url('/images/background.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
    </div>
  );
}
