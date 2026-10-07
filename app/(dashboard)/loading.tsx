export default function DashboardLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading">
      {/* Page heading */}
      <div className="space-y-2">
        <div className="h-8 w-64 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />

        <div className="h-4 w-80 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
      </div>

      {/* Dashboard cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="h-4 w-28 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />

            <div className="mt-3 h-9 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
          </div>
        ))}
      </div>

      {/* Dashboard sections */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-40 animate-pulse rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900" />

        <div className="h-40 animate-pulse rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900" />
      </div>
    </div>
  );
}