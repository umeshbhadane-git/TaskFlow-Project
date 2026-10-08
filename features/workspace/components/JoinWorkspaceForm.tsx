"use client";

import { useActionState } from "react";

import {
  createJoinRequest,
  type CreateJoinRequestActionResult,
} from "@/features/workspace/actions/createJoinRequest";

const initialState: CreateJoinRequestActionResult = {
  success: false,
  error: {
    code: "",
    message: "",
  },
};

export default function JoinWorkspaceForm() {
  const [state, formAction, isPending] = useActionState(
    createJoinRequest,
    initialState
  );

  return (
    <form action={formAction} className="space-y-6">
      {/* Workspace ID */}
      <div>
        <label
          htmlFor="workspaceId"
          className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
        >
          Workspace ID
        </label>

        <input
          id="workspaceId"
          name="workspaceId"
          type="text"
          placeholder="Enter workspace ID"
          required
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        />

        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Enter the ID of the workspace you want to join.
        </p>
      </div>

      {/* Error */}
      {!state.success && state.error.message && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400">
          {state.error.message}
        </div>
      )}

      {/* Success */}
      {state.success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-400">
          {state.message}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Sending Request..." : "Request to Join"}
      </button>
    </form>
  );
}