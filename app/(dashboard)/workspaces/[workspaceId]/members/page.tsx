import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Workspace from "@/models/Workspace";
import WorkspaceMember from "@/models/WorkspaceMember";
import { getWorkspaceMembers } from "@/features/workspace/services/getWorkspaceMembers";

interface MembersPageProps {
  params: Promise<{
    workspaceId: string;
  }>;
}

export default async function MembersPage({
  params,
}: MembersPageProps) {
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
  // Check membership
  // --------------------------------------------------

  const membership = await WorkspaceMember.findOne({
    workspaceId,
    userId: session.user.id,
  }).lean();

  if (!membership) {
    redirect("/workspaces");
  }

  // --------------------------------------------------
  // Get members
  // --------------------------------------------------

  const members = await getWorkspaceMembers(workspaceId);

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/workspaces/${workspaceId}`}
          className="mb-4 inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-blue-400"
        >
          ← Back to Workspace
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Workspace Members
        </h1>

        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          {workspace.name} · {members.length} member
          {members.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Members */}
      {members.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center dark:border-gray-700 dark:bg-gray-900">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            No members found
          </h2>

          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Workspace members will appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between gap-4 p-5"
              >
                {/* User */}
                <div className="flex min-w-0 items-center gap-4">
                  {member.avatar ? (
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="h-11 w-11 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="truncate font-semibold text-gray-900 dark:text-white">
                      {member.name}
                    </p>

                    <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                      {member.email}
                    </p>
                  </div>
                </div>

                {/* Role */}
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                    member.role === "OWNER"
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                      : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  }`}
                >
                  {member.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}