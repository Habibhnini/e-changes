// components/NavbarWrapper.tsx
"use client";

import { useAuth } from "../contexts/AuthContext";
import Navbar from "./Navbar";

export default function NavbarWrapper() {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return null;
  // Determine energy points from user if available
  const points = user?.energyBalance || 0;

  return <Navbar isLoggedIn={isAuthenticated} points={points} />;
}
