import { connectDB } from "@/lib/db";
import Task from "@/models/Task";

export async function getWorkspaceTasks(workspaceId: string) {
  await connectDB();

  const tasks = await Task.find({
    workspaceId,
  })
    .populate("assigneeId", "name email avatar")
    .populate("createdBy", "name email")
    .sort({
      dueDate: 1,
      createdAt: -1,
    })
    .lean();

  return tasks.map((task) => {
    const assignee = task.assigneeId as unknown as {
      _id: { toString(): string };
      name: string;
      email: string;
      avatar?: string;
    } | null;

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

      assignee: assignee
        ? {
            id: assignee._id.toString(),
            name: assignee.name,
            email: assignee.email,
            avatar: assignee.avatar || "",
          }
        : null,

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