export default function MyTasksLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header */}
      <div>
        <div className="h-8 w-40 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="mt-3 h-4 w-72 rounded bg-gray-200 dark:bg-gray-700" />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="mt-3 h-9 w-12 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        ))}
      </div>

      {/* Task cards */}
      <div className="space-y-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex-1">
                <div className="h-5 w-64 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="mt-2 h-4 w-40 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="mt-3 h-4 w-full max-w-xl rounded bg-gray-200 dark:bg-gray-700" />
              </div>

              <div className="flex gap-3">
                <div className="h-7 w-16 rounded-full bg-gray-200 dark:bg-gray-700" />
                <div className="h-7 w-24 rounded-full bg-gray-200 dark:bg-gray-700" />
                <div className="h-5 w-24 rounded bg-gray-200 dark:bg-gray-700" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}