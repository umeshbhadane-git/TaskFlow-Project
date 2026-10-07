import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import Sidebar from "@/components/layout/Sidebar";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Fixed desktop sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="min-h-[calc(100vh-4rem)] lg:ml-64">
        <div className="min-w-0 p-4 sm:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}