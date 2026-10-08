"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

import {
  deleteTask,
  type DeleteTaskResult,
} from "@/features/task/actions/deleteTask";

interface DeleteTaskButtonProps {
  taskId: string;
  workspaceId: string;
}

const initialState: DeleteTaskResult = {
  success: false,
  error: {
    code: "",
    message: "",
  },
};

export default function DeleteTaskButton({
  taskId,
  workspaceId,
}: DeleteTaskButtonProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    deleteTask,
    initialState
  );

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [router, state.success]);

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!window.confirm("Are you sure you want to permanently delete this task?")) {
          event.preventDefault();
        }
      }}
      className="flex flex-col items-start gap-2"
    >
      <input type="hidden" name="taskId" value={taskId} />
      <input type="hidden" name="workspaceId" value={workspaceId} />
      <button
        type="submit"
        disabled={isPending || state.success}
        className="rounded-lg border border-red-300 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40"
      >
        {isPending ? "Deleting..." : state.success ? "Deleted" : "Delete task"}
      </button>
      {!state.success && state.error.message && (
        <p role="alert" className="text-xs text-red-600 dark:text-red-400">
          {state.error.message}
        </p>
      )}
    </form>
  );
}
