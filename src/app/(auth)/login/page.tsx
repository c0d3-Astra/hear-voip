"use client";

import { useState, FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-lg border border-surface1 p-6 shadow"
      >
        <h1 className="text-xl font-bold">Sign In</h1>

        {error && (
          <p className="rounded bg-mantle p-2 text-sm text-red">{error}</p>
        )}

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
            className="mt-1 w-full rounded border border-surface1 px-3 py-2 text-sm"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded bg-blue px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Sign In
        </button>

        <p className="text-center text-sm text-subtext0">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-blue hover:underline">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}
