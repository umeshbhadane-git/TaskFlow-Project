import Link from "next/link";

import CreateWorkspaceForm from "@/features/workspace/components/CreateWorkspaceForm";

export default function CreateWorkspacePage() {
  return (
    <section className="mx-auto w-full max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/workspaces"
          className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
        >
          ← Back to Workspaces
        </Link>

        <h1 className="mt-4 text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
          Create Workspace
        </h1>

        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Create a workspace for your team and start organizing your work.
        </p>
      </div>

      {/* Form */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-8">
        <CreateWorkspaceForm />
      </div>
    </section>
  );
}