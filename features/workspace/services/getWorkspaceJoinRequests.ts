import { connectDB } from "@/lib/db";
import JoinRequest from "@/models/JoinRequest";

export async function getWorkspaceJoinRequests(
  workspaceId: string
) {
  await connectDB();

  const requests = await JoinRequest.find({
    workspaceId,
    status: "PENDING",
  })
    .populate("userId", "name email avatar")
    .sort({ createdAt: -1 })
    .lean();

  return requests.map((request) => {
    const user = request.userId as unknown as {
      _id: { toString(): string };
      name: string;
      email: string;
      avatar?: string;
    };

    return {
      id: request._id.toString(),
      workspaceId: request.workspaceId.toString(),
      status: request.status,
      createdAt: request.createdAt,

      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        avatar: user.avatar || "",
      },
    };
  });
}