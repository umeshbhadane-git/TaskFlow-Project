import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Workspace from "@/models/Workspace";
import WorkspaceMember from "@/models/WorkspaceMember";
import { getWorkspaceJoinRequests } from "@/features/workspace/services/getWorkspaceJoinRequests";
import JoinRequestActions from "@/features/workspace/components/JoinRequestActions";

interface JoinRequestsPageProps {
  params: Promise<{
    workspaceId: string;
  }>;
}

export default async function JoinRequestsPage({
  params,
}: JoinRequestsPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { workspaceId } = await params;

  await connectDB();

  // --------------------------------------------------
  // Find workspace
  // --------------------------------------------------

  const workspace = await Workspace.findById(workspaceId).lean();

  if (!workspace) {
    notFound();
  }

  // --------------------------------------------------
  // Check workspace status
  // --------------------------------------------------

  if (workspace.status === "INACTIVE") {
    notFound();
  }

  // --------------------------------------------------
  // Check current user is a workspace member
  // --------------------------------------------------

  const membership = await WorkspaceMember.findOne({
    workspaceId,
    userId: session.user.id,
  }).lean();

  if (!membership) {
    redirect("/workspaces");
  }

  // --------------------------------------------------
  // Only OWNER can see join requests
  // --------------------------------------------------

  if (workspace.ownerId.toString() !== session.user.id) {
    redirect(`/workspaces/${workspaceId}`);
  }

  // --------------------------------------------------
  // Get pending requests
  // --------------------------------------------------

  const requests = await getWorkspaceJoinRequests(workspaceId);

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/workspaces/${workspaceId}`}
          className="mb-4 inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          ← Back to Workspace
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Join Requests
        </h1>

        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Manage users who want to join{" "}
          <span className="font-medium">{workspace.name}</span>.
        </p>
      </div>

      {/* Requests */}
      {requests.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center dark:border-gray-700 dark:bg-gray-900">
          <div className="text-4xl">👥</div>

          <h2 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
            No pending requests
          </h2>

          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            New join requests will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request.id}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                {/* User information */}
                <div className="flex min-w-0 items-center gap-4">
                  {/* Avatar */}
                  {request.user.avatar ? (
                    <img
                      src={request.user.avatar}
                      alt={request.user.name}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-lg font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                      {request.user.name.charAt(0).toUpperCase()}
                    </div>
                  )}

                  {/* Details */}
                  <div className="min-w-0">
                    <h2 className="font-semibold text-gray-900 dark:text-white">
                      {request.user.name}
                    </h2>

                    <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                      {request.user.email}
                    </p>

                    <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                      Requested{" "}
                      {new Date(
                        request.createdAt
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <JoinRequestActions
                  requestId={request.id}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}