"use client";

import { useActionState } from "react";

import {
  updateTaskStatus,
  type UpdateTaskStatusActionResult,
} from "@/features/task/actions/updateTaskStatus";

interface TaskStatusActionsProps {
  taskId: string;
  currentStatus: "TODO" | "IN_PROGRESS" | "DONE";
}

const initialState: UpdateTaskStatusActionResult = {
  success: false,
  error: {
    code: "",
    message: "",
  },
};

export default function TaskStatusActions({
  taskId,
  currentStatus,
}: TaskStatusActionsProps) {
  const [state, formAction, isPending] = useActionState(
    updateTaskStatus,
    initialState
  );

  // --------------------------------------------------
  // DONE
  // --------------------------------------------------

  if (currentStatus === "DONE") {
    return (
      <div className="space-y-2">
        <span className="inline-flex rounded-lg bg-green-100 px-3 py-2 text-sm font-semibold text-green-700 dark:bg-green-950/40 dark:text-green-400">
          ✓ Completed
        </span>

        {state.success && (
          <p className="text-xs text-green-600 dark:text-green-400">
            {state.message}
          </p>
        )}

        {!state.success && state.error.message && (
          <p className="text-xs text-red-500">
            {state.error.message}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* TODO → IN_PROGRESS */}
      {currentStatus === "TODO" && (
        <form action={formAction}>
          <input
            type="hidden"
            name="taskId"
            value={taskId}
          />

          <input
            type="hidden"
            name="status"
            value="IN_PROGRESS"
          />

          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "Starting..." : "Start Task"}
          </button>
        </form>
      )}

      {/* IN_PROGRESS → DONE */}
      {currentStatus === "IN_PROGRESS" && (
        <form action={formAction}>
          <input
            type="hidden"
            name="taskId"
            value={taskId}
          />

          <input
            type="hidden"
            name="status"
            value="DONE"
          />

          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "Completing..." : "Complete Task"}
          </button>
        </form>
      )}

      {/* Success message */}
      {state.success && (
        <p className="text-xs text-green-600 dark:text-green-400">
          {state.message}
        </p>
      )}

      {/* Error message */}
      {!state.success && state.error.message && (
        <p className="text-xs text-red-500">
          {state.error.message}
        </p>
      )}
    </div>
  );
}