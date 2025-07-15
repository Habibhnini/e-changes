// app/profile/page.tsx or .jsx
import { Suspense } from "react";
import ProfilePageContent from "./profilePageContent";

export default function ProfilePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProfilePageContent />
    </Suspense>
  );
}
