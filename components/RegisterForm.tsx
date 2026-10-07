"use client";

import { useActionState } from "react";
import Link from "next/link";

import {
  registerUser,
  type RegisterActionResult,
} from "@/features/auth/actions/registerUser";

const initialState: RegisterActionResult = {
  success: false,
  error: {
    code: "",
    message: "",
  },
};

export default function RegisterForm() {
  const [state, formAction, isPending] = useActionState(
    registerUser,
    initialState
  );

  const fieldErrors =
    state.success === false ? state.error.fieldErrors : undefined;

  return (
    <form action={formAction} className="space-y-5">
      {/* Name */}
      <div className="space-y-2">
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          Name
        </label>

        <input
          id="name"
          name="name"
          type="text"
          placeholder="Enter your name"
          required
          autoComplete="name"
          disabled={isPending}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        />

        {fieldErrors?.name && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {fieldErrors.name[0]}
          </p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-2">
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          Email
        </label>

        <input
          id="email"
          name="email"
          type="email"
          placeholder="Enter your email"
          required
          autoComplete="email"
          disabled={isPending}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        />

        {fieldErrors?.email && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {fieldErrors.email[0]}
          </p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          Password
        </label>

        <input
          id="password"
          name="password"
          type="password"
          placeholder="Enter your password"
          required
          autoComplete="new-password"
          disabled={isPending}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        />

        {fieldErrors?.password && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {fieldErrors.password[0]}
          </p>
        )}
      </div>

      {/* General error */}
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
        {isPending ? "Creating account..." : "Create account"}
      </button>

      {/* Login link */}
      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-blue-600 hover:underline dark:text-blue-400"
        >
          Login
        </Link>
      </p>
    </form>
  );
}