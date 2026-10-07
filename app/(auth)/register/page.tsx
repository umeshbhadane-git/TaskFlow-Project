import Link from "next/link";

import RegisterForm from "@/components/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-8 dark:bg-gray-950">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8 dark:border-gray-800 dark:bg-gray-900">
          {/* Header */}
          <div className="mb-8 text-center">
            <Link
              href="/login"
              className="inline-block text-2xl font-bold tracking-tight text-gray-900 dark:text-white"
            >
              TaskFlow
            </Link>

            <h1 className="mt-6 text-2xl font-bold text-gray-900 dark:text-white">
              Create your account
            </h1>

            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Create an account to start managing your workspaces and tasks.
            </p>
          </div>

          <RegisterForm />
        </div>
      </div>
    </main>
  );
}