import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

import { getDashboardStats } from "@/features/dashboard/services/getDashboardStats";
import { getTasksDueThisWeek } from "@/features/dashboard/services/getTasksDueThisWeek";
import { getUserNotifications } from "@/features/notification/services/getUserNotifications";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userName = session.user.name || "User";

  // --------------------------------------------------
  // Dashboard statistics
  // --------------------------------------------------

  const stats = await getDashboardStats(
    session.user.id
  );

  // --------------------------------------------------
  // Tasks due this week
  // --------------------------------------------------

  const tasksDueThisWeek =
    await getTasksDueThisWeek(
      session.user.id
    );

  const notifications =
  await getUserNotifications(
    session.user.id
  );

  const recentNotifications = notifications.slice(0, 5);

  return (
    <section className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
          Welcome back, {userName}!
        </h1>

        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Here&apos;s an overview of your TaskFlow
          workspace.
        </p>
      </div>

      {/* Dashboard Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Assigned Tasks */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Assigned Tasks
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {stats.assignedTasks}
          </p>
        </div>

        {/* In Progress */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            In Progress
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {stats.inProgressTasks}
          </p>
        </div>

        {/* Completed */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm font-medium text-gray-500 dark:text-white">
            Completed
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {stats.completedTasks}
          </p>
        </div>

        {/* Workspaces */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Workspaces
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {stats.workspaces}
          </p>
        </div>
      </div>

      {/* Dashboard Sections */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Tasks Due This Week */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Tasks Due This Week
            </h2>

            <span className="text-xs text-gray-500 dark:text-gray-400">
              {tasksDueThisWeek.length} task
              {tasksDueThisWeek.length !== 1
                ? "s"
                : ""}
            </span>
          </div>

          {tasksDueThisWeek.length === 0 ? (
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              You have no upcoming tasks due this
              week.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {tasksDueThisWeek.map((task) => (
                <div
                  key={task.id}
                  className="rounded-lg border border-gray-100 p-4 dark:border-gray-800"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-medium text-gray-900 dark:text-white">
                        {task.title}
                      </h3>

                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Due{" "}
                        {new Intl.DateTimeFormat(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        ).format(
                          new Date(task.dueDate)
                        )}
                      </p>
                    </div>

                    {/* Priority */}
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                        task.priority === "HIGH"
                          ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400"
                          : task.priority ===
                              "MEDIUM"
                            ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400"
                            : "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="mt-3">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {task.status === "TODO"
                        ? "To Do"
                        : "In Progress"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Activity
            </h2>

            <a
              href="/notifications"
              className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              View all →
            </a>
          </div>

          {recentNotifications.length === 0 ? (
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              No recent activity.
            </p>
          ) : (
            <div className="mt-4 space-y-4">
              {recentNotifications.map(
                (notification) => (
                  <div
                    key={notification.id}
                    className="flex gap-3"
                  >
                    <span
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                        notification.read
                          ? "bg-gray-300 dark:bg-gray-600"
                          : "bg-blue-600"
                      }`}
                    />

                    <div className="min-w-0">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {notification.message}
                      </p>

                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {new Intl.DateTimeFormat(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        ).format(
                          new Date(
                            notification.createdAt
                          )
                        )}
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
