import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { getAvailableWorkspaces } from "@/features/workspace/services/getAvailableWorkspaces";
import AvailableWorkspaces from "@/features/workspace/components/AvailableWorkspaces";

export default async function JoinWorkspacePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const workspaces = await getAvailableWorkspaces(session.user.id);

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/workspaces"
          className="mb-4 inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          ← Back to Workspaces
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Join Workspace
        </h1>

        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Find a workspace and send a request to join.
        </p>
      </div>

      {/* Workspace list */}
      <AvailableWorkspaces workspaces={workspaces} />
    </div>
  );
}