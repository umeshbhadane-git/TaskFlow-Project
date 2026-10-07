import { connectDB } from "@/lib/db";
import Workspace from "@/models/Workspace";
import WorkspaceMember from "@/models/WorkspaceMember";


export async function getUserWorkspaces(userId: string) {
  await connectDB();

  const memberships = await WorkspaceMember.find({
    userId,
  })
    .populate({
      path: "workspaceId",
      select: "name description ownerId",
      model: Workspace,
    })
    .sort({ joinedAt: -1 })
    .lean();

  return memberships.map((membership) => {
    const workspace = membership.workspaceId as unknown as {
      _id: string;
      name: string;
      description: string;
      ownerId: string;
    };

    return {
      id: workspace._id.toString(),
      name: workspace.name,
      description: workspace.description,
      ownerId: workspace.ownerId.toString(),
      role: membership.role,
      joinedAt: membership.joinedAt,
    };
  });
}