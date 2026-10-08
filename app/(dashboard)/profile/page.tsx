import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { getUserProfile } from "@/features/auth/services/getUserProfile";
import EditProfileForm from "@/features/auth/components/EditProfileForm";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const profile = await getUserProfile(session.user.id);

  if (!profile) {
    redirect("/dashboard");
  }

  const initials = profile.name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <section className="mx-auto w-full max-w-3xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Profile
        </h1>

        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          View and manage your TaskFlow account information.
        </p>
      </div>

      {/* Profile Card */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        {/* Profile Header */}
        <div className="border-b border-gray-200 px-6 py-8 dark:border-gray-800">
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            {/* Avatar */}
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-100 text-2xl font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-400">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={`${profile.name}'s avatar`}
                  className="h-full w-full object-cover"
                />
              ) : (
                initials
              )}
            </div>

            {/* Name */}
            <div className="text-center sm:text-left">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {profile.name}
              </h2>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {profile.email}
              </p>
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="divide-y divide-gray-200 dark:divide-gray-800">
          <div className="px-6 py-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Full name
            </p>

            <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
              {profile.name}
            </p>
          </div>

          <div className="px-6 py-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Email address
            </p>

            <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
              {profile.email}
            </p>
          </div>

          <div className="px-6 py-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Member since
            </p>

            <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
              {new Intl.DateTimeFormat("en-IN", {
                dateStyle: "long",
              }).format(new Date(profile.createdAt))}
            </p>
          </div>
        </div>
      </div>

      {/* Edit Profile */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Edit Profile
          </h2>

          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Update your profile information.
          </p>
        </div>

        <EditProfileForm currentName={profile.name} />
      </div>
    </section>
  );
}