import { connectDB } from "@/lib/db";
import Task from "@/models/Task";

export interface DashboardTask {
  id: string;
  title: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "TODO" | "IN_PROGRESS" | "DONE";
  dueDate: Date;
  workspaceId: string;
}

export async function getTasksDueThisWeek(
  userId: string
): Promise<DashboardTask[]> {
  await connectDB();

  const now = new Date();

  // Start of today
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  // End of the 7th day from today
  const endOfWeek = new Date(startOfToday);
  endOfWeek.setDate(
    endOfWeek.getDate() + 7
  );
  endOfWeek.setHours(23, 59, 59, 999);

  const tasks = await Task.find({
    assigneeId: userId,
    dueDate: {
      $gte: startOfToday,
      $lte: endOfWeek,
    },
    status: {
      $ne: "DONE",
    },
  })
    .sort({ dueDate: 1 })
    .limit(5)
    .lean();

  return tasks.map((task) => ({
    id: task._id.toString(),
    title: task.title,
    priority: task.priority,
    status: task.status,
    dueDate: task.dueDate,
    workspaceId: task.workspaceId.toString(),
  }));
}
