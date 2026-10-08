"use client";

import { useActionState } from "react";

import {
  createJoinRequest,
  type CreateJoinRequestActionResult,
} from "@/features/workspace/actions/createJoinRequest";

interface JoinWorkspaceButtonProps {
  workspaceId: string;
}

const initialState: CreateJoinRequestActionResult = {
  success: false,
  error: {
    code: "",
    message: "",
  },
};

export default function JoinWorkspaceButton({
  workspaceId,
}: JoinWorkspaceButtonProps) {
  const [state, formAction, isPending] = useActionState(
    createJoinRequest,
    initialState
  );

  if (state.success) {
    return (
      <div className="space-y-2">
        <span className="inline-flex items-center justify-center rounded-lg bg-green-100 px-4 py-2.5 text-sm font-semibold text-green-700 dark:bg-green-950/40 dark:text-green-400">
          Request Sent
        </span>

        <p className="text-xs text-green-600 dark:text-green-400">
          Waiting for workspace owner approval.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <form action={formAction}>
        <input
          type="hidden"
          name="workspaceId"
          value={workspaceId}
        />

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Sending..." : "Request to Join"}
        </button>
      </form>

      {state.error.message && (
        <p className="max-w-xs text-xs text-red-500">
          {state.error.message}
        </p>
      )}
    </div>
  );
}