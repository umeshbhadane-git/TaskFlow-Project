import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { getUserWorkspaces } from "@/features/workspace/services/getUserWorkspaces";

export default async function WorkspacesPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const workspaces = await getUserWorkspaces(session.user.id);

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
            Workspaces
          </h1>

          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Manage the workspaces you own or belong to.
          </p>
        </div>

        <Link
          href="/workspaces/create"
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Create Workspace
        </Link>
      </div>

      {/* Workspace List */}
      {workspaces.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center dark:border-gray-700 dark:bg-gray-900">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            No workspaces yet
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400">
            Create your first workspace or join an existing workspace to
            start collaborating with your team.
          </p>

          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/workspaces/create"
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Create Workspace
            </Link>

            <Link
              href="/workspaces/join"
              className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              Join Workspace
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {workspaces.map((workspace) => (
            <div
              key={workspace.id}
              className={`rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 ${
                workspace.status === "ACTIVE"
                  ? "transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md dark:hover:border-blue-700"
                  : "cursor-not-allowed opacity-70"
              }`}
            >
              {workspace.status === "ACTIVE" ? (
                <Link
                  href={`/workspaces/${workspace.id}`}
                  aria-label={`Open ${workspace.name} workspace`}
                  className="block rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <WorkspaceCardContent workspace={workspace} />
                </Link>
              ) : (
                <WorkspaceCardContent workspace={workspace} />
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

type WorkspaceCardData = Awaited<
  ReturnType<typeof getUserWorkspaces>
>[number];

function WorkspaceCardContent({
  workspace,
}: {
  workspace: WorkspaceCardData;
}) {
  return (
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-semibold text-gray-900 dark:text-white">
                    {workspace.name}
                  </h2>

                  <p className="mt-2 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
                    {workspace.description || "No description provided."}
                  </p>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-2">
                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                    {workspace.role}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      workspace.status === "ACTIVE"
                        ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400"
                        : "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                    }`}
                  >
                    {workspace.status === "ACTIVE" ? "Active" : "Deleted"}
                  </span>
                </div>
              </div>
  );
}