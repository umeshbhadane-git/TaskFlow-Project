import { connectDB } from "@/lib/db";
import User from "@/models/User";
import WorkspaceActivity from "@/models/WorkspaceActivity";

export async function getWorkspaceActivity(workspaceId: string) {
  await connectDB();

  const activities = await WorkspaceActivity.find({ workspaceId })
    .sort({ createdAt: -1 })
    .limit(100)
    .populate({ path: "actorId", select: "name", model: User })
    .populate({ path: "targetUserId", select: "name", model: User })
    .lean();

  return activities.map((activity) => {
    const actor = activity.actorId as unknown as
      | { name?: string }
      | null;
    const target = activity.targetUserId as unknown as
      | { name?: string }
      | null;

    return {
      id: activity._id.toString(),
      type: activity.type,
      actorName: actor?.name || "Former member",
      targetUserName: target?.name || null,
      taskTitle: activity.taskTitle || null,
      workspaceName: activity.workspaceName || null,
      fromStatus: activity.fromStatus || null,
      toStatus: activity.toStatus || null,
      createdAt: activity.createdAt.toISOString(),
    };
  });
}
