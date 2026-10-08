"use client";

import { useActionState } from "react";

import {
  updateProfile,
  type UpdateProfileResult,
} from "@/features/auth/actions/updateProfile";

interface EditProfileFormProps {
  currentName: string;
}

const initialState: UpdateProfileResult = {
  success: false,
  error: {
    code: "",
    message: "",
  },
};

export default function EditProfileForm({
  currentName,
}: EditProfileFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateProfile,
    initialState
  );

  return (
    <form action={formAction} className="space-y-5">
      {/* Name */}
      <div>
        <label
          htmlFor="name"
          className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
        >
          Full name
        </label>

        <input
          id="name"
          name="name"
          type="text"
          defaultValue={currentName}
          disabled={isPending}
          required
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:placeholder-gray-500"
          placeholder="Enter your name"
        />
      </div>

      {/* Error */}
      {!state.success && state.error.message && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-400">
          {state.error.message}
        </p>
      )}

      {/* Success */}
      {state.success && (
        <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700 dark:bg-green-950/30 dark:text-green-400">
          {state.message}
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}