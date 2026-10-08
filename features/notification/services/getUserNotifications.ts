import { connectDB } from "@/lib/db";
import Notification from "@/models/Notification";
import Task from "@/models/Task";
import Workspace from "@/models/Workspace";

export async function getUserNotifications(userId: string) {
  await connectDB();

  const notifications = await Notification.find({
    recipientId: userId,
  })
    .populate({
      path: "workspaceId",
      select: "name",
      model: Workspace,
    })
    .populate({
      path: "taskId",
      select: "title",
      model: Task,
    })
    .sort({ createdAt: -1 })
    .lean();

  return notifications.map((notification) => {
    const workspace = notification.workspaceId as unknown as {
      _id: { toString(): string };
      name: string;
    } | null;

    const task = notification.taskId as unknown as {
      _id: { toString(): string };
      title: string;
    } | null;

    return {
      id: notification._id.toString(),
      type: notification.type,
      message: notification.message,
      read: notification.read,
      workspaceId: workspace?._id.toString() ?? null,
      workspaceName: workspace?.name ?? null,
      taskId: task?._id.toString() ?? null,
      taskTitle: task?.title ?? null,
      createdAt: notification.createdAt,
    };
  });
}