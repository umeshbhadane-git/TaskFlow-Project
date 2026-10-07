import Link from "next/link";

import { auth } from "@/lib/auth";
import { navigationItems } from "@/components/layout/navigation";
import { getUnreadNotificationCount } from "@/features/notification/services/getUnreadNotificationCount";

export default async function Sidebar() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const unreadNotificationCount =
    await getUnreadNotificationCount(session.user.id);

  return (
    <aside className="fixed inset-y-0 left-0 top-16 hidden w-64 border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950 lg:block">
      <div className="h-full overflow-y-auto p-4">
        <nav aria-label="Main navigation">
          <ul className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;

              const isNotifications =
                item.href === "/notifications";

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="h-5 w-5 shrink-0" />

                      <span>{item.label}</span>
                    </span>

                    {isNotifications &&
                      unreadNotificationCount > 0 && (
                        <span className="flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-xs font-semibold leading-none text-white">
                          {unreadNotificationCount > 99
                            ? "99+"
                            : unreadNotificationCount}
                        </span>
                      )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
}