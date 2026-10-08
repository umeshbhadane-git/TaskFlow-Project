"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";

import Workspace from "@/models/Workspace";
import WorkspaceMember from "@/models/WorkspaceMember";
import Task from "@/models/Task";
import JoinRequest from "@/models/JoinRequest";

export type DeleteWorkspaceResult =
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

export async function deleteWorkspace(
  _previousState: DeleteWorkspaceResult,
  formData: FormData
): Promise<DeleteWorkspaceResult> {
  // --------------------------------------------------
  // Authentication
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
  // Get workspace ID
  // --------------------------------------------------

  const workspaceId = formData.get("workspaceId");

  if (typeof workspaceId !== "string" || !workspaceId) {
    return {
      success: false,
      error: {
        code: "INVALID_WORKSPACE",
        message: "Workspace ID is required.",
      },
    };
  }

  try {
    // --------------------------------------------------
    // Connect to database
    // --------------------------------------------------

    await connectDB();

    // --------------------------------------------------
    // Find workspace
    // --------------------------------------------------

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return {
        success: false,
        error: {
          code: "WORKSPACE_NOT_FOUND",
          message: "Workspace was not found.",
        },
      };
    }

    // --------------------------------------------------
    // Check owner
    // --------------------------------------------------

    if (workspace.ownerId.toString() !== session.user.id) {
      return {
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "Only the workspace owner can delete this workspace.",
        },
      };
    }

    // --------------------------------------------------
    // Check current status
    // --------------------------------------------------

    if (workspace.status === "INACTIVE") {
      return {
        success: false,
        error: {
          code: "WORKSPACE_INACTIVE",
          message: "This workspace is already inactive.",
        },
      };
    }

    // --------------------------------------------------
    // Delete all tasks belonging to workspace
    // --------------------------------------------------

    await Task.deleteMany({
      workspaceId: workspace._id,
    });

    // --------------------------------------------------
    // Delete pending join requests
    // --------------------------------------------------

    await JoinRequest.deleteMany({
      workspaceId: workspace._id,
      status: "PENDING",
    });

    // --------------------------------------------------
    // Soft delete workspace
    // --------------------------------------------------
    // IMPORTANT:
    // We explicitly update the database document using
    // $set instead of modifying the Mongoose document.
    // --------------------------------------------------

    const updateResult = await Workspace.updateOne(
      {
        _id: workspace._id,
        ownerId: session.user.id,
      },
      {
        $set: {
          status: "INACTIVE",
        },
      }
    );

    // --------------------------------------------------
    // Verify update actually happened
    // --------------------------------------------------

    if (updateResult.modifiedCount !== 1) {
      return {
        success: false,
        error: {
          code: "DELETE_FAILED",
          message: "Workspace status could not be updated.",
        },
      };
    }

    // --------------------------------------------------
    // Revalidate affected pages
    // --------------------------------------------------

    revalidatePath("/workspaces");
    revalidatePath("/workspaces/join");
    revalidatePath("/my-tasks");
    revalidatePath("/dashboard");

    revalidatePath(`/workspaces/${workspaceId}`);
    revalidatePath(`/workspaces/${workspaceId}/board`);
    revalidatePath(`/workspaces/${workspaceId}/tasks`);
    revalidatePath(`/workspaces/${workspaceId}/members`);
    revalidatePath(`/workspaces/${workspaceId}/requests`);
    revalidatePath(`/workspaces/${workspaceId}/activity`);
    revalidatePath(`/workspaces/${workspaceId}/settings`);

    // --------------------------------------------------
    // Success
    // --------------------------------------------------

    return {
      success: true,
      message: "Workspace deleted successfully.",
    };
  } catch (error) {
    console.error("Delete workspace error:", error);

    return {
      success: false,
      error: {
        code: "DELETE_FAILED",
        message: "Unable to delete the workspace.",
      },
    };
  }
}