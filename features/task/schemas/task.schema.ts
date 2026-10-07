import { z } from "zod";

export const taskStatusSchema = z.enum([
  "TODO",
  "IN_PROGRESS",
  "DONE",
]);

export const taskPrioritySchema = z.enum([
  "LOW",
  "MEDIUM",
  "HIGH",
]);

export const createTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Task title must be at least 2 characters")
    .max(200, "Task title cannot exceed 200 characters"),

  description: z
    .string()
    .trim()
    .max(2000, "Task description cannot exceed 2000 characters")
    .optional()
    .or(z.literal("")),

  priority: taskPrioritySchema,

  dueDate: z
    .string()
    .min(1, "Due date is required"),

  assigneeId: z
    .string()
    .min(1, "Assignee is required"),

  tags: z
    .string()
    .optional()
    .or(z.literal("")),
});

export const updateTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Task title must be at least 2 characters")
    .max(200, "Task title cannot exceed 200 characters")
    .optional(),

  description: z
    .string()
    .trim()
    .max(2000, "Task description cannot exceed 2000 characters")
    .optional(),

  priority: taskPrioritySchema.optional(),

  dueDate: z
    .string()
    .min(1, "Due date is required")
    .optional(),

  assigneeId: z
    .string()
    .min(1, "Assignee is required")
    .optional(),
});

export const updateTaskStatusSchema = z.object({
  taskId: z.string().min(1, "Task ID is required"),

  status: taskStatusSchema,
});

export type CreateTaskInput =
  z.infer<typeof createTaskSchema>;

export type UpdateTaskInput =
  z.infer<typeof updateTaskSchema>;

export type UpdateTaskStatusInput =
  z.infer<typeof updateTaskStatusSchema>;