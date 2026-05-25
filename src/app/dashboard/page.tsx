import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <LogoutButton />
      </div>

      <p className="mb-6 text-subtext0">
        Welcome, {session.user.name}. Choose your device view:
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/dashboard/pc"
          className="rounded-lg border border-surface1 p-6 shadow-sm transition hover:border-blue hover:shadow-md"
        >
          <h2 className="mb-2 text-lg font-semibold">PC / Laptop</h2>
          <p className="text-sm text-subtext0">
            Full desktop interface with large controls
          </p>
          <span className="mt-3 inline-block text-sm font-medium text-blue">
            Open on PC →
          </span>
        </Link>

        <Link
          href="/dashboard/mobile"
          className="rounded-lg border border-surface1 p-6 shadow-sm transition hover:border-blue hover:shadow-md"
        >
          <h2 className="mb-2 text-lg font-semibold">Mobile / Phone</h2>
          <p className="text-sm text-subtext0">
            Compact touch-optimized interface
          </p>
          <span className="mt-3 inline-block text-sm font-medium text-blue">
            Open on Phone →
          </span>
        </Link>
      </div>

      {session.user.role === "admin" && (
        <div className="mt-6">
          <Link
            href="/admin"
            className="block rounded bg-green px-4 py-2 text-center text-sm font-medium text-white hover:bg-green"
          >
            Admin Panel
          </Link>
        </div>
      )}
    </div>
  );
}
