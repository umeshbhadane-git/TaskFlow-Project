import { connectDB } from "@/lib/db";
import WorkspaceMember from "@/models/WorkspaceMember";

export async function getWorkspaceMembers(
  workspaceId: string
) {
  await connectDB();

  const memberships = await WorkspaceMember.find({
    workspaceId,
  })
    .populate("userId", "name email avatar")
    .sort({ joinedAt: 1 })
    .lean();

  return memberships.map((membership) => {
    const user = membership.userId as unknown as {
      _id: { toString(): string };
      name: string;
      email: string;
      avatar?: string;
    };

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      avatar: user.avatar || "",
      role: membership.role,
      joinedAt: membership.joinedAt,
    };
  });
}