import { connectDB } from "@/lib/db";
import Task from "@/models/Task";

export async function getMyTasks(userId: string) {
  await connectDB();

  const tasks = await Task.find({
    assigneeId: userId,
  })
    .populate("workspaceId", "name")
    .populate("createdBy", "name email")
    .sort({ dueDate: 1, createdAt: -1 })
    .lean();

  return tasks.map((task) => {
    const workspace = task.workspaceId as unknown as {
      _id: { toString(): string };
      name: string;
    };

    const creator = task.createdBy as unknown as {
      _id: { toString(): string };
      name: string;
      email: string;
    };

    return {
      id: task._id.toString(),
      title: task.title,
      description: task.description || "",
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      tags: task.tags,
      workspaceId: workspace._id.toString(),
      workspaceName: workspace.name,
      createdBy: {
        id: creator._id.toString(),
        name: creator.name,
        email: creator.email,
      },
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  });
}