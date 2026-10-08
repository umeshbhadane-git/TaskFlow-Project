
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { deleteWorkspace } from "@/features/workspace/actions/deleteWorkspace";

interface DeleteWorkspaceButtonProps {
  workspaceId: string;
}

export default function DeleteWorkspaceButton({
  workspaceId,
}: DeleteWorkspaceButtonProps) {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    setIsPending(true);
    setError("");

    try {
      const formData = new FormData();

      formData.append("workspaceId", workspaceId);

      const result = await deleteWorkspace(
        undefined as never,
        formData
      );

      if (result.success) {
        setIsOpen(false);
        router.push("/workspaces");
        router.refresh();
        return;
      }

      setError(result.error.message);
    } catch (error) {
      console.error("Delete workspace error:", error);

      setError("Unable to delete the workspace.");
    } finally {
      setIsPending(false);
    }
  }

  function handleCancel() {
    if (isPending) {
      return;
    }

    setError("");
    setIsOpen(false);
  }

  return (
    <>
      {/* Delete Button */}
      <button
        type="button"
        onClick={() => {
          setError("");
          setIsOpen(true);
        }}
        className="rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 dark:border-red-900/50 dark:bg-gray-900 dark:text-red-400 dark:hover:bg-red-950/30"
      >
        Delete Workspace
      </button>

      {/* Confirmation Dialog */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-workspace-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-gray-900">
            {/* Title */}
            <h2
              id="delete-workspace-title"
              className="text-lg font-semibold text-gray-900 dark:text-white"
            >
              Delete workspace?
            </h2>

            {/* Description */}
            <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
              Are you sure you want to delete this workspace?
            </p>

            {/* Warning */}
            <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-400">
              <p className="font-medium">
                This action will:
              </p>

              <ul className="mt-2 list-inside list-disc space-y-1">
                <li>Mark the workspace as inactive.</li>
                <li>Remove all tasks from this workspace.</li>
                <li>Remove pending join requests.</li>
                <li>Prevent normal workspace activity.</li>
              </ul>
            </div>

            {/* Error */}
            {error && (
              <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-400">
                {error}
              </p>
            )}

            {/* Actions */}
            <div className="mt-6 flex justify-end gap-3">
              {/* Cancel */}
              <button
                type="button"
                onClick={handleCancel}
                disabled={isPending}
                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Cancel
              </button>

              {/* Confirm */}
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPending
                  ? "Deleting..."
                  : "Yes, delete workspace"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
