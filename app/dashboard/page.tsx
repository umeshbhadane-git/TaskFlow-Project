import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import LogoutButton from "@/features/auth/components/LogoutButton";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">
        Welcome, {session.user.name}
      </h1>

      <p className="mt-2">
        {session.user.email}
      </p>

      <div className="mt-6">
        <LogoutButton />
      </div>
    </main>
  );
}