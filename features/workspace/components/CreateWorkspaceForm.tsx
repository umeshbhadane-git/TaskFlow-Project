"use client";

import { useActionState } from "react";

import {
  createWorkspace,
  type CreateWorkspaceActionResult,
} from "@/features/workspace/actions/createWorkspace";

const initialState: CreateWorkspaceActionResult = {
  success: false,
  error: {
    code: "",
    message: "",
  },
};

export default function CreateWorkspaceForm() {
  const [state, formAction, isPending] = useActionState(
    createWorkspace,
    initialState
  );

  const fieldErrors =
    state.success === false ? state.error.fieldErrors : undefined;

  return (
    <form action={formAction} className="space-y-6">
      {/* Workspace Name */}
      <div className="space-y-2">
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          Workspace name
        </label>

        <input
          id="name"
          name="name"
          type="text"
          placeholder="e.g. Development Team"
          required
          disabled={isPending}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        />

        {fieldErrors?.name && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {fieldErrors.name[0]}
          </p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          Description
          <span className="ml-1 font-normal text-gray-500">
            (optional)
          </span>
        </label>

        <textarea
          id="description"
          name="description"
          rows={4}
          placeholder="What is this workspace used for?"
          disabled={isPending}
          className="w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        />

        {fieldErrors?.description && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {fieldErrors.description[0]}
          </p>
        )}
      </div>

      {/* General Error */}
      {!state.success && state.error.message && (
        <div
          role="alert"
          className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-400"
        >
          {state.error.message}
        </div>
      )}

      {/* Success */}
      {state.success && (
        <div
          role="status"
          className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700 dark:bg-green-950/40 dark:text-green-400"
        >
          {state.message}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Creating workspace..." : "Create workspace"}
      </button>
    </form>
  );
}