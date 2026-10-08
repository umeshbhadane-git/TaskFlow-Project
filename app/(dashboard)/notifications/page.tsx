import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { getUserNotifications } from "@/features/notification/services/getUserNotifications";
import MarkAllAsReadButton from "@/features/notification/components/MarkAllAsReadButton";

function formatNotificationDate(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

function getNotificationLabel(type: string) {
  switch (type) {
    case "JOIN_REQUEST":
      return "Join Request";

    case "JOIN_REQUEST_APPROVED":
      return "Join Request Approved";

    case "JOIN_REQUEST_REJECTED":
      return "Join Request Rejected";

    case "TASK_ASSIGNED":
      return "Task Assigned";

    case "TASK_COMPLETED":
      return "Task Completed";

    default:
      return "Notification";
  }
}

export default async function NotificationsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const notifications = await getUserNotifications(session.user.id);

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  return (
    <section className="mx-auto w-full max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Notifications
          </h1>

          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Stay updated with activity related to your tasks and workspaces.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <div className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 dark:bg-blue-950/40 dark:text-blue-400">
              {unreadCount} unread
            </div>
          )}

          {unreadCount > 0 && <MarkAllAsReadButton />}
        </div>
      </div>

      {/* Notifications */}
      {notifications.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-900">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            No notifications
          </h2>

          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            You are all caught up.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-5 transition hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                  !notification.read
                    ? "bg-blue-50/50 dark:bg-blue-950/20"
                    : ""
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Status indicator */}
                  <div className="mt-1.5 shrink-0">
                    <span
                      className={`block h-2.5 w-2.5 rounded-full ${
                        !notification.read
                          ? "bg-blue-600"
                          : "bg-gray-300 dark:bg-gray-600"
                      }`}
                    />
                  </div>

                  {/* Notification content */}
                  <div className="min-w-0 flex-1">
                    {/* Type */}
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      {getNotificationLabel(notification.type)}
                    </p>

                    {/* Message */}
                    <p
                      className={`text-sm ${
                        !notification.read
                          ? "font-semibold text-gray-900 dark:text-white"
                          : "font-medium text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {notification.message}
                    </p>

                    {/* Date */}
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {formatNotificationDate(notification.createdAt)}
                    </p>

                    {/* Links */}
                    <div className="mt-3 flex flex-wrap gap-3">
                      {/* Workspace */}
                      {notification.workspaceId && (
                        <Link
                          href={`/workspaces/${notification.workspaceId}`}
                          className="inline-flex text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
                        >
                          {notification.workspaceName || "Open workspace"}
                          {" →"}
                        </Link>
                      )}

                      {/* Task */}
                      {notification.taskId &&
                        notification.workspaceId && (
                          <Link
                            href={`/workspaces/${notification.workspaceId}/tasks/${notification.taskId}`}
                            className="inline-flex text-xs font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                          >
                            {notification.taskTitle || "View task"}
                            {" →"}
                          </Link>
                        )}
                    </div>
                  </div>

                  {/* Unread label */}
                  {!notification.read && (
                    <span className="shrink-0 rounded-full bg-blue-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-blue-700 dark:bg-blue-950 dark:text-blue-400">
                      New
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
