import { connectDB } from "@/lib/db";
import Comment from "@/models/Comment";

export async function getTaskComments(
  taskId: string
) {
  await connectDB();

  const comments = await Comment.find({
    taskId,
  })
    .populate("authorId", "name email avatar")
    .sort({ createdAt: 1 })
    .lean();

  return comments.map((comment) => {
    const author = comment.authorId as unknown as {
      _id: {
        toString(): string;
      };
      name: string;
      email: string;
      avatar?: string;
    };

    return {
      id: comment._id.toString(),
      taskId: comment.taskId.toString(),
      body: comment.body,
      author: {
        id: author._id.toString(),
        name: author.name,
        email: author.email,
        avatar: author.avatar || "",
      },
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    };
  });
}