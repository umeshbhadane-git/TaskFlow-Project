"use server";

import mongoose from "mongoose";
import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";

import Workspace from "@/models/Workspace";
import WorkspaceMember from "@/models/WorkspaceMember";
import JoinRequest from "@/models/JoinRequest";
import Notification from "@/models/Notification";
import { recordWorkspaceActivity } from "@/features/workspace/services/recordWorkspaceActivity";

export type RespondToJoinRequestActionResult =
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

export async function respondToJoinRequest(
  _previousState: RespondToJoinRequestActionResult,
  formData: FormData
): Promise<RespondToJoinRequestActionResult> {
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
    // 2. Get form data
    // --------------------------------------------------

    const requestId = String(
      formData.get("requestId") || ""
    ).trim();

    const action = String(
      formData.get("action") || ""
    ).trim();

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return {
        success: false,
        error: {
          code: "INVALID_REQUEST",
          message: "Invalid join request.",
        },
      };
    }

    if (
      action !== "APPROVE" &&
      action !== "REJECT"
    ) {
      return {
        success: false,
        error: {
          code: "INVALID_ACTION",
          message:
            "Invalid join request action.",
        },
      };
    }

    // --------------------------------------------------
    // 3. Connect database
    // --------------------------------------------------

    await connectDB();

    // --------------------------------------------------
    // 4. Find join request
    // --------------------------------------------------

    const joinRequest =
      await JoinRequest.findById(requestId);

    if (!joinRequest) {
      return {
        success: false,
        error: {
          code: "REQUEST_NOT_FOUND",
          message: "Join request not found.",
        },
      };
    }

    if (joinRequest.status !== "PENDING") {
      return {
        success: false,
        error: {
          code: "REQUEST_ALREADY_PROCESSED",
          message:
            "This join request has already been processed.",
        },
      };
    }

    // --------------------------------------------------
    // 5. Find workspace
    // --------------------------------------------------

    const workspace =
      await Workspace.findById(
        joinRequest.workspaceId
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
    // 6. Verify workspace owner
    // --------------------------------------------------

    if (
      workspace.ownerId.toString() !==
      session.user.id
    ) {
      return {
        success: false,
        error: {
          code: "FORBIDDEN",
          message:
            "Only the workspace owner can manage join requests.",
        },
      };
    }

    // --------------------------------------------------
    // 7. APPROVE
    // --------------------------------------------------

    if (action === "APPROVE") {
      // Check whether membership already exists
      const existingMembership =
        await WorkspaceMember.findOne({
          workspaceId: joinRequest.workspaceId,
          userId: joinRequest.userId,
        });

      // Create membership only if it doesn't exist
      if (!existingMembership) {
        await WorkspaceMember.create({
          workspaceId:
            joinRequest.workspaceId,
          userId: joinRequest.userId,
          role: "MEMBER",
          joinedAt: new Date(),
        });

        await recordWorkspaceActivity({
          workspaceId: workspace._id.toString(),
          actorId: joinRequest.userId.toString(),
          type: "MEMBER_JOINED",
        });
      }

      // Update request status
      joinRequest.status = "APPROVED";

      await joinRequest.save();

      // Notify requester
      await Notification.create({
        recipientId: joinRequest.userId,
        workspaceId: workspace._id,
        type: "JOIN_REQUEST_APPROVED",
        message: `Your request to join ${workspace.name} has been approved.`,
        read: false,
      });

      // Refresh owner request page
      revalidatePath(
        `/workspaces/${workspace._id.toString()}/requests`
      );

      // Refresh workspace members page
      revalidatePath(
        `/workspaces/${workspace._id.toString()}/members`
      );

      // Refresh Join Workspace page
      revalidatePath("/workspaces/join");

      return {
        success: true,
        message:
          "Join request approved successfully.",
      };
    }

    // --------------------------------------------------
    // 8. REJECT
    // --------------------------------------------------

    joinRequest.status = "REJECTED";

    await joinRequest.save();

    // Notify requester
    await Notification.create({
      recipientId: joinRequest.userId,
      workspaceId: workspace._id,
      type: "JOIN_REQUEST_REJECTED",
      message: `Your request to join ${workspace.name} has been rejected.`,
      read: false,
    });

    // Refresh owner request page
    revalidatePath(
      `/workspaces/${workspace._id.toString()}/requests`
    );

    // Refresh Join Workspace page
    revalidatePath("/workspaces/join");

    return {
      success: true,
      message:
        "Join request rejected successfully.",
    };
  } catch (error) {
    console.error(
      "Respond to join request error:",
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