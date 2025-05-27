import { Suspense } from "react";
import ExplorerPageContent from "./ExplorerPageContent";

export default function ExplorerPage() {
  return (
    <Suspense fallback={<div className="text-center py-12">Chargement...</div>}>
      <ExplorerPageContent />
    </Suspense>
  );
}
