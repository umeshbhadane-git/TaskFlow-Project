import { z } from "zod";

export const createCommentSchema = z.object({
  taskId: z
    .string()
    .min(1, "Task ID is required"),

  body: z
    .string()
    .trim()
    .min(1, "Comment cannot be empty")
    .max(
      2000,
      "Comment cannot exceed 2000 characters"
    ),
});

export const updateCommentSchema = z.object({
  commentId: z
    .string()
    .min(1, "Comment ID is required"),

  body: z
    .string()
    .trim()
    .min(1, "Comment cannot be empty")
    .max(
      2000,
      "Comment cannot exceed 2000 characters"
    ),
});

export const deleteCommentSchema = z.object({
  commentId: z
    .string()
    .min(1, "Comment ID is required"),
});

export type CreateCommentInput =
  z.infer<typeof createCommentSchema>;

export type UpdateCommentInput =
  z.infer<typeof updateCommentSchema>;

export type DeleteCommentInput =
  z.infer<typeof deleteCommentSchema>;