import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";

import Workspace from "@/models/Workspace";
import WorkspaceMember from "@/models/WorkspaceMember";

interface BoardPageProps {
  params: Promise<{
    workspaceId: string;
  }>;
}

const columns = [
  {
    key: "TODO",
    title: "To Do",
    description: "Tasks waiting to be started",
  },
  {
    key: "IN_PROGRESS",
    title: "In Progress",
    description: "Tasks currently being worked on",
  },
  {
    key: "DONE",
    title: "Done",
    description: "Completed tasks",
  },
] as const;

export default async function BoardPage({
  params,
}: BoardPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { workspaceId } = await params;

  await connectDB();

  // Make sure the user belongs to this workspace.
  const membership = await WorkspaceMember.findOne({
    workspaceId,
    userId: session.user.id,
  }).lean();

  if (!membership) {
    notFound();
  }

  // Make sure the workspace exists.
  const workspace = await Workspace.findById(workspaceId)
    .select("name")
    .lean();

  if (!workspace) {
    notFound();
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <Link
            href={`/workspaces/${workspaceId}`}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            ← Back to Workspace
          </Link>

          <h1 className="mt-3 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {workspace.name} — Board
          </h1>

          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage and track tasks across the workspace.
          </p>
        </div>

        <Link
          href={`/workspaces/${workspaceId}/tasks`}
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          Manage Tasks
        </Link>
      </div>

      {/* Board */}
      <div className="grid gap-4 lg:grid-cols-3">
        {columns.map((column) => (
          <div
            key={column.key}
            className="min-h-[500px] rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950"
          >
            {/* Column Header */}
            <div className="mb-4">
              <h2 className="font-semibold text-gray-900 dark:text-white">
                {column.title}
              </h2>

              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {column.description}
              </p>
            </div>

            {/* Empty Column */}
            <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No tasks yet
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}