import { connectDB } from "@/lib/db";
import Task from "@/models/Task";
import Workspace from "@/models/Workspace";
import User from "@/models/User";

export interface MyTask {
  id: string;
  title: string;
  description: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  dueDate: Date;
  workspaceId: string;
  workspaceName: string;
  assigneeId: string;
  assigneeName: string;
  createdById: string;
  createdByName: string;
  tags: string[];
}

export async function getMyTasks(userId: string): Promise<MyTask[]> {
  await connectDB();

  const tasks = await Task.find({
    assigneeId: userId,
  })
    .populate({
      path: "workspaceId",
      select: "name",
      model: Workspace,
    })
    .populate({
      path: "assigneeId",
      select: "name",
      model: User,
    })
    .populate({
      path: "createdBy",
      select: "name",
      model: User,
    })
    .sort({
      dueDate: 1,
      createdAt: -1,
    })
    .lean();

  return tasks.map((task) => {
    const workspace = task.workspaceId as unknown as {
      _id: { toString(): string };
      name: string;
    };

    const assignee = task.assigneeId as unknown as {
      _id: { toString(): string };
      name: string;
    };

    const creator = task.createdBy as unknown as {
      _id: { toString(): string };
      name: string;
    };

    return {
      id: task._id.toString(),
      title: task.title,
      description: task.description ?? "",
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,

      workspaceId: workspace._id.toString(),
      workspaceName: workspace.name,

      assigneeId: assignee._id.toString(),
      assigneeName: assignee.name,

      createdById: creator._id.toString(),
      createdByName: creator.name,

      tags: task.tags ?? [],
    };
  });
}