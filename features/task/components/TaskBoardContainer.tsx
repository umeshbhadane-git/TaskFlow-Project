"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import TaskBoard from "@/features/task/components/TaskBoard";
import { updateTaskStatus } from "@/features/task/actions/updateTaskStatus";
import type { TaskStatus } from "@/models/Task";

interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: "LOW" | "MEDIUM" | "HIGH";
  dueDate: Date;
  tags: string[];
  assignee: {
    id: string;
    name: string;
    email: string;
    avatar: string;
  } | null;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface TaskBoardContainerProps {
  tasks: Task[];
  currentUserId: string;
  isOwner: boolean;
}

export default function TaskBoardContainer({
  tasks,
  currentUserId,
  isOwner,
}: TaskBoardContainerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = async (
    taskId: string,
    newStatus: TaskStatus
  ) => {
    const formData = new FormData();

    formData.append("taskId", taskId);
    formData.append("status", newStatus);

    const result = await updateTaskStatus(
      undefined as never,
      formData
    );

    if (!result.success) {
      alert(result.error.message);
      return;
    }

    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <div className="relative">
      {isPending && (
        <div className="absolute right-0 top-0 z-10 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow">
          Updating...
        </div>
      )}

      <TaskBoard
        tasks={tasks}
        currentUserId={currentUserId}
        isOwner={isOwner}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}