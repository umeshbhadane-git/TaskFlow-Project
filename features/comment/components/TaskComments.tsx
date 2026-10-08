import CreateCommentForm from "@/features/comment/components/CreateCommentForm";
import CommentList from "@/features/comment/components/CommentList";

interface TaskCommentsProps {
  taskId: string;
  currentUserId: string;
  isOwner: boolean;
}

export default function TaskComments({
  taskId,
  currentUserId,
  isOwner,
}: TaskCommentsProps) {
  return (
    <details className="group">
      <summary className="flex cursor-pointer list-none items-center justify-between rounded-lg py-2 text-sm font-medium text-gray-700 transition hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
        <span className="flex items-center gap-2">
          💬 Comments
        </span>

        <span className="text-xs text-gray-400 transition-transform group-open:rotate-180">
          ▼
        </span>
      </summary>

      <div className="mt-4 space-y-4">
        {/* Existing comments */}
        <CommentList
          taskId={taskId}
          currentUserId={currentUserId}
          isOwner={isOwner}
        />

        {/* Add comment */}
        <div className="border-t border-gray-100 pt-4 dark:border-gray-800">
          <CreateCommentForm taskId={taskId} />
        </div>
      </div>
    </details>
  );
}