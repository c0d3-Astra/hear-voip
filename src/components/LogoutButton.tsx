"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="w-full rounded bg-surface1 px-4 py-2 text-sm font-medium hover:bg-surface2"
    >
      Sign Out
    </button>
  );
}
