"use server";

import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { registerSchema } from "@/features/auth/schemas/auth.schema";

export type RegisterActionResult =
  | {
      success: true;
      message: string;
    }
  | {
      success: false;
      error: {
        code: string;
        message: string;
        fieldErrors?: Record<string, string[]>;
      };
    };

export async function registerUser(
  previousState: RegisterActionResult,
  formData: FormData
): Promise<RegisterActionResult> {
  try {
    const rawData = {
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
    };

    const validationResult = registerSchema.safeParse(rawData);

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

    const { name, email, password } = validationResult.data;

    await connectDB();

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return {
        success: false,
        error: {
          code: "USER_EXISTS",
          message: "An account with this email already exists.",
        },
      };
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await User.create({
      name,
      email,
      password: passwordHash,
    });

    return {
      success: true,
      message: "Account created successfully.",
    };
  } catch (error) {
    console.error("Registration error:", error);

    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Something went wrong. Please try again.",
      },
    };
  }
}