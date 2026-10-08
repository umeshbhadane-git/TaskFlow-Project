"use server";

import mongoose from "mongoose";
import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Comment from "@/models/Comment";
import Notification from "@/models/Notification";
import Task from "@/models/Task";
import Workspace from "@/models/Workspace";
import WorkspaceMember from "@/models/WorkspaceMember";

export type DeleteTaskResult =
  | { success: true; message: string }
  | {
      success: false;
      error: { code: string; message: string };
    };

export async function deleteTask(
  _previousState: DeleteTaskResult,
  formData: FormData
): Promise<DeleteTaskResult> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "You must be logged in to delete a task.",
        },
      };
    }

    const taskId = String(formData.get("taskId") || "").trim();
    const workspaceId = String(formData.get("workspaceId") || "").trim();

    if (
      !mongoose.Types.ObjectId.isValid(taskId) ||
      !mongoose.Types.ObjectId.isValid(workspaceId)
    ) {
      return {
        success: false,
        error: {
          code: "INVALID_INPUT",
          message: "The task or workspace is invalid.",
        },
      };
    }

    await connectDB();

    const workspace = await Workspace.findById(workspaceId).select(
      "ownerId status"
    );

    if (!workspace || workspace.status === "INACTIVE") {
      return {
        success: false,
        error: {
          code: "WORKSPACE_NOT_FOUND",
          message: "This workspace is unavailable.",
        },
      };
    }

    const membership = await WorkspaceMember.findOne({
      workspaceId,
      userId: session.user.id,
    }).select("role");

    if (
      workspace.ownerId.toString() !== session.user.id ||
      membership?.role !== "OWNER"
    ) {
      return {
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "Only the workspace owner can delete tasks.",
        },
      };
    }

    const task = await Task.findOne({
      _id: taskId,
      workspaceId,
    }).select("_id");

    if (!task) {
      return {
        success: false,
        error: {
          code: "TASK_NOT_FOUND",
          message: "Task not found in this workspace.",
        },
      };
    }

    await Promise.all([
      Comment.deleteMany({ taskId: task._id }),
      Notification.deleteMany({ taskId: task._id }),
      Task.deleteOne({ _id: task._id, workspaceId }),
    ]);

    revalidatePath(`/workspaces/${workspaceId}/tasks`);
    revalidatePath(`/workspaces/${workspaceId}/board`);
    revalidatePath(`/workspaces/${workspaceId}/activity`);
    revalidatePath(`/workspaces/${workspaceId}/tasks/${taskId}`);
    revalidatePath("/my-tasks");
    revalidatePath("/notifications");

    return {
      success: true,
      message: "Task deleted successfully.",
    };
  } catch (error) {
    console.error("Delete task error:", error);

    return {
      success: false,
      error: {
        code: "DELETE_FAILED",
        message: "Unable to delete the task. Please try again.",
      },
    };
  }
}
