"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";

import {
  updateComment,
  type UpdateCommentActionResult,
} from "@/features/comment/actions/updateComment";

interface EditCommentButtonProps {
  commentId: string;
  initialBody: string;
}

const initialState: UpdateCommentActionResult = {
  success: false,
  error: {
    code: "",
    message: "",
  },
};

export default function EditCommentButton({
  commentId,
  initialBody,
}: EditCommentButtonProps) {
  const router = useRouter();

  const [isEditing, setIsEditing] =
    useState(false);

  const [state, formAction, isPending] =
    useActionState(
      updateComment,
      initialState
    );

  const handleSubmit = async (
    formData: FormData
  ) => {
    const result = await updateComment(
      state,
      formData
    );

    if (result.success) {
      setIsEditing(false);
      router.refresh();
    }

    return result;
  };

  const [
    submitState,
    ,
    submitPending,
  ] = useActionState(
    async (
      _previousState: UpdateCommentActionResult,
      formData: FormData
    ) => {
      return handleSubmit(formData);
    },
    initialState
  );

  const currentState =
    submitState.success || submitState.error.message
      ? submitState
      : state;

  const pending =
    isPending || submitPending;

  if (!isEditing) {
    return (
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        className="text-xs font-medium text-blue-600 hover:text-blue-700"
      >
        Edit
      </button>
    );
  }

  return (
    <form
      action={async (formData) => {
        await handleSubmit(formData);
      }}
      className="mt-2 space-y-2"
    >
      <input
        type="hidden"
        name="commentId"
        value={commentId}
      />

      <textarea
        name="body"
        defaultValue={initialBody}
        rows={3}
        disabled={pending}
        className="w-full resize-none rounded-lg border border-gray-200 bg-white p-3 text-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900"
      />

      {currentState.success && (
        <p className="text-xs text-green-600">
          {currentState.message}
        </p>
      )}

      {!currentState.success &&
        currentState.error.message && (
          <p className="text-xs text-red-600">
            {currentState.error.message}
          </p>
        )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {pending ? "Saving..." : "Save"}
        </button>

        <button
          type="button"
          disabled={pending}
          onClick={() => setIsEditing(false)}
          className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
