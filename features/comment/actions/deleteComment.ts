"use server";

import mongoose from "mongoose";

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";

import Comment from "@/models/Comment";
import Task from "@/models/Task";
import Workspace from "@/models/Workspace";
import WorkspaceMember from "@/models/WorkspaceMember";

import { deleteCommentSchema } from "@/features/comment/schemas/comment.schema";

export type DeleteCommentActionResult =
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

export async function deleteComment(
  _previousState: DeleteCommentActionResult,
  formData: FormData
): Promise<DeleteCommentActionResult> {
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
    // 2. Validate input
    // ---------------------------------------------

    const rawData = {
      commentId: String(
        formData.get("commentId") || ""
      ),
    };

    const validationResult =
      deleteCommentSchema.safeParse(rawData);

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

    const { commentId } =
      validationResult.data;

    // ---------------------------------------------
    // 3. Validate Comment ID
    // ---------------------------------------------

    if (
      !mongoose.Types.ObjectId.isValid(commentId)
    ) {
      return {
        success: false,
        error: {
          code: "INVALID_COMMENT",
          message: "Invalid comment.",
        },
      };
    }

    // ---------------------------------------------
    // 4. Connect to database
    // ---------------------------------------------

    await connectDB();

    // ---------------------------------------------
    // 5. Find comment
    // ---------------------------------------------

    const comment =
      await Comment.findById(commentId);

    if (!comment) {
      return {
        success: false,
        error: {
          code: "COMMENT_NOT_FOUND",
          message: "Comment not found.",
        },
      };
    }

    // ---------------------------------------------
    // 6. Find task
    // ---------------------------------------------

    const task = await Task.findById(
      comment.taskId
    );

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
    // 7. Find workspace
    // ---------------------------------------------

    const workspace =
      await Workspace.findById(
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

    // ---------------------------------------------
    // 8. Check workspace membership
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
    // 9. Only workspace owner can delete
    // ---------------------------------------------

    const isOwner =
      workspace.ownerId.toString() ===
      session.user.id;

    if (!isOwner) {
      return {
        success: false,
        error: {
          code: "FORBIDDEN",
          message:
            "Only the workspace owner can delete comments.",
        },
      };
    }

    // ---------------------------------------------
    // 10. Delete comment
    // ---------------------------------------------

    await Comment.findByIdAndDelete(commentId);

    // ---------------------------------------------
    // 11. Success
    // ---------------------------------------------

    return {
      success: true,
      message: "Comment deleted successfully.",
    };
  } catch (error) {
    console.error(
      "Delete comment error:",
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