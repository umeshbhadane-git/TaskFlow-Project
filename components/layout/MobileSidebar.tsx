"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

import { navigationItems } from "@/components/layout/navigation";

interface MobileSidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export default function MobileSidebar({
  user,
}: MobileSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  function closeSidebar() {
    setIsOpen(false);
  }

  const userName = user.name || "User";
  const userEmail = user.email || "";

  const initials = userName
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      {/* Menu Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Open navigation menu"
        aria-expanded={isOpen}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 lg:hidden dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Overlay */}
      {isOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={closeSidebar}
          className="fixed inset-0 z-[55] cursor-default bg-black/40 lg:hidden"
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        aria-label="Mobile navigation sidebar"
        className={`fixed left-0 top-0 z-[60] h-dvh w-[85vw] max-w-72 overflow-hidden border-r border-gray-200 bg-white shadow-xl transition-transform duration-200 ease-in-out dark:border-gray-800 dark:bg-gray-950 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full min-h-0 flex-col">
          {/* Header */}
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 px-4 dark:border-gray-800">
            <Link
              href="/dashboard"
              onClick={closeSidebar}
              className="text-lg font-bold text-gray-900 dark:text-white"
            >
              TaskFlow
            </Link>

            <button
              type="button"
              onClick={closeSidebar}
              aria-label="Close navigation menu"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav
            aria-label="Mobile navigation"
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4"
          >
            <ul className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={closeSidebar}
                      className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                    >
                      <Icon className="h-5 w-5 shrink-0" />

                      <span className="truncate">
                        {item.label}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Profile Section */}
          <div className="shrink-0 border-t border-gray-200 p-4 dark:border-gray-800">
            <Link
              href="/profile"
              onClick={closeSidebar}
              className="group flex items-center gap-3 rounded-xl p-2 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:hover:bg-gray-800"
            >
              {/* Avatar */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-100 text-sm font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-400">
                {user.image ? (
                  <img
                    src={user.image}
                    alt={`${userName}'s avatar`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>

              {/* User Information */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                  {userName}
                </p>

                <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                  {userEmail}
                </p>
              </div>
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
