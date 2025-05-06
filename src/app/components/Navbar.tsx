// components/Navbar.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../contexts/AuthContext";

interface NavbarProps {
  isLoggedIn?: boolean;
  points?: number;
}

const Navbar: React.FC<NavbarProps> = ({
  isLoggedIn = false,
  points = 250,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  return (
    <nav className="border-b border-gray-200">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Mobile menu button - now on left side */}
          <div className="flex items-center sm:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>

          {/* Logo and Desktop Navigation */}
          <div className="hidden sm:flex sm:items-center">
            {/* Logo - only visible on desktop */}
            <Link href="/" className="flex-shrink-0 flex items-center">
              <Image
                src="/logo.png"
                alt="e-changes logo"
                width={150}
                height={40}
                className="h-10 w-auto"
                priority
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="ml-6 flex space-x-6">
              <Link
                href="/explorer"
                className="px-2 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Explorer
              </Link>
              <Link
                href="/apropos"
                className="px-2 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                A propos
              </Link>
            </div>
          </div>

          {/* Right side navigation */}
          <div className="flex items-center">
            {isLoggedIn ? (
              <>
                {/* Points - only on desktop */}
                <div className="flex items-center px-3 py-1 rounded-full  mr-4">
                  <Image
                    src="/coin.png"
                    alt="User profile"
                    width={40}
                    height={40}
                    className=" object-cover mr-2 w-5 h-5"
                  />
                  <span className="text-[#F4C300] font-medium">{points}</span>
                </div>
                {/* Settings icon */}
                <button className="p-2 rounded-md text-gray-500 hover:text-gray-700 mr-2">
                  <Image
                    src="/settings.png"
                    alt="User profile"
                    width={40}
                    height={40}
                    className="w-5 h-5 object-cover"
                  />
                </button>
                {/* Notification bell */}
                <Link
                  href={"/chat"}
                  className="p-2 rounded-md text-gray-500 hover:text-gray-700 mr-2"
                >
                  <Image
                    src="/bell.png"
                    alt="User profile"
                    width={24}
                    height={24}
                    className="w-4 h-5 "
                  />
                </Link>

                {/* Eco icon */}
                <button className="p-2 rounded-md text-teal-500 hover:text-teal-600 mr-2">
                  <Image
                    src="/shake.png"
                    alt="User profile"
                    width={40}
                    height={40}
                    className="w-5 h-5 object-cover"
                  />
                </button>

                {/* User profile */}
                <div className="ml-2 relative">
                  <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-gray-200">
                    <Link href={"/profile"}>
                      <Image
                        src={
                          user?.userInfo?.photoIdPath
                            ? `${process.env.NEXT_PUBLIC_API_URL}${user.userInfo.photoIdPath}`
                            : "/placeholder.png"
                        }
                        alt="User profile"
                        width={40}
                        height={40}
                        className="h-full w-full object-cover"
                      />
                    </Link>
                  </div>
                </div>
              </>
            ) : (
              // Not logged in - show login button with full rounded corners
              <div className="flex-shrink-0">
                <Link
                  href="/auth"
                  className="border border-teal-500 text-teal-500 rounded-full px-4 py-2 text-sm font-medium hover:bg-teal-50"
                >
                  Connexion / Inscription
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on state */}
      {isMobileMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              href="/explorer"
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            >
              Explorer
            </Link>
            <Link
              href="#"
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            >
              A propos
            </Link>
            {!isLoggedIn && (
              <Link
                href="#"
                className="block px-3 py-2 text-base font-medium text-teal-500 hover:text-teal-600 hover:bg-gray-50"
              >
                Connexion / Inscription
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
