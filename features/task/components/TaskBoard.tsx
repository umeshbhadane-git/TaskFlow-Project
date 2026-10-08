"use client";

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";

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

interface TaskBoardProps {
  tasks: Task[];
  currentUserId: string;
  isOwner: boolean;
  onStatusChange: (
    taskId: string,
    newStatus: TaskStatus
  ) => void;
}

const columns: {
  id: TaskStatus;
  title: string;
}[] = [
  {
    id: "TODO",
    title: "To Do",
  },
  {
    id: "IN_PROGRESS",
    title: "In Progress",
  },
  {
    id: "DONE",
    title: "Done",
  },
];

function DroppableColumn({
  id,
  title,
  taskCount,
  children,
}: {
  id: TaskStatus;
  title: string;
  taskCount: number;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      type: "column",
      status: id,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[500px] rounded-xl border p-4 transition ${
        isOver
          ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-950/80"
          : "border-gray-300 bg-white dark:border-gray-800 dark:bg-gray-900"
      }`}
    >
      {/* Column Header */}
      <div className="mb-5 flex items-center justify-between ">
        <h2 className="text-lg font-semibold text-black dark:text-white">
          {title}
        </h2>

        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-black dark:bg-blue-900 dark:text-blue-100">
          {taskCount}
        </span>
      </div>

      {/* Tasks */}
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
}

function SortableTaskCard({
  task,
  currentUserId,
  isOwner,
}: {
  task: Task;
  currentUserId: string;
  isOwner: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "task",
      task,
    },
  });

  const canDrag =
    isOwner || task.assignee?.id === currentUserId;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(canDrag ? attributes : {})}
      {...(canDrag ? listeners : {})}
      className={`rounded-lg border border-gray-300 bg-white p-4 text-black shadow-sm transition dark:border-gray-600 dark:bg-blue-900/70 dark:text-white ${
        canDrag
          ? "cursor-grab active:cursor-grabbing hover:bg-gray-50 dark:hover:bg-blue-900"
          : "cursor-default"
      } ${
        isDragging
          ? "opacity-40"
          : "opacity-100"
      }`}
    >
      {/* Task Header */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="font-medium leading-6">
          {task.title}
        </h3>

        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
            task.priority === "HIGH"
              ? "bg-gray-100 text-black dark:bg-red-950 dark:text-red-300"
              : task.priority === "MEDIUM"
                ? "bg-gray-100 text-black dark:bg-yellow-950 dark:text-yellow-300"
                : "bg-gray-100 text-black dark:bg-green-950 dark:text-green-300"
          }`}
        >
          {task.priority}
        </span>
      </div>

      {/* Description */}
      {task.description && (
        <p className="mb-4 line-clamp-2 text-sm text-gray-700 dark:text-gray-300">
          {task.description}
        </p>
      )}

      {/* Task Information */}
      <div className="space-y-1.5 text-xs text-gray-700 dark:text-gray-300">
        <p>
          Assigned to:{" "}
          <span className="font-medium text-black dark:text-white">
            {task.assignee?.name ?? "Unknown"}
          </span>
        </p>

        <p>
          Due:{" "}
          <span className="text-gray-900 dark:text-gray-200">
            {new Date(
              task.dueDate
            ).toLocaleDateString()}
          </span>
        </p>
      </div>

      {/* Tags */}
      {task.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {task.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-gray-100 px-2 py-1 text-xs text-black dark:bg-blue-950 dark:text-blue-200"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TaskBoard({
  tasks,
  currentUserId,
  isOwner,
  onStatusChange,
}: TaskBoardProps) {
  const [activeTask, setActiveTask] =
    useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  function handleDragStart(event: {
    active: {
      id: string | number;
    };
  }) {
    const task = tasks.find(
      (item) =>
        item.id === String(event.active.id)
    );

    if (task) {
      setActiveTask(task);
    }
  }

  function handleDragCancel() {
    setActiveTask(null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null);

    const { active, over } = event;

    if (!over) {
      return;
    }

    const taskId = String(active.id);

    const task = tasks.find(
      (item) => item.id === taskId
    );

    if (!task) {
      return;
    }

    let newStatus: TaskStatus | null = null;

    /*
     * Dropped directly on a column.
     */
    if (over.data.current?.type === "column") {
      newStatus =
        over.data.current.status as TaskStatus;
    } else {
      /*
       * Dropped on another task.
       * Use that task's current column.
       */
      const overTask = tasks.find(
        (item) =>
          item.id === String(over.id)
      );

      if (overTask) {
        newStatus = overTask.status;
      }
    }

    if (!newStatus) {
      return;
    }

    if (task.status === newStatus) {
      return;
    }

    /*
     * OWNER
     *
     * Owner can move any task
     * to any column.
     */
    if (isOwner) {
      onStatusChange(task.id, newStatus);
      return;
    }

    /*
     * MEMBER
     *
     * Member can only move
     * their own assigned task.
     */
    if (
      task.assignee?.id !== currentUserId
    ) {
      return;
    }

    /*
     * Members can only move:
     *
     * TODO → IN_PROGRESS
     * IN_PROGRESS → DONE
     */
    const validTransition =
      (task.status === "TODO" &&
        newStatus === "IN_PROGRESS") ||
      (task.status === "IN_PROGRESS" &&
        newStatus === "DONE");

    if (!validTransition) {
      return;
    }

    onStatusChange(task.id, newStatus);
  }

  return (
    <DndContext
      id="workspace-task-board"
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragCancel={handleDragCancel}
      onDragEnd={handleDragEnd}
    >
      <div className="grid gap-5 rounded-xl md:grid-cols-3 ">
        {columns.map((column) => {
          const columnTasks = tasks.filter(
            (task) =>
              task.status === column.id
          );

          return (
            <DroppableColumn
              key={column.id}
              id={column.id}
              title={column.title}
              taskCount={columnTasks.length}
            >
              <SortableContext
                items={columnTasks.map(
                  (task) => task.id
                )}
                strategy={
                  verticalListSortingStrategy
                }
              >
                {columnTasks.map((task) => (
                  <SortableTaskCard
                    key={task.id}
                    task={task}
                    currentUserId={
                      currentUserId
                    }
                    isOwner={isOwner}
                  />
                ))}

                {columnTasks.length === 0 && (
                  <div className="flex min-h-[120px] items-center justify-center rounded-lg border border-dashed border-gray-400 bg-white text-sm text-gray-600 dark:border-gray-600 dark:bg-blue-950/40 dark:text-gray-400">
                    Drop tasks here
                  </div>
                )}
              </SortableContext>
            </DroppableColumn>
          );
        })}
      </div>

      {/* Drag Preview */}
      <DragOverlay>
        {activeTask ? (
          <div className="w-[300px] rounded-lg border border-gray-300 bg-white p-4 text-black shadow-xl dark:border-gray-600 dark:bg-blue-900 dark:text-white">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-medium">
                {activeTask.title}
              </h3>

              <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-black dark:bg-blue-950 dark:text-blue-200">
                {activeTask.priority}
              </span>
            </div>

            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
              Assigned to:{" "}
              {activeTask.assignee?.name ??
                "Unassigned"}
            </p>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}