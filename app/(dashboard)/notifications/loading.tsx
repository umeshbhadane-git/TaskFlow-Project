export default function NotificationsLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header */}
      <div>
        <div className="h-8 w-48 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="mt-3 h-4 w-80 rounded bg-gray-200 dark:bg-gray-700" />
      </div>

      {/* Notification cards */}
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((item) => (
          <div
            key={item}
            className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="h-10 w-10 shrink-0 rounded-full bg-gray-200 dark:bg-gray-700" />

              <div className="flex-1">
                {/* Message */}
                <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />

                {/* Metadata */}
                <div className="mt-3 h-3 w-40 rounded bg-gray-200 dark:bg-gray-700" />

                {/* Link */}
                <div className="mt-3 h-3 w-28 rounded bg-gray-200 dark:bg-gray-700" />
              </div>

              {/* New badge */}
              <div className="h-5 w-12 rounded-full bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
