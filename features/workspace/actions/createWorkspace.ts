"use server";

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Workspace from "@/models/Workspace";
import WorkspaceMember from "@/models/WorkspaceMember";
import { createWorkspaceSchema } from "@/features/workspace/schemas/workspace.schema";

export type CreateWorkspaceActionResult =
  | {
      success: true;
      message: string;
      workspaceId: string;
    }
  | {
      success: false;
      error: {
        code: string;
        message: string;
        fieldErrors?: Record<string, string[]>;
      };
    };

export async function createWorkspace(
  _previousState: CreateWorkspaceActionResult,
  formData: FormData
): Promise<CreateWorkspaceActionResult> {
  try {
    // 1. Check authentication
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "You must be logged in to create a workspace.",
        },
      };
    }

    // 2. Get form data
    const rawData = {
      name: formData.get("name"),
      description: formData.get("description"),
    };

    // 3. Validate input
    const validationResult = createWorkspaceSchema.safeParse(rawData);

    if (!validationResult.success) {
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Please correct the highlighted fields.",
          fieldErrors: validationResult.error.flatten().fieldErrors,
        },
      };
    }

    const { name, description } = validationResult.data;

    // 4. Connect to database
    await connectDB();

    // 5. Create workspace
    const workspace = await Workspace.create({
      name,
      description: description || "",
      ownerId: session.user.id,
    });

    // 6. Add creator as workspace owner
    await WorkspaceMember.create({
      workspaceId: workspace._id,
      userId: session.user.id,
      role: "OWNER",
    });

    return {
      success: true,
      message: "Workspace created successfully.",
      workspaceId: workspace._id.toString(),
    };
  } catch (error) {
    console.error("Create workspace error:", error);

    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Something went wrong. Please try again.",
      },
    };
  }
}