"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { updateProfileSchema } from "@/features/auth/schemas/profile.schema";

export type UpdateProfileResult =
  | {
      success: true;
      message: string;
    }
  | {
      success: false;
      error: {
        code: string;
        message: string;
      };
    };

export async function updateProfile(
  _previousState: UpdateProfileResult,
  formData: FormData
): Promise<UpdateProfileResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "You must be logged in.",
      },
    };
  }

  const validation = updateProfileSchema.safeParse({
    name: formData.get("name"),
  });

  if (!validation.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: validation.error.issues[0]?.message ?? "Invalid name.",
      },
    };
  }

  try {
    await connectDB();

    const user = await User.findById(session.user.id);

    if (!user) {
      return {
        success: false,
        error: {
          code: "USER_NOT_FOUND",
          message: "User account was not found.",
        },
      };
    }

    user.name = validation.data.name;

    await user.save();

    revalidatePath("/profile");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Profile updated successfully.",
    };
  } catch (error) {
    console.error("Update profile error:", error);

    return {
      success: false,
      error: {
        code: "UPDATE_FAILED",
        message: "Unable to update your profile.",
      },
    };
  }
}