import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";
import TypingTest from "@/components/TypingTest";

export default async function PcDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="mx-auto min-h-screen max-w-4xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold">Hear-VoIP Typing Test</h1>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-subtext0">{session.user.name}</span>
          <LogoutButton />
        </div>
      </div>

      <TypingTest />

      <div className="mt-8 rounded-lg border border-surface1 bg-surface0 p-4 text-sm text-yellow">
        <strong>Synced:</strong> Open{" "}
        <code className="rounded bg-surface1 px-1">/dashboard/mobile</code>{" "}
        on your phone. The green light activates when you type, and stats update
        in real-time.
      </div>
    </div>
  );
}
