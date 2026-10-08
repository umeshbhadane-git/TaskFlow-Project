import { connectDB } from "@/lib/db";
import User from "@/models/User";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  createdAt: Date;
}

export async function getUserProfile(
  userId: string
): Promise<UserProfile | null> {
  await connectDB();

  const user = await User.findById(userId)
    .select("name email avatar createdAt")
    .lean();

  if (!user) {
    return null;
  }

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    avatar: user.avatar ?? "",
    createdAt: user.createdAt,
  };
}