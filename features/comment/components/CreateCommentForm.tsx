"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

import {
  createComment,
  type CreateCommentActionResult,
} from "@/features/comment/actions/createComment";

interface CreateCommentFormProps {
  taskId: string;
}

const initialState: CreateCommentActionResult = {
  success: false,
  error: {
    code: "",
    message: "",
  },
};

export default function CreateCommentForm({
  taskId,
}: CreateCommentFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] =
    useActionState(
      createComment,
      initialState
    );
  const successCommentId = state.success ? state.commentId : null;

  useEffect(() => {
    if (!successCommentId) {
      return;
    }

    const form = document.getElementById(
      `comment-form-${taskId}`
    ) as HTMLFormElement | null;

    form?.reset();
    router.refresh();
  }, [
    router,
    successCommentId,
    taskId,
  ]);

  return (
    <form
      id={`comment-form-${taskId}`}
      action={formAction}
      className="space-y-3"
    >
      <input
        type="hidden"
        name="taskId"
        value={taskId}
      />

      <textarea
        name="body"
        placeholder="Write a comment..."
        rows={3}
        disabled={isPending}
        className="w-full resize-none rounded-lg border border-gray-200 bg-white p-3 text-sm outline-none transition focus:border-primary dark:border-gray-700 dark:bg-gray-900"
      />

      {state.success && (
        <p className="text-sm text-green-600">
          {state.message}
        </p>
      )}

      {!state.success &&
        state.error.message && (
          <p className="text-sm text-red-600">
            {state.error.message}
          </p>
        )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending
            ? "Adding..."
            : "Add Comment"}
        </button>
      </div>
    </form>
  );
}