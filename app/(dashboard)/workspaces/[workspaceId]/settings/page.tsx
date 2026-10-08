import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Workspace from "@/models/Workspace";
import WorkspaceMember from "@/models/WorkspaceMember";
import DeleteWorkspaceButton from "@/features/workspace/components/DeleteWorkspaceButton";

interface WorkspaceSettingsPageProps {
  params: Promise<{
    workspaceId: string;
  }>;
}

export default async function WorkspaceSettingsPage({
  params,
}: WorkspaceSettingsPageProps) {
  const { workspaceId } = await params;

  // --------------------------------------------------
  // Authentication
  // --------------------------------------------------

  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // --------------------------------------------------
  // Database
  // --------------------------------------------------

  await connectDB();

  // --------------------------------------------------
  // Find workspace
  // --------------------------------------------------

  const workspace = await Workspace.findById(workspaceId).lean();

  if (!workspace) {
    notFound();
  }

  // --------------------------------------------------
  // Workspace status
  // --------------------------------------------------
  // Older workspaces may not have a status field because
  // the status field was added after they were created.
  //
  // In that case, treat the workspace as ACTIVE.
  // --------------------------------------------------

  const workspaceStatus =
    (workspace.status as "ACTIVE" | "INACTIVE" | undefined) ?? "ACTIVE";

  // --------------------------------------------------
  // Prevent access to inactive workspace
  // --------------------------------------------------

  if (workspaceStatus === "INACTIVE") {
    notFound();
  }

  // --------------------------------------------------
  // Check workspace membership
  // --------------------------------------------------

  const membership = await WorkspaceMember.findOne({
    workspaceId,
    userId: session.user.id,
  }).lean();

  if (!membership) {
    redirect("/workspaces");
  }

  const isOwner = membership.role === "OWNER";

  // --------------------------------------------------
  // Page
  // --------------------------------------------------

  return (
    <section className="mx-auto w-full max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <Link
          href={`/workspaces/${workspaceId}`}
          className="mb-4 inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-blue-400"
        >
          ← Back to Workspace
        </Link>

        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Workspace Settings
        </h1>

        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Manage settings for {workspace.name}.
        </p>
      </div>

      {/* General Information */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          General
        </h2>

        <div className="mt-5 space-y-4">
          {/* Workspace Name */}
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Workspace Name
            </p>

            <p className="mt-1 text-sm text-gray-900 dark:text-white">
              {workspace.name}
            </p>
          </div>

          {/* Description */}
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Description
            </p>

            <p className="mt-1 text-sm text-gray-900 dark:text-white">
              {workspace.description || "No description provided."}
            </p>
          </div>

          {/* Status */}
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Status
            </p>

            <span
              className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                workspaceStatus === "ACTIVE"
                  ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400"
                  : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
              }`}
            >
              {workspaceStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Danger Zone - Owner Only */}
      {isOwner && workspaceStatus === "ACTIVE" && (
        <div className="rounded-xl border border-red-200 bg-white dark:border-red-900/50 dark:bg-gray-900">


          {/* Delete Workspace */}
          <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                Delete Workspace
              </h3>

              <p className="mt-1 max-w-xl text-sm text-gray-600 dark:text-gray-400">
                Deleting the workspace will make it inactive and remove all
                tasks associated with it. This action cannot be undone.
              </p>
            </div>

            <DeleteWorkspaceButton workspaceId={workspaceId} />
          </div>
        </div>
      )}
    </section>
  );
}