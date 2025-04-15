// app/explorer/layout.tsx
import React from "react";

export default function ExplorerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <section>{children}</section>;
}
