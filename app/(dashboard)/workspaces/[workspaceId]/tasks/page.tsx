import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";

import Workspace from "@/models/Workspace";
import WorkspaceMember from "@/models/WorkspaceMember";

import { getWorkspaceTasks } from "@/features/task/services/getWorkspaceTasks";
import TaskComments from "@/features/comment/components/TaskComments";
import DeleteTaskButton from "@/features/task/components/DeleteTaskButton";
import TaskFilters, {
  type TaskFilterItem,
} from "@/features/task/components/TaskFilters";

interface WorkspaceTasksPageProps {
  params: Promise<{ workspaceId: string }>;
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getStatusLabel(status: string) {
  switch (status) {
    case "TODO":
      return "To Do";
    case "IN_PROGRESS":
      return "In Progress";
    case "DONE":
      return "Done";
    default:
      return status;
  }
}

function getPriorityClass(priority: string) {
  switch (priority) {
    case "HIGH":
      return "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400";

    case "MEDIUM":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400";

    case "LOW":
      return "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400";

    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
  }
}

function getStatusClass(status: string) {
  switch (status) {
    case "TODO":
      return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";

    case "IN_PROGRESS":
      return "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400";

    case "DONE":
      return "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400";

    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
  }
}

export default async function WorkspaceTasksPage({
  params,
}: WorkspaceTasksPageProps) {
  // --------------------------------------------------
  // 1. Authentication
  // --------------------------------------------------

  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  // --------------------------------------------------
  // 2. Get workspace ID
  // --------------------------------------------------

  const { workspaceId } = await params;

  // --------------------------------------------------
  // 3. Connect to database
  // --------------------------------------------------

  await connectDB();

  // --------------------------------------------------
  // 4. Find workspace
  // --------------------------------------------------

  const workspace = await Workspace.findById(workspaceId).lean();

  if (!workspace) {
    notFound();
  }

  // --------------------------------------------------
  // 5. Check workspace status
  // --------------------------------------------------

  const workspaceStatus =
    (workspace.status as "ACTIVE" | "INACTIVE" | undefined) ?? "ACTIVE";

  if (workspaceStatus === "INACTIVE") {
    notFound();
  }

  // --------------------------------------------------
  // 6. Check membership
  // --------------------------------------------------

  const membership = await WorkspaceMember.findOne({
    workspaceId,
    userId,
  }).lean();

  if (!membership) {
    redirect("/workspaces");
  }

  // --------------------------------------------------
  // 7. Get workspace tasks
  // --------------------------------------------------

  const tasks = await getWorkspaceTasks(workspaceId);

  // --------------------------------------------------
  // 8. Check owner
  // --------------------------------------------------

  const isOwner = workspace.ownerId.toString() === userId;

  // --------------------------------------------------
  // 9. Prepare tasks for filtering
  // --------------------------------------------------

  const filterTasks: TaskFilterItem[] = tasks.map((task) => ({
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate,
    createdAt: task.createdAt,
    tags: task.tags,

    assignee: task.assignee
      ? {
          id: task.assignee.id,
          name: task.assignee.name,
          email: task.assignee.email,
        }
      : null,

    createdBy: {
      id: task.createdBy.id,
      name: task.createdBy.name,
    },
  }));

  // --------------------------------------------------
  // 10. Render task cards on the server and pass them as slots
  // --------------------------------------------------

  const taskCards = filterTasks.map((task) => ({
    taskId: task.id,
    content: (
      <div
        key={task.id}
        className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900"
      >
        <div className="flex flex-col gap-5">
          {/* Task Header */}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {task.title}
              </h2>

              {task.description && (
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {task.description}
                </p>
              )}
            </div>

            {/* Status and Priority */}

            <div className="flex shrink-0 flex-wrap items-start gap-2">
              <div className="flex flex-wrap gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                    task.status
                  )}`}
                >
                  {getStatusLabel(task.status)}
                </span>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${getPriorityClass(
                    task.priority
                  )}`}
                >
                  {task.priority}
                </span>
              </div>
              {isOwner && (
                <DeleteTaskButton
                  taskId={task.id}
                  workspaceId={workspaceId}
                />
              )}
            </div>
          </div>

          {/* Task Information */}

          <div className="grid gap-4 border-t border-gray-100 pt-4 dark:border-gray-800 sm:grid-cols-2 lg:grid-cols-4">
            {/* Assigned To */}

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Assigned To
              </p>

              <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                {task.assignee?.name || "Unknown"}
              </p>

              {task.assignee?.email && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {task.assignee.email}
                </p>
              )}
            </div>

            {/* Due Date */}

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Due Date
              </p>

              <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                {formatDate(task.dueDate)}
              </p>
            </div>

            {/* Created By */}

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Created By
              </p>

              <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                {task.createdBy.name}
              </p>
            </div>

            {/* Created Date */}

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Created
              </p>

              <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                {formatDate(task.createdAt)}
              </p>
            </div>
          </div>

          {/* Tags */}

          {task.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {task.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-gray-100 px-2.5 py-1 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Comments */}

          <div className="border-t border-gray-100 pt-4 dark:border-gray-800">
            <TaskComments
              taskId={task.id}
              currentUserId={userId}
              isOwner={isOwner}
            />
          </div>
        </div>
      </div>
    ),
  }));

  // --------------------------------------------------
  // 11. Page
  // --------------------------------------------------

  return (
    <div className="mx-auto max-w-6xl">
      {/* Page Header */}

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href={`/workspaces/${workspaceId}`}
            className="mb-3 inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            ← Back to Workspace
          </Link>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Tasks
          </h1>

          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Tasks in {workspace.name}
          </p>
        </div>

        {/* Create Task - Owner Only */}

        {isOwner && (
          <Link
            href={`/workspaces/${workspaceId}/tasks/create`}
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            + Create Task
          </Link>
        )}
      </div>

      {/* Total Tasks */}

      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Total Tasks
        </p>

        <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
          {tasks.length}
        </p>
      </div>

      {/* No Tasks */}

      {tasks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-900">
          <div className="text-4xl">📋</div>

          <h2 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
            No tasks yet
          </h2>

          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Create the first task for this workspace.
          </p>

          {isOwner && (
            <Link
              href={`/workspaces/${workspaceId}/tasks/create`}
              className="mt-6 inline-flex items-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              + Create First Task
            </Link>
          )}
        </div>
      ) : (
        /* Task Filters + Task Cards */

        <TaskFilters 
          tasks={filterTasks}
          taskCards={taskCards}
        />
      )}
    </div>
  );
}