import Link from "next/link";
import mongoose from "mongoose";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Workspace from "@/models/Workspace";
import WorkspaceMember from "@/models/WorkspaceMember";
import { getWorkspaceActivity } from "@/features/workspace/services/getWorkspaceActivity";
import type { WorkspaceActivityType } from "@/models/WorkspaceActivity";

interface WorkspaceActivityPageProps {
  params: Promise<{ workspaceId: string }>;
}

function describeActivity(activity: {
  type: WorkspaceActivityType;
  actorName: string;
  targetUserName: string | null;
  taskTitle: string | null;
  workspaceName: string | null;
  fromStatus: string | null;
  toStatus: string | null;
}) {
  switch (activity.type) {
    case "WORKSPACE_CREATED":
      return (
        <>
          created the workspace{" "}
          <span className="font-medium">“{activity.workspaceName}”</span>
        </>
      );
    case "MEMBER_JOINED":
      return <>joined the workspace</>;
    case "TASK_CREATED":
      return (
        <>
          created task{" "}
          <span className="font-medium">“{activity.taskTitle}”</span>
        </>
      );
    case "TASK_ASSIGNED":
      return (
        <>
          assigned{" "}
          <span className="font-medium">“{activity.taskTitle}”</span>
          {activity.targetUserName
            ? ` to ${activity.targetUserName}`
            : " to a member"}
        </>
      );
    case "TASK_STATUS_CHANGED":
      return (
        <>
          moved{" "}
          <span className="font-medium">“{activity.taskTitle}”</span>
          {` from ${activity.fromStatus?.replace("_", " ")} to ${activity.toStatus?.replace("_", " ")}`}
        </>
      );
    case "COMMENT_ADDED":
      return (
        <>
          commented on{" "}
          <span className="font-medium">“{activity.taskTitle}”</span>
        </>
      );
  }
}

function formatActivityDate(date: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(date));
}

export default async function WorkspaceActivityPage({
  params,
}: WorkspaceActivityPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { workspaceId } = await params;

  if (!mongoose.isValidObjectId(workspaceId)) {
    notFound();
  }

  await connectDB();

  const workspace = await Workspace.findById(workspaceId).lean();

  if (!workspace || workspace.status === "INACTIVE") {
    notFound();
  }

  const membership = await WorkspaceMember.findOne({
    workspaceId,
    userId: session.user.id,
  }).lean();

  if (!membership) {
    notFound();
  }

  const activities = await getWorkspaceActivity(workspaceId);

  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link
          href={`/workspaces/${workspaceId}`}
          className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
        >
          ← Back to {workspace.name}
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
          Workspace activity
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Important actions in {workspace.name}.
        </p>
      </div>

      {activities.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center dark:border-gray-700 dark:bg-gray-900">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            No activity yet
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Workspace actions such as task creation, status changes, comments,
            and new members will appear here.
          </p>
        </div>
      ) : (
        <ol className="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white dark:divide-gray-800 dark:border-gray-800 dark:bg-gray-900">
          {activities.map((activity) => (
            <li
              key={activity.id}
              className="flex flex-col gap-1 p-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6"
            >
              <p className="text-sm text-gray-800 dark:text-gray-200">
                <span className="font-semibold text-gray-950 dark:text-white">
                  {activity.actorName}
                </span>{" "}
                {describeActivity(activity)}
              </p>
              <time
                dateTime={activity.createdAt}
                className="shrink-0 text-xs text-gray-500 dark:text-gray-400"
              >
                {formatActivityDate(activity.createdAt)}
              </time>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
