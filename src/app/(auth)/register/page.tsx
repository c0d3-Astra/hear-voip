"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error);
      return;
    }

    router.push("/login");
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-lg border border-surface1 p-6 shadow"
      >
        <h1 className="text-xl font-bold">Create Account</h1>

        {error && (
          <p className="rounded bg-mantle p-2 text-sm text-red">{error}</p>
        )}

        <div>
          <label className="block text-sm font-medium">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 w-full rounded border border-surface1 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 w-full rounded border border-surface1 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="mt-1 w-full rounded border border-surface1 px-3 py-2 text-sm"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded bg-blue px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Register
        </button>

        <p className="text-center text-sm text-subtext0">
          Already have an account?{" "}
          <Link href="/login" className="text-blue hover:underline">
            Sign In
          </Link>
        </p>
      </form>
    </div>
  );
}
