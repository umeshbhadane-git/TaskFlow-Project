import Link from "next/link";

import { auth } from "@/lib/auth";
import ThemeToggle from "@/components/layout/ThemeToggle";
import LogoutButton from "@/components/layout/LogoutButton";
import MobileSidebar from "@/components/layout/MobileSidebar";

export default async function Navbar() {
  const session = await auth();

  const isAuthenticated = !!session?.user;

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur dark:border-gray-800 dark:bg-gray-950/95">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Left Side */}
        <div className="flex items-center gap-2">
          {/* Mobile Menu */}
          {isAuthenticated && (
            <MobileSidebar
              user={{
                name: session.user.name,
                email: session.user.email,
                image: session.user.image,
              }}
            />
          )}

          {/* Logo */}
          <Link
            href={isAuthenticated ? "/dashboard" : "/"}
            className="text-xl font-bold tracking-tight text-gray-900 transition hover:opacity-80 dark:text-white"
          >
            Task<span className="text-blue-600 dark:text-blue-400">Flow</span>
          </Link>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-1">
          {isAuthenticated ? (
            <>
              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Logout */}
              <LogoutButton />
            </>
          ) : (
            <>
              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Get Started */}
              <Link
                href="/register"
                className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
