import { connectDB } from "@/lib/db";

import Task from "@/models/Task";
import WorkspaceMember from "@/models/WorkspaceMember";

export interface DashboardStats {
  assignedTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  workspaces: number;
}

export async function getDashboardStats(
  userId: string
): Promise<DashboardStats> {
  await connectDB();

  // --------------------------------------------------
  // 1. Get assigned task counts
  // --------------------------------------------------

  const assignedTasks = await Task.countDocuments({
    assigneeId: userId,
  });

  const inProgressTasks = await Task.countDocuments({
    assigneeId: userId,
    status: "IN_PROGRESS",
  });

  const completedTasks = await Task.countDocuments({
    assigneeId: userId,
    status: "DONE",
  });

  // --------------------------------------------------
  // 2. Get workspace count
  // --------------------------------------------------

  const workspaces = await WorkspaceMember.countDocuments({
    userId,
  });

  // --------------------------------------------------
  // 3. Return dashboard statistics
  // --------------------------------------------------

  return {
    assignedTasks,
    inProgressTasks,
    completedTasks,
    workspaces,
  };
}
