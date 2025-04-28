// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import NavbarWrapper from "./components/NavbarWarpper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "E-Changes",
  description: "Your platform for eco-friendly exchanges",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Pacifico&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Assistant:wght@200;300;400;500;600;700;800&display=swap"
        />

        {/* Add Georgia font */}
        <style>{`
          .font-georgia {
            font-family: Georgia, serif;
          }
          .font-assistant {
            font-family: 'Assistant', sans-serif;
          }
        `}</style>
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <NavbarWrapper />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
