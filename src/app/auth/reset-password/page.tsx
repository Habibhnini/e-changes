// app/auth/reset-password/page.tsx
import React, { Suspense } from "react";
import PasswordResetWrapper from "./PasswordResetWrapper";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <PasswordResetWrapper />
    </Suspense>
  );
}
