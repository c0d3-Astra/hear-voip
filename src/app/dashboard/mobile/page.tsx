import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import MobileSync from "@/components/MobileSync";

export default async function MobileDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="mx-auto min-h-screen max-w-sm px-4 py-6">
      <div className="mb-6 text-center">
        <h1 className="text-xl font-bold">Hear-VoIP</h1>
        <p className="text-xs text-subtext0">{session.user.name} — Mobile</p>
      </div>

      <div className="rounded-lg border border-surface1 p-6 shadow-sm">
        <MobileSync />
      </div>

      <div className="mt-4 rounded-lg border border-surface1 bg-surface0 p-3 text-xs text-blue">
        Start typing on the PC dashboard. The indicator turns green and stats
        update live here.
      </div>
    </div>
  );
}
