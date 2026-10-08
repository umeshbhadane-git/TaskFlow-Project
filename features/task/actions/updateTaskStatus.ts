"use server";

import mongoose from "mongoose";

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";

import User from "@/models/User";
import Task, { type TaskStatus } from "@/models/Task";
import Workspace from "@/models/Workspace";
import WorkspaceMember from "@/models/WorkspaceMember";
import Notification from "@/models/Notification";

import { updateTaskStatusSchema } from "@/features/task/schemas/task.schema";
import { recordWorkspaceActivity } from "@/features/workspace/services/recordWorkspaceActivity";

export type UpdateTaskStatusActionResult =
  | {
      success: true;
      message: string;
    }
  | {
      success: false;
      error: {
        code: string;
        message: string;
      };
    };

export async function updateTaskStatus(
  _previousState: UpdateTaskStatusActionResult,
  formData: FormData
): Promise<UpdateTaskStatusActionResult> {
  try {
    // --------------------------------------------------
    // 1. Authentication
    // --------------------------------------------------

    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "You must be logged in.",
        },
      };
    }

    // --------------------------------------------------
    // 2. Validate form data
    // --------------------------------------------------

    const rawData = {
      taskId: String(formData.get("taskId") || ""),
      status: String(formData.get("status") || ""),
    };

    const validationResult =
      updateTaskStatusSchema.safeParse(rawData);

    if (!validationResult.success) {
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid task status request.",
        },
      };
    }

    const { taskId, status } = validationResult.data;

    // --------------------------------------------------
    // 3. Validate MongoDB ObjectId
    // --------------------------------------------------

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return {
        success: false,
        error: {
          code: "INVALID_TASK",
          message: "Invalid task.",
        },
      };
    }

    // --------------------------------------------------
    // 4. Connect to database
    // --------------------------------------------------

    await connectDB();

    // --------------------------------------------------
    // 5. Find task
    // --------------------------------------------------

    const task = await Task.findById(taskId);

    if (!task) {
      return {
        success: false,
        error: {
          code: "TASK_NOT_FOUND",
          message: "Task not found.",
        },
      };
    }

    // --------------------------------------------------
    // 6. Find workspace
    // --------------------------------------------------

    const workspace = await Workspace.findById(
      task.workspaceId
    );

    if (!workspace) {
      return {
        success: false,
        error: {
          code: "WORKSPACE_NOT_FOUND",
          message: "Workspace not found.",
        },
      };
    }

    // --------------------------------------------------
    // 7. Check workspace status
    // --------------------------------------------------

    if (workspace.status === "INACTIVE") {
      return {
        success: false,
        error: {
          code: "WORKSPACE_INACTIVE",
          message:
            "This workspace is inactive. You cannot update task status.",
        },
      };
    }

    // --------------------------------------------------
    // 8. Check workspace membership
    // --------------------------------------------------

    const membership =
      await WorkspaceMember.findOne({
        workspaceId: task.workspaceId,
        userId: session.user.id,
      });

    if (!membership) {
      return {
        success: false,
        error: {
          code: "FORBIDDEN",
          message:
            "You are not a member of this workspace.",
        },
      };
    }

    // --------------------------------------------------
    // 9. Determine permissions
    // --------------------------------------------------

    const isOwner =
      workspace.ownerId.toString() ===
      session.user.id;

    const isAssignee =
      task.assigneeId.toString() ===
      session.user.id;

    /*
     * Only:
     *
     * 1. Workspace owner
     * 2. Assigned member
     *
     * can update the task status.
     */

    if (!isOwner && !isAssignee) {
      return {
        success: false,
        error: {
          code: "FORBIDDEN",
          message:
            "Only the workspace owner or assigned member can update this task.",
        },
      };
    }

    // --------------------------------------------------
    // 10. Check current status
    // --------------------------------------------------

    const currentStatus =
      task.status as TaskStatus;

    const requestedStatus =
      status as TaskStatus;

    if (currentStatus === requestedStatus) {
      return {
        success: true,
        message:
          "Task status is already set to this status.",
      };
    }

    // --------------------------------------------------
    // 11. Member transition rules
    // --------------------------------------------------

    /*
     * Owner:
     *   Can move task to any status.
     *
     * Member:
     *   TODO → IN_PROGRESS
     *   IN_PROGRESS → DONE
     */

    if (!isOwner) {
      const isValidMemberTransition =
        (currentStatus === "TODO" &&
          requestedStatus === "IN_PROGRESS") ||
        (currentStatus === "IN_PROGRESS" &&
          requestedStatus === "DONE");

      if (!isValidMemberTransition) {
        return {
          success: false,
          error: {
            code: "INVALID_STATUS_TRANSITION",
            message:
              "You can only move tasks from TODO to IN_PROGRESS and from IN_PROGRESS to DONE.",
          },
        };
      }
    }

    // --------------------------------------------------
    // 12. Update task status
    // --------------------------------------------------

    task.status = requestedStatus;

    await task.save();

    await recordWorkspaceActivity({
      workspaceId: task.workspaceId.toString(),
      actorId: session.user.id,
      type: "TASK_STATUS_CHANGED",
      taskId: task._id.toString(),
      taskTitle: task.title,
      fromStatus: currentStatus,
      toStatus: requestedStatus,
    });

    // --------------------------------------------------
    // 13. Notify owner when member completes task
    // --------------------------------------------------

    if (requestedStatus === "DONE" && !isOwner) {
      const completedByUser =
        await User.findById(session.user.id)
          .select("name")
          .lean();

      const userName =
        completedByUser?.name || "A member";

      await Notification.create({
        recipientId: workspace.ownerId,
        workspaceId: workspace._id,
        taskId: task._id,
        type: "TASK_COMPLETED",
        message: `Task "${task.title}" is done by ${userName}.`,
        read: false,
      });
    }

    // --------------------------------------------------
    // 14. Success
    // --------------------------------------------------

    return {
      success: true,
      message: "Task status updated successfully.",
    };
  } catch (error) {
    console.error(
      "Update task status error:",
      error
    );

    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message:
          "Something went wrong. Please try again.",
      },
    };
  }
}