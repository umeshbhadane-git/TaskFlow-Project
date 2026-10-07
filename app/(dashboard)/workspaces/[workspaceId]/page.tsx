import Link from "next/link";
import mongoose from "mongoose";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Workspace from "@/models/Workspace";
import WorkspaceMember from "@/models/WorkspaceMember";

interface WorkspacePageProps {
  params: Promise<{
    workspaceId: string;
  }>;
}

export default async function WorkspacePage({
  params,
}: WorkspacePageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { workspaceId } = await params;

  if (!mongoose.isValidObjectId(workspaceId)) {
    notFound();
  }

  await connectDB();

  const membership = await WorkspaceMember.findOne({
    workspaceId,
    userId: session.user.id,
  }).lean();

  if (!membership) {
    notFound();
  }

  const workspace = await Workspace.findById(workspaceId).lean();

  if (!workspace) {
    notFound();
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/workspaces"
          className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
        >
          ← Back to Workspaces
        </Link>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
              {workspace.name}
            </h1>

            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {workspace.description || "No description provided."}
            </p>
          </div>

          <span className="w-fit rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
            {membership.role}
          </span>
        </div>
      </div>

      {/* Workspace Navigation */}
      <nav
        aria-label="Workspace navigation"
        className="overflow-x-auto rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
      >
        <div className="flex min-w-max">
          <Link
            href={`/workspaces/${workspaceId}`}
            className="border-b-2 border-blue-600 px-4 py-3 text-sm font-medium text-blue-600 dark:text-blue-400"
          >
            Overview
          </Link>

          <Link
            href={`/workspaces/${workspaceId}/board`}
            className="px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
          >
            Board
          </Link>

          <Link
            href={`/workspaces/${workspaceId}/tasks`}
            className="px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
          >
            Tasks
          </Link>

          <Link
            href={`/workspaces/${workspaceId}/members`}
            className="px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
          >
            Members
          </Link>

          <Link
            href={`/workspaces/${workspaceId}/activity`}
            className="px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
          >
            Activity
          </Link>

          <Link
            href={`/workspaces/${workspaceId}/settings`}
            className="px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
          >
            Settings
          </Link>

          {membership.role === "OWNER" && (
            <Link
              href={`/workspaces/${workspaceId}/requests`}
              className="px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
            >
              Join Requests
            </Link>
          )}
        </div>
      </nav>

      {/* Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Your role
          </p>

          <p className="mt-2 text-xl font-semibold text-gray-900 dark:text-white">
            {membership.role}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Workspace
          </p>

          <p className="mt-2 text-xl font-semibold text-gray-900 dark:text-white">
            Active
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Next step
          </p>

          <p className="mt-2 text-xl font-semibold text-gray-900 dark:text-white">
            Manage tasks
          </p>
        </div>
      </div>
    </section>
  );
}