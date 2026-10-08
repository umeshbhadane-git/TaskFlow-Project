import { getTaskComments } from "@/features/comment/services/getTaskComments";
import DeleteCommentButton from "@/features/comment/components/DeleteCommentButton";
import EditCommentButton from "@/features/comment/components/EditCommentButton";

interface CommentListProps {
  taskId: string;
  currentUserId: string;
  isOwner: boolean;
}

export default async function CommentList({
  taskId,
  currentUserId,
  isOwner,
}: CommentListProps) {
  const comments = await getTaskComments(taskId);

  if (comments.length === 0) {
    return (
      <div className="py-6 text-center text-sm text-muted-foreground">
        No comments yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => {
        const isAuthor =
          comment.author.id === currentUserId;

        return (
          <div
            key={comment.id}
            className="flex gap-3"
          >
            {/* Avatar */}
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium">
              {comment.author.name
                .charAt(0)
                .toUpperCase()}
            </div>

            {/* Comment */}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">
                  {comment.author.name}
                </span>

                {isAuthor && (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                    You
                  </span>
                )}

                <span className="text-xs text-muted-foreground">
                  {new Date(
                    comment.createdAt
                  ).toLocaleString()}
                </span>
              </div>

              <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                {comment.body}
              </p>

              {/* Actions */}
              <div className="mt-2 flex items-center gap-3">
                {/* Author can edit own comment */}
                {isAuthor && (
                  <EditCommentButton
                    commentId={comment.id}
                    initialBody={comment.body}
                  />
                )}

                {/* Workspace owner can delete any comment */}
                {isOwner && (
                  <DeleteCommentButton
                    commentId={comment.id}
                  />
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}