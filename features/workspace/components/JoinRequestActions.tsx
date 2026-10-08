"use client";

import { useActionState } from "react";

import {
  respondToJoinRequest,
  type RespondToJoinRequestActionResult,
} from "@/features/workspace/actions/respondToJoinRequest";

interface JoinRequestActionsProps {
  requestId: string;
}

const initialState: RespondToJoinRequestActionResult = {
  success: false,
  error: {
    code: "",
    message: "",
  },
};

export default function JoinRequestActions({
  requestId,
}: JoinRequestActionsProps) {
  const [state, formAction, isPending] = useActionState(
    respondToJoinRequest,
    initialState
  );

  if (state.success) {
    return (
      <p className="text-sm font-medium text-green-600 dark:text-green-400">
        {state.message}
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {/* Approve */}
        <form action={formAction}>
          <input
            type="hidden"
            name="requestId"
            value={requestId}
          />

          <input
            type="hidden"
            name="action"
            value="APPROVE"
          />

          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "Processing..." : "Approve"}
          </button>
        </form>

        {/* Reject */}
        <form action={formAction}>
          <input
            type="hidden"
            name="requestId"
            value={requestId}
          />

          <input
            type="hidden"
            name="action"
            value="REJECT"
          />

          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/40"
          >
            Reject
          </button>
        </form>
      </div>

      {state.error.message && (
        <p className="text-xs text-red-500">
          {state.error.message}
        </p>
      )}
    </div>
  );
}