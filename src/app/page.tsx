import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <>
      <Navbar />
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <h1 className="mb-4 text-4xl font-bold">Welcome to Hear-VoIP</h1>
        <p className="mb-8 max-w-md text-subtext0">
          Voice over IP communication platform. Register or sign in to get
          started.
        </p>
        <div className="flex gap-4">
          <Link
            href="/register"
            className="rounded bg-blue px-6 py-3 text-sm font-medium text-white hover:bg-blue"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="rounded border border-surface1 px-6 py-3 text-sm font-medium hover:bg-surface0"
          >
            Sign In
          </Link>
        </div>
      </div>
    </>
  );
}
