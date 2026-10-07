import { connectDB } from "@/lib/db";
import Notification from "@/models/Notification";

export async function getUnreadNotificationCount(
  userId: string
): Promise<number> {
  await connectDB();

  const unreadCount = await Notification.countDocuments({
    recipientId: userId,
    read: false,
  });

  return unreadCount;
}