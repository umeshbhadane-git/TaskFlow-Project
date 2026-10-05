"use server";

import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "../models/User";
import { registerSchema } from "../schemas/auth.schema";

export async function registerUser(formData: FormData) {
  const data = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const result = registerSchema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0]?.message ?? "Invalid input",
    };
  }

  try {
    await connectDB();

    const existingUser = await User.findOne({
      email: result.data.email,
    });

    if (existingUser) {
      return {
        success: false,
        error: "User with this email already exists",
      };
    }

    const hashedPassword = await bcrypt.hash(
      result.data.password,
      12
    );

    await User.create({
      name: result.data.name,
      email: result.data.email,
      password: hashedPassword,
      role: "member",
    });

    console.log("User registered successfully:", result.data.email);

    return {
      success: true,
      error: null
    };
  } catch (error) {
    console.error("Registration error:", error);

    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}