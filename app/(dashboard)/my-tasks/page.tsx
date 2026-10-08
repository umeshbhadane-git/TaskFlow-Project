import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { getMyTasks } from "@/features/task/services/getMyTasks";

export default async function MyTasksPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const tasks = await getMyTasks(session.user.id);

  const todoTasks = tasks.filter((task) => task.status === "TODO");
  const inProgressTasks = tasks.filter(
    (task) => task.status === "IN_PROGRESS"
  );
  const completedTasks = tasks.filter((task) => task.status === "DONE");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          My Tasks
        </h1>

        <p className="mt-2 text-gray-600 dark:text-gray-400">
          View and manage all tasks assigned to you.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            To Do
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {todoTasks.length}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            In Progress
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {inProgressTasks.length}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Completed
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {completedTasks.length}
          </p>
        </div>
      </div>

      {/* Tasks */}
      <div className="space-y-4">
        {tasks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center dark:border-gray-700 dark:bg-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              No tasks assigned
            </h2>

            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              You currently don&apos;t have any tasks assigned to you.
            </p>
          </div>
        ) : (
          tasks.map((task) => (
            <Link
              key={task.id}
              href={`/workspaces/${task.workspaceId}/tasks/${task.id}`}
              className="block rounded-xl border border-gray-200 bg-white p-5 transition hover:border-gray-300 hover:shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                {/* Task information */}
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-semibold text-gray-900 dark:text-white">
                    {task.title}
                  </h2>

                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Workspace: {task.workspaceName}
                  </p>

                  {task.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                      {task.description}
                    </p>
                  )}

                  {/* Tags */}
                  {task.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {task.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Task metadata */}
                <div className="flex flex-wrap items-center gap-3 md:justify-end">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      task.priority === "HIGH"
                        ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        : task.priority === "MEDIUM"
                          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                          : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    }`}
                  >
                    {task.priority}
                  </span>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      task.status === "DONE"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : task.status === "IN_PROGRESS"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {task.status.replace("_", " ")}
                  </span>

                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Due:{" "}
                    {new Date(task.dueDate).toLocaleDateString("en-IN")}
                  </span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}