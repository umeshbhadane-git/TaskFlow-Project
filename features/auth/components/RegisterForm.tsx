"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "../actions/register";

export default function RegisterForm() {
  const router = useRouter();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);

    const result = await registerUser(formData);

    setLoading(false);

    if (!result.success) {
      setError(result.error ?? "Registration failed");
      return;
    }

    router.push("/login");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md space-y-4 rounded-lg border p-6"
    >
      <h1 className="text-2xl font-bold">
        Create Account
      </h1>

      <input
        name="name"
        type="text"
        placeholder="Name"
        className="w-full rounded border p-2"
        required
      />

      <input
        name="email"
        type="email"
        placeholder="Email"
        className="w-full rounded border p-2"
        required
      />

      <input
        name="password"
        type="password"
        placeholder="Password"
        className="w-full rounded border p-2"
        required
      />

      {error && (
        <p className="text-sm text-red-500">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded bg-black p-2 text-white"
      >
        {loading ? "Creating account..." : "Register"}
      </button>
    </form>
  );
}