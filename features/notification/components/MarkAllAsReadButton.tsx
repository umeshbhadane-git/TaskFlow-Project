"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { markNotificationsAsRead } from "@/features/notification/actions/markNotificationsAsRead";

export default function MarkAllAsReadButton() {
  const router = useRouter();

  const [isPending, setIsPending] =
    useState(false);

  const [error, setError] =
    useState("");

  async function handleMarkAllAsRead() {
    setIsPending(true);
    setError("");

    try {
      const result =
        await markNotificationsAsRead();

      if (result.success) {
        router.refresh();
      } else {
        setError(result.error.message);
      }
    } catch {
      setError(
        "Unable to update notifications."
      );
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleMarkAllAsRead}
        disabled={isPending}
        className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        {isPending
          ? "Marking..."
          : "Mark all as read"}
      </button>

      {error && (
        <p className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
