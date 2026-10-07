import { z } from "zod";

export const createWorkspaceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Workspace name must be at least 2 characters")
    .max(100, "Workspace name cannot exceed 100 characters"),

  description: z
    .string()
    .trim()
    .max(500, "Workspace description cannot exceed 500 characters")
    .optional()
    .or(z.literal("")),
});

export type CreateWorkspaceInput = z.infer< typeof createWorkspaceSchema >;