"use server";

import mongoose from "mongoose";

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Task from "@/models/Task";
import Workspace from "@/models/Workspace";
import WorkspaceMember from "@/models/WorkspaceMember";
import { createTaskSchema } from "@/features/task/schemas/task.schema";

export type CreateTaskActionResult =
  | {
      success: true;
      message: string;
      taskId: string;
    }
  | {
      success: false;
      error: {
        code: string;
        message: string;
        fieldErrors?: Record<string, string[]>;
      };
    };

export async function createTask(
  _previousState: CreateTaskActionResult,
  formData: FormData
): Promise<CreateTaskActionResult> {
  try {
    // --------------------------------------------------
    // 1. Check authentication
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
    // 2. Get workspace ID
    // --------------------------------------------------

    const workspaceId = String(formData.get("workspaceId") || "");

    if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
      return {
        success: false,
        error: {
          code: "INVALID_WORKSPACE",
          message: "Invalid workspace.",
        },
      };
    }

    // --------------------------------------------------
    // 3. Validate form data
    // --------------------------------------------------

    const rawData = {
      title: formData.get("title"),
      description: formData.get("description"),
      priority: formData.get("priority"),
      dueDate: formData.get("dueDate"),
      assigneeId: formData.get("assigneeId"),
      tags: formData.get("tags"),
    };

    const validationResult = createTaskSchema.safeParse(rawData);

    if (!validationResult.success) {
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Please correct the highlighted fields.",
          fieldErrors:
            validationResult.error.flatten().fieldErrors,
        },
      };
    }

    const {
      title,
      description,
      priority,
      dueDate,
      assigneeId,
      tags,
    } = validationResult.data;

    // --------------------------------------------------
    // 4. Connect to database
    // --------------------------------------------------

    await connectDB();

    // --------------------------------------------------
    // 5. Check workspace
    // --------------------------------------------------

    const workspace = await Workspace.findById(workspaceId);

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
    // 6. Only workspace owner can create tasks
    // --------------------------------------------------

    if (workspace.ownerId.toString() !== session.user.id) {
      return {
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "Only the workspace owner can create tasks.",
        },
      };
    }

    // --------------------------------------------------
    // 7. Check assignee belongs to workspace
    // --------------------------------------------------

    if (!mongoose.Types.ObjectId.isValid(assigneeId)) {
      return {
        success: false,
        error: {
          code: "INVALID_ASSIGNEE",
          message: "Invalid assignee.",
        },
      };
    }

    const assigneeMembership = await WorkspaceMember.findOne({
      workspaceId,
      userId: assigneeId,
    });

    if (!assigneeMembership) {
      return {
        success: false,
        error: {
          code: "INVALID_ASSIGNEE",
          message: "Selected user is not a member of this workspace.",
        },
      };
    }

    // --------------------------------------------------
    // 8. Convert due date
    // --------------------------------------------------

    const parsedDueDate = new Date(dueDate);

    if (Number.isNaN(parsedDueDate.getTime())) {
      return {
        success: false,
        error: {
          code: "INVALID_DUE_DATE",
          message: "Please select a valid due date.",
        },
      };
    }

    // --------------------------------------------------
    // 9. Convert tags
    // --------------------------------------------------

    const parsedTags = tags
      ? tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      : [];

    // --------------------------------------------------
    // 10. Create task
    // --------------------------------------------------

    const task = await Task.create({
      workspaceId,
      title,
      description: description || "",
      status: "TODO",
      priority,
      dueDate: parsedDueDate,
      assigneeId,
      createdBy: session.user.id,
      tags: parsedTags,
    });

    // --------------------------------------------------
    // 11. Success
    // --------------------------------------------------

    return {
      success: true,
      message: "Task created successfully.",
      taskId: task._id.toString(),
    };
  } catch (error) {
    console.error("Create task error:", error);

    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Something went wrong. Please try again.",
      },
    };
  }
}