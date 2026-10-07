import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import Workspace from "@/models/Workspace";
import WorkspaceMember from "@/models/WorkspaceMember";
import { connectDB } from "@/lib/db";
import { getWorkspaceMembers } from "@/features/workspace/services/getWorkspaceMembers";
import CreateTaskForm from "@/features/task/components/CreateTaskForm";

interface CreateTaskPageProps {
  params: Promise<{
    workspaceId: string;
  }>;
}

export default async function CreateTaskPage({
  params,
}: CreateTaskPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { workspaceId } = await params;

  await connectDB();

  // Check workspace
  const workspace = await Workspace.findById(workspaceId).lean();

  if (!workspace) {
    notFound();
  }

  // Check membership
  const membership = await WorkspaceMember.findOne({
    workspaceId,
    userId: session.user.id,
  }).lean();

  if (!membership) {
    redirect("/workspaces");
  }

  // Only owner can create tasks
  if (workspace.ownerId.toString() !== session.user.id) {
    redirect(`/workspaces/${workspaceId}/tasks`);
  }

  // Get all workspace members
  const members = await getWorkspaceMembers(workspaceId);

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/workspaces/${workspaceId}/tasks`}
          className="mb-4 inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          ← Back to Tasks
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Create Task
        </h1>

        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Create a task and assign it to a workspace member.
        </p>
      </div>

      {/* Form */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <CreateTaskForm
          workspaceId={workspaceId}
          members={members}
        />
      </div>
    </div>
  );
}