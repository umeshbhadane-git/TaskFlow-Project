import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";

import Workspace from "@/models/Workspace";
import WorkspaceMember from "@/models/WorkspaceMember";

interface TasksPageProps {
  params: Promise<{
    workspaceId: string;
  }>;
}

export default async function TasksPage({
  params,
}: TasksPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { workspaceId } = await params;

  await connectDB();

  // Check workspace membership
  const membership = await WorkspaceMember.findOne({
    workspaceId,
    userId: session.user.id,
  }).lean();

  if (!membership) {
    notFound();
  }

  // Get workspace
  const workspace = await Workspace.findById(workspaceId)
    .select("name")
    .lean();

  if (!workspace) {
    notFound();
  }

  const isOwner = membership.role === "OWNER";

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
            {workspace.name} — Tasks
          </h1>

          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            View and manage tasks in this workspace.
          </p>
        </div>

        {isOwner && (
          <button
            type="button"
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            + Create Task
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            placeholder="Search tasks..."
            className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
          />

          <select
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-300"
            defaultValue="ALL"
          >
            <option value="ALL">All Statuses</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>

          <select
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-300"
            defaultValue="ALL"
          >
            <option value="ALL">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>
      </div>

      {/* Empty State */}
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          No tasks yet
        </h2>

        <p className="mx-auto mt-2 max-w-md text-sm text-gray-600 dark:text-gray-400">
          {isOwner
            ? "Create a task and assign it to a workspace member."
            : "Tasks assigned to you will appear here."}
        </p>

        {isOwner && (
          <button
            type="button"
            className="mt-6 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Create your first task
          </button>
        )}
      </div>
    </section>
  );
}