import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Navbar */}
      <nav className="border-b border-gray-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-2xl font-bold">
            Task<span className="text-blue-500">Flow</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-900"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto flex max-w-4xl flex-col items-center px-6 py-7 text-center">
        <div className="mb-4 rounded-full bg-blue-500/10 px-4 py-2 text-lg font-extrabold text-blue-400">
          Task Management Tool
        </div>

        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
          Organize your work.
          <br />
          <span className="text-blue-500">Get things done.</span>
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-400">
          TaskFlow helps you organize projects, manage tasks, and
          collaborate with your team — all in one simple workspace.
        </p>

        <div className="mt-8 flex gap-4">
          <Link
            href="/register"
            className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
          >
            Get Started
          </Link>

          <Link
            href="/login"
            className="rounded-lg border border-gray-700 px-6 py-3 font-medium text-gray-300 hover:bg-gray-900"
          >
            Login
          </Link>
        </div>
      </section>

      {/* Features */}
      <section>
        <div className="mx-auto max-w-6xl px-6 py-7">
          <div className="text-center">
            <h2 className="text-3xl font-bold">
              Everything you need
            </h2>

            <p className="mt-3 text-gray-400">
              Keep your team&apos;s work organized and moving forward.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <Feature
              title="Manage Tasks"
              description="Create, assign, prioritize, and track tasks easily."
            />

            <Feature
              title="Work Together"
              description="Collaborate with your team and keep everyone aligned."
            />

            <Feature
              title="Track Progress"
              description="See what is pending, in progress, and completed."
            />
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="mx-auto max-w-4xl px-6 py-4 text-center">
        <h2 className="text-3xl font-bold">
          Ready to get organized?
        </h2>

        <p className="mt-3 text-gray-400">
          Create your free TaskFlow account and start managing your work.
        </p>

        <Link
          href="/register"
          className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
        >
          Create Account
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} TaskFlow
      </footer>
    </main>
  );
}

function Feature({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
      <h3 className="text-lg font-semibold">{title}</h3>

      <p className="mt-2 leading-6 text-gray-400">
        {description}
      </p>
    </div>
  );
}