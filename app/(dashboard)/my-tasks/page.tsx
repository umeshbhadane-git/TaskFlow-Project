import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { getMyTasks } from "@/features/task/services/getMyTasks";

function formatDueDate(date?: Date) {
  if (!date) {
    return "No due date";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(new Date(date));
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

export default async function MyTasksPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const tasks = await getMyTasks(session.user.id);

  return (
    <section className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          My Tasks
        </h1>

        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          View and manage the tasks assigned to you.
        </p>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            placeholder="Search my tasks..."
            className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
          />

          <select
            defaultValue="ALL"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-300"
          >
            <option value="ALL">All Statuses</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>

          <select
            defaultValue="ALL"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-300"
          >
            <option value="ALL">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>
      </div>

      {/* Tasks */}
      {tasks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-900">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            No tasks assigned
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm text-gray-600 dark:text-gray-400">
            Tasks assigned to you across your workspaces will appear
            here.
          </p>

          <Link
            href="/workspaces"
            className="mt-6 inline-flex rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            View Workspaces
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="flex flex-col justify-between gap-4 sm:flex-row">
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {task.title}
                  </h2>

                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {task.workspaceName}
                  </p>

                  {task.description && (
                    <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                      {task.description}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 items-start gap-2">
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                    {getStatusLabel(task.status)}
                  </span>

                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    {task.priority}
                  </span>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-2 border-t border-gray-100 pt-4 text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400 sm:flex-row sm:items-center sm:justify-between">
                <span>
                  Due:{" "}
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {formatDueDate(task.dueDate)}
                  </span>
                </span>

                <span>
                  Created by{" "}
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {task.createdBy.name}
                  </span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}