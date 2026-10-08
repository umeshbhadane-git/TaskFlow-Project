import bcrypt from "bcryptjs";

import User from "@/models/User";
import { connectDB } from "@/lib/db";

type Credentials = Partial<
  Record<"email" | "password", unknown>
>;

export async function authorizeCredentials(
  credentials: Credentials | undefined
) {
  if (!credentials?.email || !credentials?.password) {
    return null;
  }

  await connectDB();

  const email = String(credentials.email).toLowerCase().trim();
  const password = String(credentials.password);
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return null;
  }

  const isPasswordValid = await bcrypt.compare(
    password,
    user.password
  );

  if (!isPasswordValid) {
    return null;
  }

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    image: user.avatar || null,
  };
}
