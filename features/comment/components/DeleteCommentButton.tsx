"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";

import {
  deleteComment,
  type DeleteCommentActionResult,
} from "@/features/comment/actions/deleteComment";

interface DeleteCommentButtonProps {
  commentId: string;
}

const initialState: DeleteCommentActionResult = {
  success: false,
  error: {
    code: "",
    message: "",
  },
};

export default function DeleteCommentButton({
  commentId,
}: DeleteCommentButtonProps) {
  const router = useRouter();

  const [state, formAction, isPending] =
    useActionState(
      deleteComment,
      initialState
    );

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [state.success, router]);

  return (
    <div>
      <form action={formAction}>
        <input
          type="hidden"
          name="commentId"
          value={commentId}
        />

        <button
          type="submit"
          disabled={isPending}
          className="text-xs font-medium text-red-600 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Deleting..." : "Delete"}
        </button>
      </form>

      {!state.success &&
        state.error.message && (
          <p className="mt-1 text-xs text-red-600">
            {state.error.message}
          </p>
        )}
    </div>
  );
}