import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Workspace from "@/models/Workspace";
import WorkspaceMember from "@/models/WorkspaceMember";
import JoinRequest from "@/models/JoinRequest";

export async function getAvailableWorkspaces(userId: string) {
  await connectDB();

  // Workspaces where the current user is already a member
  const memberships = await WorkspaceMember.find({
    userId,
  })
    .select("workspaceId")
    .lean();

  const memberWorkspaceIds = memberships.map(
    (membership) => membership.workspaceId
  );

  // Pending requests made by the current user
  const pendingRequests = await JoinRequest.find({
    userId,
    status: "PENDING",
  })
    .select("workspaceId")
    .lean();

  const pendingWorkspaceIds = pendingRequests.map(
    (request) => request.workspaceId
  );

  // Treat older workspaces without a status as active.
  const workspaces = await Workspace.find({
    $or: [
      { status: "ACTIVE" },
      { status: { $exists: false } },
    ],
    _id: {
      $nin: memberWorkspaceIds,
    },
  })
    .populate({
      path: "ownerId",
      select: "name email",
      model: User,
    })
    .sort({ createdAt: -1 })
    .lean();

  return workspaces.map((workspace) => {
    const owner = workspace.ownerId as unknown as {
      _id: { toString(): string };
      name: string;
      email: string;
    };

    const workspaceId = workspace._id.toString();

    return {
      id: workspaceId,
      name: workspace.name,
      description: workspace.description || "",
      owner: {
        id: owner._id.toString(),
        name: owner.name,
        email: owner.email,
      },
      hasPendingRequest: pendingWorkspaceIds.some(
        (id) => id.toString() === workspaceId
      ),
    };
  });
}