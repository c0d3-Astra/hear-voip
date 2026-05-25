import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function Navbar() {
  const session = await getServerSession(authOptions);

  return (
    <nav className="flex items-center justify-between border-b border-surface1 px-6 py-3">
      <Link href="/" className="text-lg font-bold">
        Hear-VoIP
      </Link>
      <div className="flex items-center gap-4 text-sm">
        {session ? (
          <>
            <Link href="/dashboard" className="hover:underline">
              Dashboard
            </Link>
            {session.user.role === "admin" && (
              <Link href="/admin" className="hover:underline">
                Admin
              </Link>
            )}
          </>
        ) : (
          <>
            <Link href="/login" className="hover:underline">
              Login
            </Link>
            <Link href="/register" className="hover:underline">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
