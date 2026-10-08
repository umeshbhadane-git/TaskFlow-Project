"use server";

import mongoose from "mongoose";
import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";

import Comment from "@/models/Comment";
import Task from "@/models/Task";
import WorkspaceMember from "@/models/WorkspaceMember";

import { createCommentSchema } from "@/features/comment/schemas/comment.schema";
import { recordWorkspaceActivity } from "@/features/workspace/services/recordWorkspaceActivity";

export type CreateCommentActionResult =
  | {
      success: true;
      message: string;
      commentId: string;
    }
  | {
      success: false;
      error: {
        code: string;
        message: string;
      };
    };

export async function createComment(
  _previousState: CreateCommentActionResult,
  formData: FormData
): Promise<CreateCommentActionResult> {
  try {
    // ---------------------------------------------
    // 1. Authentication
    // ---------------------------------------------

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

    // ---------------------------------------------
    // 2. Read form data
    // ---------------------------------------------

    const rawData = {
      taskId: String(formData.get("taskId") || ""),
      body: String(formData.get("body") || ""),
    };

    // ---------------------------------------------
    // 3. Validate input
    // ---------------------------------------------

    const validationResult =
      createCommentSchema.safeParse(rawData);

    if (!validationResult.success) {
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message:
            validationResult.error.issues[0]?.message ||
            "Invalid comment.",
        },
      };
    }

    const { taskId, body } = validationResult.data;

    // ---------------------------------------------
    // 4. Validate Task ID
    // ---------------------------------------------

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return {
        success: false,
        error: {
          code: "INVALID_TASK",
          message: "Invalid task.",
        },
      };
    }

    // ---------------------------------------------
    // 5. Connect to database
    // ---------------------------------------------

    await connectDB();

    // ---------------------------------------------
    // 6. Find task
    // ---------------------------------------------

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

    // ---------------------------------------------
    // 7. Check workspace membership
    // ---------------------------------------------

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

    // ---------------------------------------------
    // 8. Create comment
    // ---------------------------------------------

    const comment = await Comment.create({
      taskId: task._id,
      authorId: session.user.id,
      body,
    });

    await recordWorkspaceActivity({
      workspaceId: task.workspaceId.toString(),
      actorId: session.user.id,
      type: "COMMENT_ADDED",
      taskId: task._id.toString(),
      taskTitle: task.title,
    });

    revalidatePath(
      `/workspaces/${task.workspaceId.toString()}/tasks/${task._id.toString()}`
    );
    revalidatePath(
      `/workspaces/${task.workspaceId.toString()}/tasks`
    );
    revalidatePath(
      `/workspaces/${task.workspaceId.toString()}/activity`
    );

    // ---------------------------------------------
    // 9. Return success
    // ---------------------------------------------

    return {
      success: true,
      message: "Comment added successfully.",
      commentId: comment._id.toString(),
    };
  } catch (error) {
    console.error(
      "Create comment error:",
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