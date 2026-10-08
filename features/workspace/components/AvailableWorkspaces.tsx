"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import JoinWorkspaceButton from "@/features/workspace/components/JoinWorkspaceButton";

import type { getAvailableWorkspaces } from "@/features/workspace/services/getAvailableWorkspaces";

type AvailableWorkspaces = Awaited<
  ReturnType<typeof getAvailableWorkspaces>
>;

interface AvailableWorkspacesProps {
  workspaces: AvailableWorkspaces;
}

export default function AvailableWorkspaces({
  workspaces,
}: AvailableWorkspacesProps) {
  const [search, setSearch] = useState("");

  const filteredWorkspaces = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    if (!searchTerm) {
      return workspaces;
    }

    return workspaces.filter((workspace) => {
      return (
        workspace.name.toLowerCase().includes(searchTerm) ||
        workspace.description.toLowerCase().includes(searchTerm) ||
        workspace.owner.name.toLowerCase().includes(searchTerm)
      );
    });
  }, [search, workspaces]);

  return (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <label htmlFor="workspace-search" className="sr-only">
          Search workspace
        </label>

        <div className="relative">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            🔍
          </span>

          <input
            id="workspace-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search workspace..."
            className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-11 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Workspace count */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Available Workspaces
        </h2>

        <span className="text-sm text-gray-500 dark:text-gray-400">
          {filteredWorkspaces.length} workspace
          {filteredWorkspaces.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Workspace list */}
      {filteredWorkspaces.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center dark:border-gray-700 dark:bg-gray-900">
          <div className="text-4xl">🔍</div>

          <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
            No workspaces found
          </h3>

          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {search
              ? "Try searching with a different workspace name."
              : "There are no other active workspaces available to join. Workspaces you created or already joined are listed in your workspaces."}
          </p>

          {!search && (
            <Link
              href="/workspaces"
              className="mt-5 inline-flex rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              View your workspaces
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredWorkspaces.map((workspace) => (
            <div
              key={workspace.id}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {/* Workspace information */}
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {workspace.name}
                  </h3>

                  {workspace.description && (
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {workspace.description}
                    </p>
                  )}

                  <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                    Owner:{" "}
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {workspace.owner.name}
                    </span>
                  </p>

                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {workspace.owner.email}
                  </p>
                </div>

                {/* Action */}
                <div className="shrink-0">
                  {workspace.hasPendingRequest ? (
                    <span className="inline-flex items-center justify-center rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                      Request Pending
                    </span>
                  ) : (
                    <JoinWorkspaceButton workspaceId={workspace.id} />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}