import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";

import Task from "@/models/Task";
import Workspace from "@/models/Workspace";
import WorkspaceMember from "@/models/WorkspaceMember";

import TaskComments from "@/features/comment/components/TaskComments";
import DeleteTaskButton from "@/features/task/components/DeleteTaskButton";

interface TaskDetailsPageProps {
  params: Promise<{
    workspaceId: string;
    taskId: string;
  }>;
}

export default async function TaskDetailsPage({
  params,
}: TaskDetailsPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { workspaceId, taskId } = await params;

  await connectDB();

  // ---------------------------------------------
  // Check workspace
  // ---------------------------------------------

  const workspace = await Workspace.findById(
    workspaceId
  ).lean();

  if (!workspace) {
    notFound();
  }

  if (workspace.status === "INACTIVE") {
    notFound();
  }

  // ---------------------------------------------
  // Check membership
  // ---------------------------------------------

  const membership =
    await WorkspaceMember.findOne({
      workspaceId,
      userId: session.user.id,
    }).lean();

  if (!membership) {
    redirect("/workspaces");
  }

  // ---------------------------------------------
  // Get task
  // ---------------------------------------------

  const task = await Task.findOne({
    _id: taskId,
    workspaceId,
  })
    .populate(
      "assigneeId",
      "name email avatar"
    )
    .populate(
      "createdBy",
      "name email"
    )
    .lean();

  if (!task) {
    notFound();
  }

  const assignee = task.assigneeId as unknown as {
    _id: {
      toString(): string;
    };
    name: string;
    email: string;
    avatar?: string;
  };

  const creator = task.createdBy as unknown as {
    _id: {
      toString(): string;
    };
    name: string;
    email: string;
  };

  const isOwner =
    workspace.ownerId.toString() ===
    session.user.id;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Back */}
      <Link
        href={`/workspaces/${workspaceId}/tasks`}
        className="inline-flex text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back to Tasks
      </Link>

      {/* Task Details */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">{task.title}</h1>

            <p className="mt-1 text-sm text-muted-foreground">
              {workspace.name}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Status */}
            <span className="w-fit rounded-full bg-muted px-3 py-1 text-sm font-medium">
              {task.status.replace("_", " ")}
            </span>
            {isOwner && (
              <DeleteTaskButton
                taskId={task._id.toString()}
                workspaceId={workspaceId}
              />
            )}
          </div>
        </div>

        {/* Description */}
        {task.description && (
          <div className="mt-6">
            <h2 className="mb-2 text-sm font-semibold">Description</h2>

            <p className="whitespace-pre-wrap text-sm text-muted-foreground">
              {task.description}
            </p>
          </div>
        )}

        {/* Task information */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">Priority</p>

            <p className="mt-1 font-medium">{task.priority}</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Due Date</p>

            <p className="mt-1 font-medium">
              {new Date(task.dueDate).toLocaleDateString()}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Assigned To</p>

            <p className="mt-1 font-medium">{assignee?.name || "Unknown"}</p>

            {assignee?.email && (
              <p className="text-sm text-muted-foreground">{assignee.email}</p>
            )}
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Created By</p>

            <p className="mt-1 font-medium">{creator.name}</p>

            <p className="text-sm text-muted-foreground">{creator.email}</p>
          </div>
        </div>

        {/* Tags */}
        {task.tags?.length > 0 && (
          <div className="mt-6">
            <p className="mb-2 text-xs text-muted-foreground">Tags</p>

            <div className="flex flex-wrap gap-2">
              {task.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="rounded-full bg-muted px-3 py-1 text-xs"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Created date */}
        <div className="mt-6 border-t pt-4 text-xs text-muted-foreground dark:border-gray-800">
          Created on {new Date(task.createdAt).toLocaleString()}
        </div>
      </div>

      {/* Comments */}
      <TaskComments
        taskId={task._id.toString()}
        currentUserId={session.user.id}
        isOwner={isOwner}
      />
    </div>
  );
}