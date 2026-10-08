"use server";

import mongoose from "mongoose";

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Workspace from "@/models/Workspace";
import WorkspaceMember from "@/models/WorkspaceMember";
import JoinRequest from "@/models/JoinRequest";
import Notification from "@/models/Notification";

export type CreateJoinRequestActionResult =
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

export async function createJoinRequest(
  _previousState: CreateJoinRequestActionResult,
  formData: FormData
): Promise<CreateJoinRequestActionResult> {
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

    const workspaceId = String(formData.get("workspaceId") || "").trim();

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
    // 3. Connect to database
    // --------------------------------------------------

    await connectDB();

    // --------------------------------------------------
    // 4. Find workspace
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
    // 5. Owner cannot join their own workspace
    // --------------------------------------------------

    if (workspace.ownerId.toString() === session.user.id) {
      return {
        success: false,
        error: {
          code: "OWNER_CANNOT_JOIN",
          message: "You are already the owner of this workspace.",
        },
      };
    }

    // --------------------------------------------------
    // 6. Check if already a member
    // --------------------------------------------------

    const existingMembership = await WorkspaceMember.findOne({
      workspaceId,
      userId: session.user.id,
    });

    if (existingMembership) {
      return {
        success: false,
        error: {
          code: "ALREADY_MEMBER",
          message: "You are already a member of this workspace.",
        },
      };
    }

    // --------------------------------------------------
    // 7. Check for existing pending request
    // --------------------------------------------------

    const existingRequest = await JoinRequest.findOne({
      workspaceId,
      userId: session.user.id,
      status: "PENDING",
    });

    if (existingRequest) {
      return {
        success: false,
        error: {
          code: "REQUEST_ALREADY_EXISTS",
          message: "You already have a pending request for this workspace.",
        },
      };
    }

    // --------------------------------------------------
    // 8. Find requesting user
    // --------------------------------------------------

    const user = await User.findById(
      session.user.id
    ).select("name");

    if (!user) {
      return {
        success: false,
        error: {
          code: "USER_NOT_FOUND",
          message: "User account not found.",
        },
      };
    }

    // --------------------------------------------------
    // 9. Create join request
    // --------------------------------------------------

    await JoinRequest.create({
      workspaceId,
      userId: session.user.id,
      status: "PENDING",
    });

    // --------------------------------------------------
    // 10. Notify workspace owner
    // --------------------------------------------------

    await Notification.create({
      recipientId: workspace.ownerId,
      workspaceId: workspace._id,
      type: "JOIN_REQUEST",
      message: `${user.name} wants to be your ${workspace.name} member.`,
      read: false,
    });

    // --------------------------------------------------
    // 11. Success
    // --------------------------------------------------

    return {
      success: true,
      message: "Join request sent successfully.",
    };
  } catch (error) {
    console.error("Create join request error:", error);

    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Something went wrong. Please try again.",
      },
    };
  }
}