"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";

type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
type SortOption =
  | "NEWEST"
  | "OLDEST"
  | "DUE_SOON"
  | "DUE_LATEST"
  | "TITLE_ASC"
  | "TITLE_DESC";

export interface TaskFilterItem {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: "LOW" | "MEDIUM" | "HIGH";
  dueDate: Date | string;
  createdAt: Date | string;
  tags: string[];
  assignee: {
    id: string;
    name: string;
    email?: string;
  } | null;
  createdBy: {
    id: string;
    name: string;
  };
}

interface TaskFiltersProps {
  tasks: TaskFilterItem[];
  taskCards: {
    taskId: string;
    content: ReactNode;
  }[];
}

export default function TaskFilters({
  tasks,
  taskCards,
}: TaskFiltersProps) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"ALL" | TaskStatus>("ALL");
  const [assignee, setAssignee] = useState("ALL");
  const [tag, setTag] = useState("ALL");
  const [sort, setSort] = useState<SortOption>("NEWEST");

  // --------------------------------------------------
  // Get unique assignees
  // --------------------------------------------------

  const assignees = useMemo(() => {
    const map = new Map<
      string,
      {
        id: string;
        name: string;
      }
    >();

    for (const task of tasks) {
      if (task.assignee) {
        map.set(task.assignee.id, {
          id: task.assignee.id,
          name: task.assignee.name,
        });
      }
    }

    return Array.from(map.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [tasks]);

  // --------------------------------------------------
  // Get unique tags
  // --------------------------------------------------

  const tags = useMemo(() => {
    const tagSet = new Set<string>();

    for (const task of tasks) {
      for (const taskTag of task.tags) {
        tagSet.add(taskTag);
      }
    }

    return Array.from(tagSet).sort((a, b) => a.localeCompare(b));
  }, [tasks]);

  const taskCardsById = useMemo(
    () => new Map(taskCards.map((card) => [card.taskId, card.content])),
    [taskCards]
  );

  // --------------------------------------------------
  // Filter + sort tasks
  // --------------------------------------------------

  const filteredTasks = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const result = tasks.filter((task) => {
      // Search by title
      if (
        normalizedSearch &&
        !task.title.toLowerCase().includes(normalizedSearch)
      ) {
        return false;
      }

      // Filter by status
      if (status !== "ALL" && task.status !== status) {
        return false;
      }

      // Filter by assignee
      if (assignee !== "ALL" && task.assignee?.id !== assignee) {
        return false;
      }

      // Filter by tag
      if (tag !== "ALL" && !task.tags.includes(tag)) {
        return false;
      }

      return true;
    });

    // Sort
    result.sort((a, b) => {
      switch (sort) {
        case "NEWEST":
          return (
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
          );

        case "OLDEST":
          return (
            new Date(a.createdAt).getTime() -
            new Date(b.createdAt).getTime()
          );

        case "DUE_SOON":
          return (
            new Date(a.dueDate).getTime() -
            new Date(b.dueDate).getTime()
          );

        case "DUE_LATEST":
          return (
            new Date(b.dueDate).getTime() -
            new Date(a.dueDate).getTime()
          );

        case "TITLE_ASC":
          return a.title.localeCompare(b.title);

        case "TITLE_DESC":
          return b.title.localeCompare(a.title);

        default:
          return 0;
      }
    });

    return result;
  }, [tasks, search, status, assignee, tag, sort]);

  const taskOrder = new Map(
    filteredTasks.map((task, index) => [task.id, index])
  );

  // --------------------------------------------------
  // Reset filters
  // --------------------------------------------------

  function resetFilters() {
    setSearch("");
    setStatus("ALL");
    setAssignee("ALL");
    setTag("ALL");
    setSort("NEWEST");
  }

  const hasActiveFilters =
    search.trim() !== "" ||
    status !== "ALL" ||
    assignee !== "ALL" ||
    tag !== "ALL" ||
    sort !== "NEWEST";

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
              Filter & Sort Tasks
            </h2>

            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Showing {filteredTasks.length} of {tasks.length} tasks
            </p>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="self-start text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              Clear filters
            </button>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Search */}
          <div className="lg:col-span-3">
            <label
              htmlFor="task-search"
              className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400"
            >
              Search by title
            </label>

            <input
              id="task-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search tasks..."
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
            />
          </div>

          {/* Status */}
          <div>
            <label
              htmlFor="task-status"
              className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400"
            >
              Status
            </label>

            <select
              id="task-status"
              value={status}
              onChange={(event) =>
                setStatus(
                  event.target.value as "ALL" | TaskStatus
                )
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
            >
              <option value="ALL">All statuses</option>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </select>
          </div>

          {/* Assignee */}
          <div>
            <label
              htmlFor="task-assignee"
              className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400"
            >
              Assignee
            </label>

            <select
              id="task-assignee"
              value={assignee}
              onChange={(event) => setAssignee(event.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
            >
              <option value="ALL">All assignees</option>

              {assignees.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tag */}
          <div>
            <label
              htmlFor="task-tag"
              className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400"
            >
              Tag
            </label>

            <select
              id="task-tag"
              value={tag}
              onChange={(event) => setTag(event.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
            >
              <option value="ALL">All tags</option>

              {tags.map((taskTag) => (
                <option key={taskTag} value={taskTag}>
                  #{taskTag}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="md:col-span-2 lg:col-span-3">
            <label
              htmlFor="task-sort"
              className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400"
            >
              Sort by
            </label>

            <select
              id="task-sort"
              value={sort}
              onChange={(event) =>
                setSort(event.target.value as SortOption)
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
            >
              <option value="NEWEST">Newest first</option>
              <option value="OLDEST">Oldest first</option>
              <option value="DUE_SOON">Due date: nearest first</option>
              <option value="DUE_LATEST">Due date: latest first</option>
              <option value="TITLE_ASC">Title: A–Z</option>
              <option value="TITLE_DESC">Title: Z–A</option>
            </select>
          </div>
        </div>
      </div>

      {/* Keep task cards mounted while filtering to preserve stable children. */}
      <div className="flex flex-col gap-4">
        {tasks.map((task, index) => {
          const order = taskOrder.get(task.id);
          const isVisible = order !== undefined;

          return (
            <div
              key={task.id}
              hidden={!isVisible}
              style={{ order: order ?? index }}
            >
              {taskCardsById.get(task.id)}
            </div>
          );
        })}
      </div>

      {/* No matching tasks */}
      <div
        hidden={filteredTasks.length > 0}
        className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center dark:border-gray-700 dark:bg-gray-900"
      >
          <div className="text-3xl">🔎</div>

          <h3 className="mt-3 text-lg font-semibold text-gray-900 dark:text-white">
            No matching tasks
          </h3>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Try changing your search or filters.
          </p>

          <button
            type="button"
            onClick={resetFilters}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Clear filters
          </button>
      </div>
    </div>
  );
}