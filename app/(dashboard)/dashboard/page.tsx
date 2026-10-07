import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth();

  const userName = session?.user?.name || "User";

  return (
    <section className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
          Welcome back, {userName}!
        </h1>

        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Here&apos;s an overview of your TaskFlow workspace.
        </p>
      </div>

      {/* Dashboard Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Assigned Tasks
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            0
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            In Progress
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            0
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Completed
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            0
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Workspaces
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            0
          </p>
        </div>
      </div>

      {/* Dashboard Sections */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Tasks Due This Week
          </h2>

          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Your upcoming tasks will appear here.
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Activity
          </h2>

          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Recent workspace activity will appear here.
          </p>
        </div>
      </div>
    </section>
  );
}