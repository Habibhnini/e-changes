// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "./components/Navbar";
import "./globals.css";

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
  // You would normally get this from your auth context
  const isLoggedIn = true; // or true to show the logged-in version
  const points = 250;

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
        {/* Add Georgia font */}
        <style>{`
          .font-georgia {
            font-family: Georgia, serif;
          }
        `}</style>
      </head>
      <body className={inter.className}>
        <Navbar isLoggedIn={isLoggedIn} points={points} />
        {children}
      </body>
    </html>
  );
}
