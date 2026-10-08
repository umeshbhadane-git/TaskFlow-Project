import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  ListTodo,
  Plus,
} from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Workspace from "@/models/Workspace";
import WorkspaceMember from "@/models/WorkspaceMember";

import { getWorkspaceTasks } from "@/features/task/services/getWorkspaceTasks";
import TaskBoardContainer from "@/features/task/components/TaskBoardContainer";

interface BoardPageProps {
  params: Promise<{
    workspaceId: string;
  }>;
}

export default async function BoardPage({
  params,
}: BoardPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { workspaceId } = await params;

  await connectDB();

  // --------------------------------------------------
  // Find workspace
  // --------------------------------------------------

  const workspace = await Workspace.findById(workspaceId).lean();

  if (!workspace) {
    notFound();
  }

  // --------------------------------------------------
  // Check workspace status
  // --------------------------------------------------

  if (workspace.status === "INACTIVE") {
    notFound();
  }

  // --------------------------------------------------
  // Check workspace membership
  // --------------------------------------------------

  const membership = await WorkspaceMember.findOne({
    workspaceId,
    userId: session.user.id,
  }).lean();

  if (!membership) {
    redirect("/workspaces");
  }

  // --------------------------------------------------
  // Get workspace tasks
  // --------------------------------------------------

  const tasks = await getWorkspaceTasks(workspaceId);

  // --------------------------------------------------
  // Check owner
  // --------------------------------------------------

  const isOwner =
    workspace.ownerId.toString() === session.user.id;

  // --------------------------------------------------
  // Task statistics
  // --------------------------------------------------

  const totalTasks = tasks.length;

  const todoTasks = tasks.filter(
    (task) => task.status === "TODO"
  ).length;

  const inProgressTasks = tasks.filter(
    (task) => task.status === "IN_PROGRESS"
  ).length;

  const completedTasks = tasks.filter(
    (task) => task.status === "DONE"
  ).length;

  return (
    <div className="space-y-8">
      {/* ==================================================
          BACK TO WORKSPACE
      ================================================== */}

      <Link
        href={`/workspaces/${workspaceId}`}
        className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Workspace
      </Link>

      {/* ==================================================
          PAGE HEADER
      ================================================== */}

      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xl font-semibold text-black dark:text-white">
            {workspace.name}
          </p>

          <p className="mt-2 max-w-2xl text-sm text-gray-700 dark:text-gray-400">
            Manage your workspace tasks and track
            their progress from start to completion.
          </p>
        </div>

        {/* Create Task - Owner only */}
        {isOwner && (
          <Link
            href={`/workspaces/${workspaceId}/tasks/create`}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Create Task
          </Link>
        )}
      </div>

      {/* ==================================================
          TASK STATISTICS
      ================================================== */}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {/* Total Tasks */}
        <div className="rounded-xl border border-gray-300 bg-white p-4 text-black shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Total Tasks
              </p>

              <p className="mt-1 text-2xl font-bold text-black dark:text-white">
                {totalTasks}
              </p>
            </div>

            <div className="rounded-lg bg-gray-100 p-2 dark:bg-blue-900">
              <ListTodo className="h-5 w-5 text-blue-700 dark:text-blue-200" />
            </div>
          </div>
        </div>

        {/* To Do */}
        <div className="rounded-xl border border-gray-300 bg-white p-4 text-black shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                To Do
              </p>

              <p className="mt-1 text-2xl font-bold text-black dark:text-white">
                {todoTasks}
              </p>
            </div>

            <div className="rounded-lg bg-gray-100 p-2 dark:bg-blue-900">
              <ListTodo className="h-5 w-5 text-blue-700 dark:text-blue-200" />
            </div>
          </div>
        </div>

        {/* In Progress */}
        <div className="rounded-xl border border-gray-300 bg-white p-4 text-black shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                In Progress
              </p>

              <p className="mt-1 text-2xl font-bold text-black dark:text-white">
                {inProgressTasks}
              </p>
            </div>

            <div className="rounded-lg bg-gray-100 p-2 dark:bg-blue-900">
              <Clock3 className="h-5 w-5 text-blue-700 dark:text-blue-200" />
            </div>
          </div>
        </div>

        {/* Completed */}
        <div className="rounded-xl border border-gray-300 bg-white p-4 text-black shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Completed
              </p>

              <p className="mt-1 text-2xl font-bold text-black dark:text-white">
                {completedTasks}
              </p>
            </div>

            <div className="rounded-lg bg-gray-100 p-2 dark:bg-blue-900">
              <CheckCircle2 className="h-5 w-5 text-blue-700 dark:text-blue-200" />
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================
          TASK BOARD
      ================================================== */}

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold">
            Task Board
          </h2>

          <p className="text-sm text-gray-700 dark:text-gray-400">
            Drag and drop tasks to update their status.
          </p>
        </div>

        <TaskBoardContainer
          tasks={tasks}
          currentUserId={session.user.id}
          isOwner={isOwner}
        />
      </section>
    </div>
  );
}