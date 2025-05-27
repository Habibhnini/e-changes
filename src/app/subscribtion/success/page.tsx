// app/subscribtion/success/page.tsx
import { Suspense } from "react";
import SuccessClient from "./SuccessClient"; // this should be the client component using useSearchParams

export default function SuccessPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <SuccessClient />
    </Suspense>
  );
}
