// hooks/useApiErrorHandler.ts
"use client";

import { useRouter } from "next/navigation";

export function useApiErrorHandler() {
  const router = useRouter();

  return (error: any) => {
    if (error?.status === 401 && error?.redirect) {
      router.push(error.redirect);
    } else {
      throw error; // rethrow if not handled
    }
  };
}
