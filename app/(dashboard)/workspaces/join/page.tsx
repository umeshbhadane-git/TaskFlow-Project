import Link from "next/link";

export default function JoinWorkspacePage() {
  return (
    <section className="mx-auto max-w-xl space-y-4 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Join a workspace
      </h1>

      <p className="text-sm text-gray-600 dark:text-gray-400">
        Joining a workspace is not available yet. You can create a workspace
        or return to the workspaces you already belong to.
      </p>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/workspaces"
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          View workspaces
        </Link>
        <Link
          href="/workspaces/create"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Create workspace
        </Link>
      </div>
    </section>
  );
}
