"use server";

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";

import Notification from "@/models/Notification";

export type MarkNotificationsAsReadResult =
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

export async function markNotificationsAsRead(): Promise<MarkNotificationsAsReadResult> {
  try {
    // 1. Check authentication
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

    // 2. Connect to MongoDB
    await connectDB();

    // 3. Mark only this user's unread notifications as read
    await Notification.updateMany(
      {
        recipientId: session.user.id,
        read: false,
      },
      {
        $set: {
          read: true,
        },
      }
    );

    return {
      success: true,
      message: "Notifications marked as read.",
    };
  } catch (error) {
    console.error(
      "Mark notifications as read error:",
      error
    );

    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Unable to update notifications.",
      },
    };
  }
}