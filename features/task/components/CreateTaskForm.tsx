"use client";

import { useActionState } from "react";

import {
  createTask,
  type CreateTaskActionResult,
} from "@/features/task/actions/createTask";

interface WorkspaceMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "OWNER" | "MEMBER";
  joinedAt: Date;
}

interface CreateTaskFormProps {
  workspaceId: string;
  members: WorkspaceMember[];
}

const initialState: CreateTaskActionResult = {
  success: false,
  error: {
    code: "",
    message: "",
  },
};

export default function CreateTaskForm({
  workspaceId,
  members,
}: CreateTaskFormProps) {
  const [state, formAction, isPending] = useActionState(
    createTask,
    initialState
  );

  return (
    <form action={formAction} className="space-y-6">
      {/* Workspace ID */}
      <input type="hidden" name="workspaceId" value={workspaceId} />

      {/* General error */}
      {!state.success && state.error.message && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400">
          {state.error.message}
        </div>
      )}

      {/* Success */}
      {state.success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-400">
          {state.message}
        </div>
      )}

      {/* Task title */}
      <div>
        <label
          htmlFor="title"
          className="mb-2 block text-sm font-medium"
        >
          Task Title
        </label>

        <input
          id="title"
          name="title"
          type="text"
          placeholder="Enter task title"
          required
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900"
        />

        {!state.success && state.error.fieldErrors?.title && (
          <p className="mt-1 text-sm text-red-500">
            {state.error.fieldErrors.title[0]}
          </p>
        )}
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="mb-2 block text-sm font-medium"
        >
          Description
        </label>

        <textarea
          id="description"
          name="description"
          rows={5}
          placeholder="Describe the task..."
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900"
        />

        {!state.success && state.error.fieldErrors?.description && (
          <p className="mt-1 text-sm text-red-500">
            {state.error.fieldErrors.description[0]}
          </p>
        )}
      </div>

      {/* Priority */}
      <div>
        <label
          htmlFor="priority"
          className="mb-2 block text-sm font-medium"
        >
          Priority
        </label>

        <select
          id="priority"
          name="priority"
          defaultValue="MEDIUM"
          required
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900"
        >
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>
      </div>

      {/* Due date */}
      <div>
        <label
          htmlFor="dueDate"
          className="mb-2 block text-sm font-medium"
        >
          Due Date
        </label>

        <input
          id="dueDate"
          name="dueDate"
          type="date"
          required
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900"
        />

        {!state.success && state.error.fieldErrors?.dueDate && (
          <p className="mt-1 text-sm text-red-500">
            {state.error.fieldErrors.dueDate[0]}
          </p>
        )}
      </div>

      {/* Assignee */}
      <div>
        <label
          htmlFor="assigneeId"
          className="mb-2 block text-sm font-medium"
        >
          Assign To
        </label>

        {members.length === 0 ? (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-700 dark:border-yellow-900 dark:bg-yellow-950/40 dark:text-yellow-400">
            No members are available in this workspace yet.
            <br />
            Add or approve workspace members before creating an
            assigned task.
          </div>
        ) : (
          <select
            id="assigneeId"
            name="assigneeId"
            required
            defaultValue=""
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900"
          >
            <option value="" disabled>
              Select a member
            </option>

            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name} ({member.email})
                {member.role === "OWNER" ? " - Owner" : ""}
              </option>
            ))}
          </select>
        )}

        {!state.success && state.error.fieldErrors?.assigneeId && (
          <p className="mt-1 text-sm text-red-500">
            {state.error.fieldErrors.assigneeId[0]}
          </p>
        )}
      </div>

      {/* Tags */}
      <div>
        <label
          htmlFor="tags"
          className="mb-2 block text-sm font-medium"
        >
          Tags
        </label>

        <input
          id="tags"
          name="tags"
          type="text"
          placeholder="frontend, react, urgent"
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900"
        />

        <p className="mt-1 text-xs text-gray-500">
          Separate multiple tags with commas.
        </p>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending || members.length === 0}
        className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Creating Task..." : "Create Task"}
      </button>
    </form>
  );
}