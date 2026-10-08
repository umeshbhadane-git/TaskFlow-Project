"use server";

import mongoose from "mongoose";

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { revalidatePath } from "next/cache";

import Comment from "@/models/Comment";
import Task from "@/models/Task";
import WorkspaceMember from "@/models/WorkspaceMember";

import { updateCommentSchema } from "@/features/comment/schemas/comment.schema";

export type UpdateCommentActionResult =
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

export async function updateComment(
  _previousState: UpdateCommentActionResult,
  formData: FormData
): Promise<UpdateCommentActionResult> {
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
    // 2. Read and validate form data
    // ---------------------------------------------

    const rawData = {
      commentId: String(
        formData.get("commentId") || ""
      ),
      body: String(formData.get("body") || ""),
    };

    const validationResult =
      updateCommentSchema.safeParse(rawData);

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

    const { commentId, body } =
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
    // 6. Only comment author can edit
    // ---------------------------------------------

    if (
      comment.authorId.toString() !==
      session.user.id
    ) {
      return {
        success: false,
        error: {
          code: "FORBIDDEN",
          message:
            "You can only edit your own comments.",
        },
      };
    }

    // ---------------------------------------------
    // 7. Find task
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
    // 9. Update comment
    // ---------------------------------------------

    comment.body = body;

    await comment.save();

    revalidatePath(
    `/workspaces/${task.workspaceId.toString()}/tasks`
    );

    // ---------------------------------------------
    // 10. Success
    // ---------------------------------------------

    return {
      success: true,
      message: "Comment updated successfully.",
    };
  } catch (error) {
    console.error(
      "Update comment error:",
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